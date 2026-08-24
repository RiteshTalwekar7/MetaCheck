export function calculateComplianceScore(evaluations) {
  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let reviewChecks = 0;
  let unknownChecks = 0;
  let notApplicableChecks = 0;

  for (const item of evaluations) {
    totalChecks++;
    switch (item.status) {
      case 'PASS':
        passedChecks++;
        break;
      case 'FAIL':
        failedChecks++;
        break;
      case 'REVIEW':
        reviewChecks++;
        break;
      case 'UNKNOWN':
        unknownChecks++;
        break;
      case 'NOT_APPLICABLE':
        notApplicableChecks++;
        break;
    }
  }

  // Resolved checks = PASS + FAIL
  const resolvedChecks = passedChecks + failedChecks;
  const score = resolvedChecks > 0 ? Math.round((passedChecks / resolvedChecks) * 100) : 0;

  let overallStatus = 'PASS';
  if (failedChecks > 0) {
    overallStatus = 'FAIL';
  } else if (reviewChecks > 0 || unknownChecks > 0) {
    overallStatus = 'REVIEW';
  }

  return {
    overallStatus,
    score,
    totalChecks,
    resolvedChecks,
    passedChecks,
    failedChecks,
    reviewChecks,
    unknownChecks,
    notApplicableChecks,
  };
}

