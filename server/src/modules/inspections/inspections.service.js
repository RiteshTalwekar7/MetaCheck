import { v4 as uuidv4 } from 'uuid';
import { Inspection } from '../../models/Inspection.js';
import { Evidence } from '../../models/Evidence.js';
import { AuditLog } from '../../models/AuditLog.js';
import { getAIProvider } from '../../ai/aiProvider.js';
import { normalizeFacts } from '../../ai/normalizer.js';
import { evaluateCompliance } from '../../rules/index.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { isDbConnected } from '../../config/db.js';

// In-memory store for mock/offline fallback
const inMemoryInspections = new Map();
const inMemoryEvidence = new Map();

export async function createInspection(data, user) {
  const referenceNumber = data.referenceNumber || `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const inspectionData = {
    referenceNumber,
    officerId: user.id,
    officerName: user.name,
    establishmentName: data.establishmentName,
    location: data.location || 'Local Jurisdiction',
    commodityCategory: data.commodityCategory || 'General Packaged Commodity',
    notes: data.notes || '',
    status: 'DRAFT',
    evidence: [],
    extractionSnapshot: {},
    normalizedFacts: {},
    ruleEvaluations: [],
    summary: {
      overallStatus: 'UNKNOWN',
      score: 0,
      totalChecks: 10,
      resolvedChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      reviewChecks: 0,
      unknownChecks: 10,
    },
    auditTrail: [{
      action: 'INSPECTION_CREATED',
      performedBy: user.name,
      timestamp: new Date(),
      details: { establishmentName: data.establishmentName },
    }],
  };

  if (isDbConnected()) {
    const doc = await Inspection.create(inspectionData);
    return doc;
  }

  const id = `insp_${Date.now()}`;
  const inMemDoc = { _id: id, id, ...inspectionData, createdAt: new Date(), updatedAt: new Date() };
  inMemoryInspections.set(id, inMemDoc);
  return inMemDoc;
}

export async function uploadEvidence(inspectionId, files, user) {
  const inspection = await getInspectionById(inspectionId, user);
  if (!inspection) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Inspection not found', 404);
  }

  if (!files || files.length === 0) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'At least one image file is required', 400);
  }

  const uploadedEvidence = [];

  for (const file of files) {
    const evidenceId = `evi_${uuidv4().slice(0, 8)}`;
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const evidenceRecord = {
      evidenceId,
      inspectionId: inspection._id || inspection.id,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      base64Data,
      qualityAssessment: {
        status: 'GOOD',
        notes: null,
      },
    };

    if (isDbConnected()) {
      await Evidence.create(evidenceRecord);
    }
    inMemoryEvidence.set(evidenceId, evidenceRecord);

    const summaryEvidence = {
      evidenceId,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      quality: 'GOOD',
      uploadedAt: new Date(),
    };

    inspection.evidence.push(summaryEvidence);
    uploadedEvidence.push(summaryEvidence);
  }

  inspection.auditTrail.push({
    action: 'EVIDENCE_UPLOADED',
    performedBy: user.name,
    timestamp: new Date(),
    details: { count: files.length, files: uploadedEvidence.map(e => e.originalFilename) },
  });

  await saveInspection(inspection);
  return uploadedEvidence;
}

export async function getEvidenceById(inspectionId, evidenceId) {
  if (isDbConnected()) {
    const doc = await Evidence.findOne({ evidenceId });
    if (doc) return doc;
  }

  return inMemoryEvidence.get(evidenceId) || null;
}

export async function analyzeInspection(inspectionId, user) {
  const inspection = await getInspectionById(inspectionId, user);
  if (!inspection) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Inspection not found', 404);
  }

  if (!inspection.evidence || inspection.evidence.length === 0) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot run analysis without evidence images. Please upload product photos first.', 400);
  }

  // Load evidence with base64 data
  const fullEvidence = [];
  for (const e of inspection.evidence) {
    const full = await getEvidenceById(inspectionId, e.evidenceId);
    if (full) {
      fullEvidence.push(full);
    }
  }

  const aiProvider = getAIProvider();

  // 1. AI Extraction
  const extractionResult = await aiProvider.analyzeImages({
    images: fullEvidence,
    inspectionContext: {
      referenceNumber: inspection.referenceNumber,
      establishmentName: inspection.establishmentName,
      commodityCategory: inspection.commodityCategory,
    },
  });

  // 2. Normalization
  const normalized = normalizeFacts(extractionResult);

  // 3. Rule Evaluation
  const ruleResults = evaluateCompliance(normalized, extractionResult);

  // 4. Update Inspection Snapshot
  inspection.status = ruleResults.summary.overallStatus === 'FAIL' ? 'REVIEW_REQUIRED' : 'COMPLETED';
  inspection.extractionSnapshot = {
    schemaVersion: '1.0',
    extractedAt: new Date(),
    provider: aiProvider.name,
    model: aiProvider.modelName || 'mock-model-1.0',
    product: extractionResult.product,
    rawText: extractionResult.rawText,
    overallConfidence: extractionResult.overallConfidence,
  };
  inspection.normalizedFacts = normalized;
  inspection.ruleEvaluations = ruleResults.evaluations;
  inspection.summary = ruleResults.summary;
  inspection.ruleSetVersion = ruleResults.ruleSetVersion;

  inspection.auditTrail.push({
    action: 'AI_ANALYSIS_EXECUTED',
    performedBy: user.name,
    timestamp: new Date(),
    details: {
      provider: aiProvider.name,
      score: ruleResults.summary.score,
      overallStatus: ruleResults.summary.overallStatus,
    },
  });

  await saveInspection(inspection);

  return {
    analysisId: `anl_${Date.now()}`,
    status: inspection.status,
    extraction: inspection.extractionSnapshot,
    normalizedFacts: inspection.normalizedFacts,
    findings: inspection.ruleEvaluations,
    summary: inspection.summary,
  };
}

export async function listInspections(query = {}, user) {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const search = (query.search || '').trim().toLowerCase();
  const status = query.status;

  if (isDbConnected()) {
    const filter = {};
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { establishmentName: { $regex: search, $options: 'i' } },
        { commodityCategory: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const total = await Inspection.countDocuments(filter);
    const docs = await Inspection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      inspections: docs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // In-memory filtering
  let all = Array.from(inMemoryInspections.values()).reverse();
  if (search) {
    all = all.filter(i =>
      i.referenceNumber.toLowerCase().includes(search) ||
      i.establishmentName.toLowerCase().includes(search) ||
      (i.commodityCategory && i.commodityCategory.toLowerCase().includes(search))
    );
  }
  if (status) {
    all = all.filter(i => i.status === status);
  }

  const total = all.length;
  const paginated = all.slice((page - 1) * limit, page * limit);

  return {
    inspections: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getInspectionById(id, user) {
  if (isDbConnected()) {
    try {
      const doc = await Inspection.findById(id);
      if (doc) return doc;
    } catch (e) {}
  }

  return inMemoryInspections.get(id) || null;
}

export async function saveInspection(inspection) {
  if (isDbConnected() && inspection.save) {
    return inspection.save();
  }
  const id = inspection._id ? inspection._id.toString() : inspection.id;
  inspection.updatedAt = new Date();
  inMemoryInspections.set(id, inspection);
  return inspection;
}

