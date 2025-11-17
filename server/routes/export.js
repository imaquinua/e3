import express from 'express';
import PDFDocument from 'pdfkit';
import db from '../models/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper to authenticate from query token or header
const authenticateExport = (req, res, next) => {
  try {
    // Try header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    // Try query parameter
    const queryToken = req.query.token;
    if (queryToken) {
      const decoded = jwt.verify(queryToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    throw new AppError('No token provided', 401);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token', 401));
    } else {
      next(error);
    }
  }
};

router.use(authenticateExport);

// Export ecosystem as JSON
router.get('/json/:ecosystemId', async (req, res, next) => {
  try {
    const ecosystemResult = await db.execute({
      sql: `
        SELECT e.*, p.user_id, p.name as project_name
        FROM ecosystems e
        JOIN projects p ON e.project_id = p.id
        WHERE e.id = ? AND p.user_id = ?
      `,
      args: [req.params.ecosystemId, req.user.userId]
    });
    const ecosystem = ecosystemResult.rows[0];

    if (!ecosystem) {
      throw new AppError('Ecosystem not found', 404);
    }

    const piecesResult = await db.execute({
      sql: `SELECT * FROM content_pieces WHERE ecosystem_id = ?`,
      args: [ecosystem.id]
    });
    const pieces = piecesResult.rows;

    const exportData = {
      ...ecosystem,
      distribution: JSON.parse(ecosystem.distribution),
      pains: ecosystem.pains ? ecosystem.pains.split('\n') : [],
      gains: ecosystem.gains ? ecosystem.gains.split('\n') : [],
      contentPieces: pieces,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ecosystem-${ecosystem.id}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// Export ecosystem as PDF
router.get('/pdf/:ecosystemId', async (req, res, next) => {
  try {
    const ecosystemResult = await db.execute({
      sql: `
        SELECT e.*, p.name as project_name
        FROM ecosystems e
        JOIN projects p ON e.project_id = p.id
        WHERE e.id = ? AND p.user_id = ?
      `,
      args: [req.params.ecosystemId, req.user.userId]
    });
    const ecosystem = ecosystemResult.rows[0];

    if (!ecosystem) {
      throw new AppError('Ecosystem not found', 404);
    }

    const piecesResult = await db.execute({
      sql: `SELECT * FROM content_pieces WHERE ecosystem_id = ? ORDER BY stage, score DESC`,
      args: [ecosystem.id]
    });
    const pieces = piecesResult.rows;

    const distribution = JSON.parse(ecosystem.distribution);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ecosystem-${ecosystem.id}.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(24).text('E³ Content Ecosystem', { align: 'center' });
    doc.moveDown();

    // Project Info
    doc.fontSize(12).text(`Proyecto: ${ecosystem.project_name}`);
    doc.text(`Producto: ${ecosystem.product}`);
    doc.text(`Objetivo: ${ecosystem.objective}`);
    doc.text(`Presupuesto: $${ecosystem.budget.toLocaleString()}`);
    doc.text(`Total de Piezas: ${ecosystem.total_pieces}`);
    doc.text(`ROAS Proyectado: ${ecosystem.projected_roas}x`);
    doc.text(`Timeframe: ${ecosystem.timeframe}`);
    doc.moveDown();

    // Distribution
    doc.fontSize(16).text('Distribución de Presupuesto', { underline: true });
    doc.fontSize(12);
    doc.text(`SEE: ${(distribution.see * 100).toFixed(0)}%`);
    doc.text(`THINK: ${(distribution.think * 100).toFixed(0)}%`);
    doc.text(`DO: ${(distribution.do * 100).toFixed(0)}%`);
    doc.text(`CARE: ${(distribution.care * 100).toFixed(0)}%`);
    doc.moveDown();

    // Content Pieces by Stage
    const stages = ['see', 'think', 'do', 'care'];

    for (const stage of stages) {
      const stagePieces = pieces.filter(p => p.stage === stage);
      if (stagePieces.length === 0) continue;

      doc.addPage();
      doc.fontSize(18).text(`Etapa: ${stage.toUpperCase()}`, { underline: true });
      doc.moveDown();

      stagePieces.forEach((piece, index) => {
        if (index > 0) doc.moveDown();

        doc.fontSize(14).text(piece.title, { bold: true });
        doc.fontSize(10);
        doc.text(`Tipo: ${piece.type}`);
        doc.text(`Descripción: ${piece.description}`);
        doc.text(`KPI: ${piece.kpi}`);
        doc.text(`Presupuesto: $${piece.budget.toLocaleString()}`);
        doc.text(`Canal: ${piece.channel}`);
        doc.text(`Formato: ${piece.format}`);
        doc.text(`Score: ${piece.score}%`);

        if (doc.y > 700) {
          doc.addPage();
        }
      });
    }

    // Footer
    doc.fontSize(8).text(
      `Generado con E³ Content Generator - ${new Date().toLocaleDateString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    next(error);
  }
});

export default router;
