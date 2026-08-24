import { getInspectionById, saveInspection } from './inspections.service.js';
import { evaluateCompliance } from '../../rules/index.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

export async function correctInspectionField(inspectionId, { fieldPath, value, unit, reason }, user) {
  const inspection = await getInspectionById(inspectionId, user);
  if (!inspection) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Inspection not found', 404);
  }

  if (!inspection.normalizedFacts) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot correct fields before analysis has been executed.', 400);
  }

  const oldVal = inspection.normalizedFacts[fieldPath];

  // Update fact with human revision
  if (fieldPath === 'netQuantity') {
    inspection.normalizedFacts.netQuantity = {
      raw: unit ? `${value} ${unit}` : value,
      value: parseFloat(value) || null,
      unit: unit || 'g',
      isStandardMetric: true,
      confidence: 1.0,
      isHumanCorrected: true,
    };
  } else if (fieldPath === 'mrp') {
    inspection.normalizedFacts.mrp = {
      raw: `₹ ${value} (Incl. of all taxes)`,
      value: parseFloat(value) || null,
      currency: 'INR',
      hasTaxesClause: true,
      confidence: 1.0,
      isHumanCorrected: true,
    };
  } else if (fieldPath === 'manufactureDate') {
    inspection.normalizedFacts.manufactureDate = {
      formatted: value,
      confidence: 1.0,
      isHumanCorrected: true,
    };
  } else {
    inspection.normalizedFacts[fieldPath] = value;
  }

  // Re-evaluate rules deterministically
  const reEvaluation = evaluateCompliance(inspection.normalizedFacts, inspection.extractionSnapshot);
  inspection.ruleEvaluations = reEvaluation.evaluations;
  inspection.summary = reEvaluation.summary;

  // Record audit trail
  inspection.auditTrail.push({
    action: 'FIELD_CORRECTION',
    performedBy: user.name,
    timestamp: new Date(),
    details: {
      fieldPath,
      previousValue: oldVal,
      newValue: value,
      unit,
      reason,
      newScore: reEvaluation.summary.score,
    },
  });

  await saveInspection(inspection);

  return {
    inspectionId: inspection._id || inspection.id,
    normalizedFacts: inspection.normalizedFacts,
    findings: inspection.ruleEvaluations,
    summary: inspection.summary,
  };
}

export async function finalizeInspectionReview(inspectionId, user) {
  const inspection = await getInspectionById(inspectionId, user);
  if (!inspection) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Inspection not found', 404);
  }

  inspection.status = 'FINALIZED';
  inspection.isReviewed = true;
  inspection.reviewedAt = new Date();

  inspection.auditTrail.push({
    action: 'INSPECTION_FINALIZED',
    performedBy: user.name,
    timestamp: new Date(),
    details: {
      finalScore: inspection.summary?.score || 0,
      overallStatus: inspection.summary?.overallStatus || 'UNKNOWN',
    },
  });

  await saveInspection(inspection);
  return inspection;
}

