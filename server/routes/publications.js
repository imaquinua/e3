import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createPublication,
  getPublicationsByCampaign,
  getPublicationById,
  updatePublication,
  deletePublication,
  updatePerformanceMetrics,
  evaluatePublication,
  resolveRecommendation,
  createCreativeVersion
} from '../controllers/publicationController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear publicación
router.post('/', createPublication);

// Obtener publicaciones por campaña
router.get('/campaign/:campaignId', getPublicationsByCampaign);

// Obtener publicación por ID (con métricas y recomendaciones)
router.get('/:id', getPublicationById);

// Actualizar publicación
router.put('/:id', updatePublication);

// Eliminar publicación
router.delete('/:id', deletePublication);

// Actualizar métricas de performance (auto-evalúa reglas)
router.post('/:publicationId/metrics', updatePerformanceMetrics);

// Evaluar publicación manualmente
router.post('/:id/evaluate', evaluatePublication);

// Resolver recomendación
router.post('/recommendations/:recommendationId/resolve', resolveRecommendation);

// Crear nueva versión de creativo
router.post('/:id/new-version', createCreativeVersion);

export default router;
