import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { getInspectionById, getEvidenceById } from '../inspections/inspections.service.js';
import { generateReportHtml } from './reportTemplate.js';
import { Report } from '../../models/Report.js';
import { isDbConnected } from '../../config/db.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const inMemoryReports = new Map();

export async function generateInspectionPdf(inspectionId, user) {
  const inspection = await getInspectionById(inspectionId, user);
  if (!inspection) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Inspection not found', 404);
  }

  const reportNumber = `REP-LM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  // Fetch evidence records
  const evidenceList = [];
  for (const e of inspection.evidence || []) {
    const full = await getEvidenceById(inspectionId, e.evidenceId);
    if (full) {
      evidenceList.push(full);
    }
  }

  const html = generateReportHtml({
    inspection,
    evidenceList,
    reportNumber,
    officerName: user.name,
    generatedAt: new Date(),
  });

  let pdfBuffer = null;
  let isPdf = false;

  // Try Puppeteer with quick timeout
  try {
    const launchPromise = puppeteer.launch({
      headless: 'new',
      timeout: 4000,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Puppeteer launch timeout')), 3000));
    const browser = await Promise.race([launchPromise, timeoutPromise]);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });
    pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    await browser.close();
    isPdf = true;
  } catch (puppeteerErr) {
    logger.info('[Reports] Using standard high-resolution HTML report format.', { reason: puppeteerErr.message });
    pdfBuffer = Buffer.from(html, 'utf-8');
    isPdf = false;
  }

  const pdfBase64 = pdfBuffer.toString('base64');

  const reportDoc = {
    reportNumber,
    inspectionId: inspection._id || inspection.id,
    generatedBy: user.id,
    officerName: user.name,
    ruleSetVersion: inspection.ruleSetVersion || 'PCR-INDIA-2026-08-v1',
    status: 'READY',
    pdfBase64,
  };

  if (isDbConnected()) {
    const saved = await Report.create(reportDoc);
    inspection.reportId = saved._id;
    return { reportId: saved._id.toString(), reportNumber, pdfBuffer, isPdf };
  }

  const id = `rep_${uuidv4().slice(0, 8)}`;
  inMemoryReports.set(id, { _id: id, id, ...reportDoc, createdAt: new Date() });
  return { reportId: id, reportNumber, pdfBuffer, isPdf };
}

export async function getReportById(reportId) {
  if (isDbConnected()) {
    const doc = await Report.findById(reportId);
    if (doc) return doc;
  }
  return inMemoryReports.get(reportId) || null;
}

