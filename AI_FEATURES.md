# Características del Agente de IA

## Resumen

Se ha integrado un agente de IA potenciado por **OpenAI GPT-4** al sistema E³ Content Generator, proporcionando análisis profundos, optimización inteligente y asistencia conversacional para la creación de estrategias de contenido.

## Características Implementadas

### 1. Análisis de Audiencia Inteligente

El agente de IA analiza profundamente la audiencia objetivo y genera:

- **Segmentos de audiencia** identificados con priorización
- **Psicografía del consumidor**: motivaciones, miedos, aspiraciones y valores
- **Comportamiento de compra**: factores de decisión y customer journey típico
- **Pain points y gains adicionales** no identificados inicialmente
- **Recomendaciones de messaging**: ángulo principal, tono de voz y mensajes clave

**Endpoint**: `POST /api/ai/chat` con contexto de audiencia

**Implementación**: `server/services/aiAgent.js` - función `analyzeAudience()`

---

### 2. Optimización de Presupuesto

El agente analiza la distribución de presupuesto propuesta y genera:

- **Distribución optimizada** basada en objetivo, industria y mejores prácticas
- **Razonamiento detallado** de por qué la distribución es óptima
- **Cambios sugeridos** por etapa (See-Think-Do-Care) con justificación
- **Riesgos identificados** en la estrategia propuesta
- **Oportunidades** para maximizar el ROI
- **Impacto esperado**: cambios proyectados en ROAS y conversión
- **Recomendaciones de canales** por etapa

**Implementación**: `server/services/aiAgent.js` - función `optimizeBudget()`

---

### 3. Insights Competitivos y de Mercado

El agente genera inteligencia de mercado incluyendo:

- **Tendencias del mercado** actuales con nivel de impacto y acciones recomendadas
- **Panorama competitivo**: madurez del mercado, nivel de competencia, barreras y oportunidades
- **Oportunidades de contenido** específicas con diferenciadores
- **Benchmarks de industria**: ROAS promedio, CPC, tasa de conversión
- **Recomendaciones estratégicas** priorizadas con impacto esperado e implementación
- **Señales de alerta** a considerar

**Implementación**: `server/services/aiAgent.js` - función `generateCompetitiveInsights()`

---

### 4. Asistente Conversacional

Widget de chat flotante que permite a los usuarios:

- Hacer preguntas sobre estrategia de marketing
- Obtener consejos sobre optimización de presupuesto
- Comprender mejor su audiencia
- Recibir recomendaciones personalizadas
- Consultar sobre el modelo See-Think-Do-Care

**Características del chat**:
- Historial de conversación
- Contexto del proyecto actual
- Respuestas en tiempo real
- Indicador de escritura
- Interfaz responsive

**Componente**: `client/src/components/AIChat.js`

**Endpoint**: `POST /api/ai/chat`

---

### 5. Mejora de Contenido

Generación automática de títulos y descripciones mejorados para piezas de contenido:

- Títulos específicos y atractivos
- Descripciones persuasivas
- CTAs recomendados
- Optimización por etapa del funnel

**Implementación**: `server/services/aiAgent.js` - función `enhanceContentPieces()`

---

## Integración en el Flujo de Trabajo

### Durante la Generación de Ecosistemas

Cuando un usuario crea un nuevo ecosistema:

1. Se genera el ecosistema base usando las reglas de negocio existentes
2. **Paralelamente**, el agente de IA analiza:
   - Audiencia objetivo
   - Optimización de presupuesto
   - Insights competitivos
3. Los insights se guardan en la base de datos (`ai_insights` table)
4. Se retornan junto con el ecosistema generado

**Ruta**: `POST /api/ecosystems` (modificada en `server/routes/ecosystems.js`)

### Visualización de Insights

En la página de resultados (`/results/:ecosystemId`):

- **Sección destacada** con insights del agente IA
- **Análisis de audiencia** con segmentos identificados
- **Optimización de presupuesto** con razonamiento y recomendaciones
- **Insights competitivos** con tendencias y estrategias

**Vista**: `client/src/views/ResultsView.js` - función `renderAIInsights()`

---

## Arquitectura Técnica

### Backend

**Servicios**:
- `server/services/openai.js` - Cliente y wrapper de OpenAI API
  - `generateCompletion()` - Generación de texto
  - `generateStructuredOutput()` - Generación de JSON estructurado
  - `streamCompletion()` - Streaming para chat

- `server/services/aiAgent.js` - Lógica del agente IA
  - Funciones especializadas por capacidad
  - Orquestación de múltiples análisis en paralelo
  - Manejo de errores y fallbacks

**Rutas**:
- `POST /api/ai/chat` - Chat con el asistente
- `GET /api/ai/insights/:ecosystemId` - Obtener insights de un ecosistema
- `GET /api/ai/health` - Estado del servicio de IA

**Base de Datos**:
```sql
CREATE TABLE ai_insights (
  id TEXT PRIMARY KEY,
  ecosystem_id TEXT NOT NULL,
  audience_analysis TEXT,
  budget_optimization TEXT,
  competitive_insights TEXT,
  enhanced_content TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (ecosystem_id) REFERENCES ecosystems(id) ON DELETE CASCADE
);
```

### Frontend

**Componentes**:
- `AIChat.js` - Widget de chat conversacional
- `ResultsView.js` - Vista mejorada con insights de IA

**Servicios**:
- `api.js` - Cliente HTTP actualizado con endpoints de IA

**Estilos**:
- `ai-chat.css` - Estilos del widget de chat

---

## Configuración

### Variables de Entorno

Agregar a `.env`:

```env
# AI/LLM Configuration
OPENAI_API_KEY=sk-...
```

### Costos y Optimización

**Modelo usado**: `gpt-4o` (GPT-4 Optimized)

**Optimizaciones implementadas**:
- Análisis en paralelo (reduce tiempo de espera)
- Límite de contenido mejorado (máximo 10 piezas)
- Historial de chat limitado (últimos 20 mensajes)
- Fallback gracioso si la API falla
- Caching potencial (pendiente de implementar)

**Estimación de costos por ecosistema**:
- Análisis de audiencia: ~$0.02-0.04
- Optimización de presupuesto: ~$0.02-0.04
- Insights competitivos: ~$0.03-0.05
- **Total por ecosistema**: ~$0.07-0.13

**Conversaciones de chat**: ~$0.01-0.03 por mensaje

---

## Uso

### 1. Crear un Ecosistema con IA

1. Navegar a un proyecto
2. Completar el formulario del generador
3. Hacer clic en "Generar Ecosistema"
4. Esperar la generación (puede tomar 10-15 segundos adicionales por el análisis de IA)
5. Ver los insights en la página de resultados

### 2. Usar el Chat Asistente

1. Hacer clic en el botón flotante de chat (esquina inferior derecha)
2. Escribir una pregunta sobre estrategia de marketing
3. Recibir respuesta personalizada del agente
4. Continuar la conversación con contexto

**Ejemplos de preguntas**:
- "¿Cómo puedo mejorar el ROAS de mi campaña?"
- "¿Qué canales recomiendas para mi audiencia?"
- "¿Cómo distribuyo mi presupuesto entre See-Think-Do-Care?"
- "¿Qué tipo de contenido funciona mejor en la etapa Think?"

### 3. Ver Insights Detallados

En la página de resultados:
- Scroll a la sección "Insights del Agente IA"
- Revisar:
  - Segmentos de audiencia identificados
  - Recomendaciones de optimización
  - Tendencias del mercado
  - Estrategias competitivas

---

## Próximas Mejoras (Roadmap)

### Corto Plazo
- [ ] Sistema de caché para reducir costos
- [ ] Rate limiting por usuario
- [ ] Métricas de uso del agente IA
- [ ] Exportar insights a PDF

### Mediano Plazo
- [ ] Análisis de competencia específica por URL
- [ ] Generación de calendarios de contenido
- [ ] Predicciones de performance
- [ ] A/B testing de estrategias

### Largo Plazo
- [ ] Fine-tuning de modelo específico para E³
- [ ] Integración con plataformas de ads (Meta, Google)
- [ ] Análisis de rendimiento en tiempo real
- [ ] Recomendaciones automáticas de optimización

---

## Troubleshooting

### El agente IA no está disponible

**Síntoma**: Mensaje "AI assistant not available" al crear ecosistemas

**Solución**:
1. Verificar que `OPENAI_API_KEY` está configurada en `.env`
2. Reiniciar el servidor
3. Verificar el estado con `GET /api/ai/health`

### Los insights no se muestran

**Síntoma**: Ecosistema creado pero sin insights de IA

**Posibles causas**:
1. Error en la API de OpenAI (verificar logs del servidor)
2. Límite de tasa excedido (verificar cuenta de OpenAI)
3. Timeout de la solicitud

**Solución**:
- Revisar logs del servidor para errores
- Verificar créditos de OpenAI
- Aumentar timeout si es necesario

### El chat no responde

**Síntoma**: Mensaje enviado pero sin respuesta

**Solución**:
1. Verificar conexión a internet
2. Verificar API key de OpenAI
3. Revisar console del navegador para errores
4. Verificar que el servidor está corriendo

---

## API Reference

### POST /api/ai/chat

Enviar mensaje al asistente conversacional.

**Request**:
```json
{
  "message": "¿Cómo optimizo mi presupuesto?",
  "conversationHistory": [
    { "role": "user", "content": "mensaje anterior" },
    { "role": "assistant", "content": "respuesta anterior" }
  ],
  "context": {
    "product": "SaaS CRM",
    "objective": "leads"
  }
}
```

**Response**:
```json
{
  "response": "Para optimizar tu presupuesto...",
  "timestamp": "2025-11-16T..."
}
```

### GET /api/ai/insights/:ecosystemId

Obtener insights de IA para un ecosistema específico.

**Response**:
```json
{
  "insights": {
    "audienceAnalysis": { ... },
    "budgetOptimization": { ... },
    "competitiveInsights": { ... },
    "enhancedContent": { ... },
    "generatedAt": "2025-11-16T..."
  }
}
```

### GET /api/ai/health

Verificar estado del servicio de IA.

**Response**:
```json
{
  "aiEnabled": true,
  "provider": "OpenAI",
  "model": "gpt-4o",
  "features": {
    "audienceAnalysis": true,
    "budgetOptimization": true,
    "competitiveInsights": true,
    "chatAssistant": true
  }
}
```

---

## Notas Técnicas

### Manejo de Errores

- Los errores de IA no bloquean la generación de ecosistemas
- Fallback gracioso: ecosistema se crea sin insights si la IA falla
- Logs detallados en servidor para debugging
- Mensajes de error user-friendly en el frontend

### Seguridad

- Autenticación JWT requerida para todos los endpoints de IA
- Validación de inputs con express-validator
- Sanitización de contenido generado
- Rate limiting aplicado

### Performance

- Análisis en paralelo (reduce tiempo de ~30s a ~10s)
- Caching de configuración de OpenAI
- Lazy loading del widget de chat
- Optimización de tokens en prompts

---

**Documentación creada**: 2025-11-16
**Versión**: 1.0.0
**Autor**: Claude Code
