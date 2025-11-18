# 📊 Sistema de Monitoreo de Performance con Árbol de Decisión

## Descripción General

Este sistema permite monitorear el rendimiento de tus campañas publicitarias en tiempo real, visualizando la estructura completa en un árbol interactivo y recibiendo **recomendaciones automáticas** basadas en reglas de decisión cuando las métricas no cumplen los objetivos.

## 🌟 Características Principales

### 1. **Visualización en Árbol Interactivo**
- Estructura jerárquica de Campaign → Publications → KPIs → Recomendaciones
- Codificación por colores según performance:
  - 🟢 Verde: Excelente (VTR > 25%)
  - 🟡 Amarillo: Aceptable (VTR 10-25%)
  - 🔴 Rojo: Crítico (VTR < 10%)
- Navegación expandible/colapsable
- Acciones rápidas en cada nodo

### 2. **Motor de Decisiones Automático**
Evalúa automáticamente las métricas contra reglas predefinidas:

| Métrica | Threshold | Acción |
|---------|-----------|--------|
| VTR < 10% | Crítico | Cambiar creativo |
| CTR < 1% | Alto | Optimizar targeting |
| CPA > $50 | Alto | Reducir presupuesto |
| ROAS < 2x | Alto | Revisar estrategia |
| Engagement < 2% | Medio | Cambiar formato |
| VTR > 25% | Positivo | Escalar presupuesto |
| ROAS > 5x | Positivo | Duplicar campaña |

### 3. **Sistema de Recomendaciones**
- Generación automática al actualizar métricas
- Clasificación por severidad: Critical, High, Medium, Low
- Acciones sugeridas específicas
- Tracking de recomendaciones resueltas

### 4. **Gestión de Versiones de Creativos**
- Crear nuevas versiones con un click
- Historial de versiones (v1, v2, v3...)
- Pausado automático de versión anterior
- Comparación de performance entre versiones

## 📋 Estructura de Datos

### Campaigns
```javascript
{
  id: string,
  ecosystem_id: string,
  name: string,
  status: 'draft' | 'active' | 'paused' | 'completed',
  start_date: timestamp,
  end_date: timestamp,
  total_budget: number,
  spent_budget: number
}
```

### Publications
```javascript
{
  id: string,
  campaign_id: string,
  name: string,
  platform: 'Facebook' | 'Instagram' | 'YouTube' | 'TikTok' | 'LinkedIn',
  format: 'Video' | 'Image' | 'Carousel' | 'Stories' | 'Reel',
  buy_type: 'CPM' | 'CPC' | 'CPV' | 'CPA',
  duration: number (segundos, para videos),
  objective: 'awareness' | 'leads' | 'sales' | 'retention',
  budget: number,
  creative_version: number,
  parent_id: string (para versiones)
}
```

### Performance Metrics
```javascript
{
  id: string,
  publication_id: string,
  metric_date: timestamp,
  impressions: number,
  views: number,
  clicks: number,
  conversions: number,
  spend: number,
  // Métricas calculadas automáticamente:
  vtr: number,           // (views / impressions) * 100
  ctr: number,           // (clicks / impressions) * 100
  cpm: number,           // (spend / impressions) * 1000
  cpc: number,           // spend / clicks
  cpa: number,           // spend / conversions
  roas: number,          // revenue / spend
  engagement_rate: number // ((clicks + views) / impressions) * 100
}
```

### Decision Rules
```javascript
{
  id: string,
  name: string,
  metric: 'vtr' | 'ctr' | 'cpa' | 'roas' | 'engagement_rate',
  operator: '<' | '>' | '<=' | '>=' | '==' | '!=',
  threshold: number,
  action: string,
  priority: 1 | 2 | 3,
  is_active: boolean
}
```

## 🚀 Guía de Uso

### 1. Crear una Campaña

```javascript
POST /api/campaigns
{
  "ecosystemId": "uuid",
  "name": "Campaña Q1 2025",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "totalBudget": 50000
}
```

### 2. Crear Publicaciones

```javascript
POST /api/publications
{
  "campaignId": "uuid",
  "name": "Video Awareness Facebook",
  "platform": "Facebook",
  "format": "Video",
  "buyType": "CPM",
  "duration": 30,
  "objective": "awareness",
  "budget": 10000,
  "startDate": "2025-01-01"
}
```

### 3. Actualizar Métricas

```javascript
POST /api/publications/{publicationId}/metrics
{
  "metricDate": "2025-01-15",
  "impressions": 100000,
  "views": 8000,
  "clicks": 1200,
  "conversions": 150,
  "spend": 2500
}
```

**Resultado:** El sistema automáticamente:
- Calcula VTR, CTR, CPA, etc.
- Evalúa contra reglas de decisión
- Genera recomendaciones si es necesario

### 4. Ver Dashboard

Navega a: `/campaign/{campaignId}/performance`

Verás:
- Árbol visual de toda la campaña
- Estadísticas agregadas
- Recomendaciones activas por severidad
- Métricas promedio de la campaña

### 5. Responder a Recomendaciones

#### Marcar como Resuelta
```javascript
POST /api/publications/recommendations/{recommendationId}/resolve
```

#### Crear Nueva Versión de Creativo
```javascript
POST /api/publications/{publicationId}/new-version
```

Esto:
- Crea una nueva publicación (v2)
- Pausa la versión anterior
- Mantiene el mismo presupuesto y configuración
- Permite comparar performance

## 🎨 Ejemplos de Uso

### Ejemplo 1: Campaña de Lanzamiento de Producto

```bash
# 1. Crear campaña
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ecosystemId": "eco-123",
    "name": "Lanzamiento iPhone 16",
    "totalBudget": 100000,
    "startDate": "2025-01-01",
    "endDate": "2025-02-28"
  }'

# 2. Crear publicación de video
curl -X POST http://localhost:3000/api/publications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp-123",
    "name": "Hero Video 30s",
    "platform": "YouTube",
    "format": "Video",
    "buyType": "CPV",
    "duration": 30,
    "objective": "awareness",
    "budget": 50000
  }'

# 3. Actualizar métricas después de 1 semana
curl -X POST http://localhost:3000/api/publications/pub-123/metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "impressions": 500000,
    "views": 50000,
    "clicks": 5000,
    "conversions": 250,
    "spend": 10000
  }'

# Resultado:
# VTR = 10% (en el límite)
# CTR = 1% (aceptable)
# CPA = $40 (bajo el threshold)
# No se generan recomendaciones críticas
```

### Ejemplo 2: Detectar y Corregir Performance Bajo

```javascript
// Métrica con VTR bajo
{
  "impressions": 100000,
  "views": 5000,      // VTR = 5% < 10%
  "clicks": 200,
  "conversions": 10,
  "spend": 2000
}

// El sistema automáticamente genera:
{
  "severity": "critical",
  "message": "VTR Bajo - Cambiar Creativo: VTR actual es 5.00%, threshold es 10.00%",
  "action_required": "Cambiar el creativo de la publicación por uno nuevo que capture mejor la atención"
}

// Acción del usuario:
// 1. Click en "Crear nueva versión"
// 2. El sistema crea pub-v2 y pausa pub-v1
// 3. Subir nuevo creativo
// 4. Monitorear nuevas métricas en 3-5 días
```

## 🛠 Ejecutar Demo

```bash
# Desde la raíz del proyecto
node scripts/demo-performance-system.js
```

Esto:
1. Crea una campaña de ejemplo
2. Crea 3 publicaciones con diferentes niveles de performance
3. Agrega métricas simuladas
4. Ejecuta el motor de decisión
5. Muestra recomendaciones generadas
6. Crea una nueva versión de creativo

## 📊 Métricas y Benchmarks

### Benchmarks por Plataforma

| Plataforma | VTR Promedio | CTR Promedio | CPA Promedio |
|------------|--------------|--------------|--------------|
| Facebook   | 15-20%       | 0.9-1.6%     | $20-$40      |
| Instagram  | 20-25%       | 1.2-2.0%     | $15-$35      |
| YouTube    | 25-35%       | 0.5-1.0%     | $30-$50      |
| TikTok     | 30-40%       | 1.5-3.0%     | $10-$25      |
| LinkedIn   | 10-15%       | 0.4-0.8%     | $50-$100     |

### Cómo Interpretar

- **VTR (View Through Rate):** % de personas que vieron el video completo
  - < 10%: Creativo débil
  - 10-25%: Aceptable
  - > 25%: Excelente

- **CTR (Click Through Rate):** % de personas que hicieron click
  - < 1%: Targeting o mensaje débil
  - 1-3%: Bueno
  - > 3%: Excelente

- **CPA (Cost Per Acquisition):** Costo por conversión
  - Depende del valor del producto
  - Regla general: CPA < 20% del valor de vida del cliente

- **ROAS (Return on Ad Spend):** Retorno por cada $ gastado
  - < 2x: No rentable
  - 2-5x: Rentable
  - > 5x: Muy rentable

## 🔧 Personalización

### Agregar Nueva Regla de Decisión

```sql
INSERT INTO decision_rules (
  id, name, description, metric, operator, threshold, action, priority, is_active, created_at, updated_at
) VALUES (
  'rule-custom-1',
  'CPM Alto - Ajustar Puja',
  'Si el CPM supera $30, ajustar estrategia de puja',
  'cpm',
  '>',
  30,
  'adjust_bid',
  2,
  1,
  NOW(),
  NOW()
);
```

### Modificar Thresholds

```javascript
// En server/models/seedDecisionRules.js
{
  name: 'VTR Bajo - Cambiar Creativo',
  metric: 'vtr',
  threshold: 15, // Cambiar de 10 a 15
  // ...
}
```

## 🐛 Troubleshooting

### Las recomendaciones no se generan

1. Verificar que las reglas estén activas:
```sql
SELECT * FROM decision_rules WHERE is_active = 1;
```

2. Verificar que las métricas existen:
```sql
SELECT * FROM performance_metrics WHERE publication_id = 'your-pub-id';
```

3. Ejecutar evaluación manual:
```bash
POST /api/publications/{publicationId}/evaluate
```

### El árbol no se visualiza

1. Verificar que el CSS esté cargado
2. Verificar consola del navegador
3. Verificar que la campaña tenga publicaciones

### Métricas no se calculan correctamente

Las métricas derivadas se calculan automáticamente al crear performance_metrics:
- VTR = (views / impressions) × 100
- CTR = (clicks / impressions) × 100
- CPA = spend / conversions

Si los valores base son 0, las métricas serán 0.

## 📚 Recursos Adicionales

- [Documentación de API](/docs/api.md)
- [Guía de Reglas de Decisión](/docs/decision-rules.md)
- [Best Practices de Performance](/docs/best-practices.md)

## 🤝 Contribuir

Para agregar nuevas métricas o reglas:

1. Actualizar schema en `server/models/database.js`
2. Agregar lógica en `server/services/decisionEngine.js`
3. Actualizar frontend en `client/src/components/PerformanceTree.js`
4. Documentar en este archivo

---

**Creado con** ❤️ **para optimizar campañas publicitarias con datos**
