import * as inspectionsService from './inspections.service.js';
import * as reviewService from './review.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function create(req, res, next) {
  try {
    const inspection = await inspectionsService.createInspection(req.body, req.user);
    return sendSuccess(res, { inspection }, 'Inspection draft created', 201);
  } catch (error) {
    next(error);
  }
}

export async function uploadEvidence(req, res, next) {
  try {
    const evidence = await inspectionsService.uploadEvidence(req.params.id, req.files, req.user);
    return sendSuccess(res, { evidence }, 'Evidence images uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getEvidenceImage(req, res, next) {
  try {
    const evidence = await inspectionsService.getEvidenceById(req.params.id, req.params.evidenceId);
    if (!evidence) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Evidence not found' } });
    }
    // Return base64 or buffer image
    const base64Data = evidence.base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    res.set('Content-Type', evidence.mimeType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(imgBuffer);
  } catch (error) {
    next(error);
  }
}

export async function analyze(req, res, next) {
  try {
    const analysis = await inspectionsService.analyzeInspection(req.params.id, req.user);
    return sendSuccess(res, analysis, 'Analysis and compliance evaluation completed');
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const result = await inspectionsService.listInspections(req.query, req.user);
    return sendSuccess(res, result.inspections, 'Inspections retrieved', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const inspection = await inspectionsService.getInspectionById(req.params.id, req.user);
    if (!inspection) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Inspection not found' } });
    }
    return sendSuccess(res, { inspection }, 'Inspection details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function reviewField(req, res, next) {
  try {
    const result = await reviewService.correctInspectionField(req.params.id, req.body, req.user);
    return sendSuccess(res, result, 'Field corrected and rule engine re-evaluated');
  } catch (error) {
    next(error);
  }
}

export async function finalizeReview(req, res, next) {
  try {
    const inspection = await reviewService.finalizeInspectionReview(req.params.id, req.user);
    return sendSuccess(res, { inspection }, 'Inspection marked as reviewed and finalized');
  } catch (error) {
    next(error);
  }
}

