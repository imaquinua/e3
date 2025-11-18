import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createCampaign,
  getCampaignsByEcosystem,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  evaluateCampaign,
  getCampaignRecommendationStats
} from '../controllers/campaignController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear campaña
router.post('/', createCampaign);

// Obtener campañas por ecosystem
router.get('/ecosystem/:ecosystemId', getCampaignsByEcosystem);

// Obtener campaña por ID
router.get('/:id', getCampaignById);

// Actualizar campaña
router.put('/:id', updateCampaign);

// Eliminar campaña
router.delete('/:id', deleteCampaign);

// Evaluar campaña con reglas de decisión
router.post('/:id/evaluate', evaluateCampaign);

// Obtener estadísticas de recomendaciones
router.get('/:id/recommendations/stats', getCampaignRecommendationStats);

export default router;
