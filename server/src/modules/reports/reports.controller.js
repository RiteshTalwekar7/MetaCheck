import * as reportsService from './reports.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function generateReport(req, res, next) {
  try {
    const result = await reportsService.generateInspectionPdf(req.params.id, req.user);
    return sendSuccess(res, {
      reportId: result.reportId,
      reportNumber: result.reportNumber,
      status: 'READY',
    }, 'Compliance PDF Report generated successfully');
  } catch (error) {
    next(error);
  }
}

export async function downloadReport(req, res, next) {
  try {
    const result = await reportsService.generateInspectionPdf(req.params.id, req.user);
    const filename = `MetaCheck-Report-${result.reportNumber}.pdf`;
    res.setHeader('Content-Type', result.isPdf ? 'application/pdf' : 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(result.pdfBuffer);
  } catch (error) {
    next(error);
  }
}

