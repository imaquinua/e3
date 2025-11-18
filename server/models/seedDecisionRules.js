import { randomUUID } from 'crypto';
import db from './database.js';

const defaultRules = [
  {
    id: randomUUID(),
    name: 'VTR Bajo - Cambiar Creativo',
    description: 'Si el VTR es menor al 10%, se debe cambiar el creativo',
    metric: 'vtr',
    operator: '<',
    threshold: 10,
    action: 'change_creative',
    priority: 1,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'CTR Bajo - Optimizar Targeting',
    description: 'Si el CTR es menor al 1%, se debe optimizar el targeting',
    metric: 'ctr',
    operator: '<',
    threshold: 1,
    action: 'optimize_targeting',
    priority: 2,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'CPA Alto - Reducir Presupuesto',
    description: 'Si el CPA es mayor al objetivo, reducir presupuesto o pausar',
    metric: 'cpa',
    operator: '>',
    threshold: 50,
    action: 'reduce_budget',
    priority: 1,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'ROAS Bajo - Revisar Estrategia',
    description: 'Si el ROAS es menor a 2, revisar estrategia completa',
    metric: 'roas',
    operator: '<',
    threshold: 2,
    action: 'review_strategy',
    priority: 1,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'Engagement Bajo - Cambiar Formato',
    description: 'Si el engagement rate es menor al 2%, cambiar formato',
    metric: 'engagement_rate',
    operator: '<',
    threshold: 2,
    action: 'change_format',
    priority: 2,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'CPM Alto - Ajustar Puja',
    description: 'Si el CPM es mayor a $20, ajustar estrategia de puja',
    metric: 'cpm',
    operator: '>',
    threshold: 20,
    action: 'adjust_bid',
    priority: 3,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'VTR Excelente - Escalar',
    description: 'Si el VTR es mayor al 25%, escalar presupuesto',
    metric: 'vtr',
    operator: '>',
    threshold: 25,
    action: 'scale_budget',
    priority: 1,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    id: randomUUID(),
    name: 'ROAS Alto - Duplicar Campaña',
    description: 'Si el ROAS es mayor a 5, duplicar campaña exitosa',
    metric: 'roas',
    operator: '>',
    threshold: 5,
    action: 'duplicate_campaign',
    priority: 1,
    is_active: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  }
];

export const seedDecisionRules = async () => {
  try {
    console.log('Seeding decision rules...');

    for (const rule of defaultRules) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO decision_rules
              (id, name, description, metric, operator, threshold, action, priority, is_active, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          rule.id,
          rule.name,
          rule.description,
          rule.metric,
          rule.operator,
          rule.threshold,
          rule.action,
          rule.priority,
          rule.is_active,
          rule.created_at,
          rule.updated_at
        ]
      });
    }

    console.log(`✓ Seeded ${defaultRules.length} decision rules`);
  } catch (error) {
    console.error('Error seeding decision rules:', error);
    throw error;
  }
};
