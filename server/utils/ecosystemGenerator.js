// E³ Model Templates and Configuration
const E3_TEMPLATES = {
  see: {
    maslow: 'Necesidades Básicas',
    kpis: ['Alcance', 'Impresiones', 'CPM', 'Brand Awareness'],
    channels: ['Meta Ads', 'Google Display', 'TikTok', 'YouTube'],
    formats: ['Video 15s', 'Carousel', 'Single Image', 'Stories'],
    buyingMoment: 'Descubrimiento pasivo',
    contentTypes: [
      {
        type: 'Hero Video',
        description: 'Video emocional de marca que conecta con el problema',
        kpi: 'Views + Reach',
        budgetPercent: 15,
      },
      {
        type: 'Problem Agitation',
        description: 'Contenido que evidencia el pain point principal',
        kpi: 'Engagement Rate',
        budgetPercent: 10,
      },
      {
        type: 'Category Education',
        description: 'Contenido educativo sobre la categoría',
        kpi: 'Time Spent',
        budgetPercent: 8,
      },
      {
        type: 'Trend Jacking',
        description: 'Contenido que aprovecha tendencias actuales',
        kpi: 'Shares',
        budgetPercent: 7,
      },
    ],
  },
  think: {
    maslow: 'Seguridad + Pertenencia',
    kpis: ['CTR', 'Engagement', 'Add to Cart', 'Brand Search', 'Time on Site'],
    channels: ['Google Search', 'Meta Retargeting', 'LinkedIn', 'Email'],
    formats: ['Blog Post', 'Webinar', 'Case Study', 'Comparison Chart'],
    buyingMoment: 'Investigación activa',
    contentTypes: [
      {
        type: 'Social Proof',
        description: 'Testimonios y casos de éxito de clientes similares',
        kpi: 'Trust Score',
        budgetPercent: 12,
      },
      {
        type: 'Product Demo',
        description: 'Demostración detallada de características clave',
        kpi: 'Demo Requests',
        budgetPercent: 15,
      },
      {
        type: 'Comparison Content',
        description: 'Comparativas vs competencia y alternativas',
        kpi: 'Consideration Rate',
        budgetPercent: 10,
      },
      {
        type: 'Authority Content',
        description: 'Whitepapers y estudios que posicionan expertise',
        kpi: 'Download Rate',
        budgetPercent: 8,
      },
      {
        type: 'Community Building',
        description: 'Contenido que construye sentido de tribu',
        kpi: 'Community Join',
        budgetPercent: 10,
      },
    ],
  },
  do: {
    maslow: 'Autoestima',
    kpis: ['Conversion Rate', 'ROAS', 'CPA', 'AOV', 'Cart Completion'],
    channels: ['Google Shopping', 'Meta DPA', 'Email Automation', 'SMS'],
    formats: ['Landing Page', 'Offer Email', 'Retargeting Ad', 'Cart Recovery'],
    buyingMoment: 'Decisión de compra',
    contentTypes: [
      {
        type: 'Limited Offer',
        description: 'Ofertas con urgencia temporal o de inventario',
        kpi: 'Conversion Rate',
        budgetPercent: 20,
      },
      {
        type: 'Risk Reversal',
        description: 'Garantías y pruebas gratuitas',
        kpi: 'Trial Starts',
        budgetPercent: 15,
      },
      {
        type: 'Bundle Deal',
        description: 'Paquetes de valor agregado',
        kpi: 'AOV Increase',
        budgetPercent: 12,
      },
      {
        type: 'Abandonment Recovery',
        description: 'Secuencias de recuperación de carritos',
        kpi: 'Recovery Rate',
        budgetPercent: 10,
      },
    ],
  },
  care: {
    maslow: 'Autorrealización',
    kpis: ['LTV', 'NPS', 'Retention Rate', 'Referral Rate', 'Upsell Rate'],
    channels: ['Email', 'In-App', 'Community', 'WhatsApp'],
    formats: ['Newsletter', 'Tutorial', 'Exclusive Content', 'Loyalty Program'],
    buyingMoment: 'Post-compra y advocacy',
    contentTypes: [
      {
        type: 'Onboarding Sequence',
        description: 'Serie de contenidos para maximizar adopción',
        kpi: 'Activation Rate',
        budgetPercent: 10,
      },
      {
        type: 'Success Content',
        description: 'Contenido para ayudar a alcanzar objetivos',
        kpi: 'Product Usage',
        budgetPercent: 8,
      },
      {
        type: 'VIP Program',
        description: 'Beneficios exclusivos para mejores clientes',
        kpi: 'LTV Increase',
        budgetPercent: 12,
      },
      {
        type: 'Referral Campaign',
        description: 'Programa de referidos con incentivos',
        kpi: 'Referral Rate',
        budgetPercent: 15,
      },
      {
        type: 'Co-creation',
        description: 'Contenido creado con la comunidad',
        kpi: 'Advocacy Score',
        budgetPercent: 5,
      },
    ],
  },
};

// Budget distribution by objective
const BUDGET_DISTRIBUTIONS = {
  lanzamiento: { see: 0.35, think: 0.30, do: 0.25, care: 0.10 },
  awareness: { see: 0.45, think: 0.30, do: 0.15, care: 0.10 },
  leads: { see: 0.20, think: 0.40, do: 0.30, care: 0.10 },
  ventas: { see: 0.15, think: 0.25, do: 0.45, care: 0.15 },
  retencion: { see: 0.10, think: 0.15, do: 0.25, care: 0.50 },
  advocacy: { see: 0.05, think: 0.15, do: 0.20, care: 0.60 },
};

/**
 * Generate content title based on type and data
 */
function generateTitle(type, data) {
  const templates = {
    'Hero Video': `${data.product}: La revolución que esperabas`,
    'Problem Agitation': `¿Cansado de ${data.pains?.[0] || 'los problemas actuales'}?`,
    'Social Proof': `Cómo ${data.market || 'empresas'} están transformando su ${data.product}`,
    'Product Demo': `${data.product} en acción: Tutorial completo`,
    'Limited Offer': `48 horas: ${data.valueProp || data.product}`,
    'Onboarding Sequence': `Bienvenido a ${data.product}: Primeros pasos`,
    'VIP Program': `Club exclusivo ${data.product}: Beneficios premium`,
    'Referral Campaign': `Comparte ${data.product} y gana`,
    'Category Education': `Guía definitiva de ${data.product}`,
    'Comparison Content': `${data.product} vs. La competencia`,
    'Authority Content': `Estudio: El futuro de ${data.market || 'tu industria'}`,
    'Community Building': `Únete a la comunidad ${data.product}`,
    'Risk Reversal': `Prueba ${data.product} sin riesgo por 30 días`,
    'Bundle Deal': `Pack completo ${data.product}: Ahorra 40%`,
    'Abandonment Recovery': `Tu ${data.product} te está esperando`,
    'Success Content': `Maximiza tu ROI con ${data.product}`,
    'Co-creation': `Creado con nuestra comunidad`,
    'Trend Jacking': `${data.product} x Tendencia del momento`,
  };

  return templates[type] || `${type}: ${data.product}`;
}

/**
 * Generate content pieces for a stage
 */
function generateStagePieces(stage, stageBudget, data) {
  const template = E3_TEMPLATES[stage];
  const pieces = [];

  template.contentTypes.forEach((contentType) => {
    const pieceBudget = (stageBudget * contentType.budgetPercent) / 100;
    const numPieces = Math.max(1, Math.floor(pieceBudget / 500)); // Minimum $500 per piece

    for (let i = 0; i < numPieces; i++) {
      const randomPain = data.pains?.length > 0
        ? data.pains[Math.floor(Math.random() * data.pains.length)]
        : null;

      const randomGain = data.gains?.length > 0
        ? data.gains[Math.floor(Math.random() * data.gains.length)]
        : null;

      pieces.push({
        type: contentType.type,
        title: generateTitle(contentType.type, data),
        description: contentType.description,
        kpi: contentType.kpi,
        budget: Math.floor(pieceBudget / numPieces),
        channel: template.channels[Math.floor(Math.random() * template.channels.length)],
        format: template.formats[Math.floor(Math.random() * template.formats.length)],
        score: 70 + Math.floor(Math.random() * 25), // 70-94
        pain: randomPain,
        gain: randomGain,
      });
    }
  });

  return pieces;
}

/**
 * Calculate projected ROAS based on objective and budget
 */
function calculateROAS(objective, budget) {
  const baseROAS = {
    lanzamiento: 2.5,
    awareness: 1.8,
    leads: 3.2,
    ventas: 4.5,
    retencion: 5.2,
    advocacy: 6.0,
  };

  // Adjust based on budget (economies of scale)
  const budgetMultiplier = Math.min(1.5, 1 + (budget / 50000) * 0.5);

  return (baseROAS[objective] || 3.0) * budgetMultiplier;
}

/**
 * Calculate timeframe based on objective and budget
 */
function calculateTimeframe(objective, budget) {
  if (budget < 5000) return '30 días';
  if (budget < 20000) return '60 días';
  return '90 días';
}

/**
 * Main ecosystem generator function
 */
export function generateEcosystem(data) {
  const {
    objective,
    budget,
    product,
    market,
    audience,
    valueProp,
    pains = [],
    gains = [],
  } = data;

  // Get budget distribution
  const distribution = BUDGET_DISTRIBUTIONS[objective] || BUDGET_DISTRIBUTIONS.lanzamiento;

  // Generate content pieces for each stage
  const pieces = {
    see: generateStagePieces('see', budget * distribution.see, data),
    think: generateStagePieces('think', budget * distribution.think, data),
    do: generateStagePieces('do', budget * distribution.do, data),
    care: generateStagePieces('care', budget * distribution.care, data),
  };

  // Calculate metrics
  const totalPieces = Object.values(pieces).reduce((sum, arr) => sum + arr.length, 0);
  const projectedRoas = calculateROAS(objective, budget);
  const timeframe = calculateTimeframe(objective, budget);

  return {
    distribution,
    pieces,
    totalPieces,
    projectedRoas: parseFloat(projectedRoas.toFixed(1)),
    timeframe,
    channels: [...new Set(Object.values(pieces).flat().map(p => p.channel))].length,
  };
}
