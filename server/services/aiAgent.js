// Import AI service based on environment configuration
import { generateCompletion as geminiCompletion, generateStructuredOutput as geminiStructured } from './gemini.js';
import { generateCompletion as openaiCompletion, generateStructuredOutput as openaiStructured } from './openai.js';

// Determine which AI provider to use
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Create wrapper functions that route to the correct provider
const generateCompletion = AI_PROVIDER === 'gemini' ? geminiCompletion : openaiCompletion;
const generateStructuredOutput = AI_PROVIDER === 'gemini' ? geminiStructured : openaiStructured;

/**
 * AI Agent for E³ Content Strategy
 * Provides intelligent analysis and recommendations
 */

/**
 * Analyze audience and generate deep insights
 */
export async function analyzeAudience({
  product,
  market,
  audience,
  pains = [],
  gains = [],
}) {
  const prompt = `Como experto en análisis de audiencia y psicología del consumidor, analiza profundamente la siguiente información:

**Producto/Servicio:** ${product}
**Mercado/Industria:** ${market || 'No especificado'}
**Audiencia objetivo:** ${audience || 'No especificada'}
**Pain Points identificados:** ${pains.length > 0 ? pains.join(', ') : 'No especificados'}
**Gains/Beneficios esperados:** ${gains.length > 0 ? gains.join(', ') : 'No especificados'}

Genera un análisis profundo en formato JSON con la siguiente estructura:
{
  "audienceSegments": [
    {
      "name": "Nombre del segmento",
      "description": "Descripción detallada",
      "size": "pequeño/mediano/grande",
      "priority": "alta/media/baja"
    }
  ],
  "psychographics": {
    "motivations": ["motivación 1", "motivación 2"],
    "fears": ["miedo 1", "miedo 2"],
    "aspirations": ["aspiración 1", "aspiración 2"],
    "values": ["valor 1", "valor 2"]
  },
  "buyingBehavior": {
    "decisionFactors": ["factor 1", "factor 2"],
    "typicalJourney": "descripción del journey típico",
    "averageDecisionTime": "tiempo estimado"
  },
  "additionalPains": ["pain point adicional 1", "pain point adicional 2"],
  "additionalGains": ["beneficio adicional 1", "beneficio adicional 2"],
  "recommendedMessaging": {
    "primaryAngle": "Ángulo principal de comunicación",
    "toneOfVoice": "Tono de voz recomendado",
    "keyMessages": ["mensaje 1", "mensaje 2"]
  }
}`;

  const systemPrompt = `Eres un experto en análisis de audiencia, segmentación de mercado y psicología del consumidor.
Generas insights profundos y accionables basados en datos demográficos, psicográficos y de comportamiento.
Siempre respondes en español con análisis detallados y prácticos.`;

  return await generateStructuredOutput({
    prompt,
    schema: 'audience_analysis',
    systemPrompt,
  });
}

/**
 * Optimize budget distribution based on context
 */
export async function optimizeBudget({
  objective,
  budget,
  product,
  market,
  audience,
  currentDistribution,
}) {
  const prompt = `Como experto en optimización de presupuestos de marketing digital, analiza y optimiza la siguiente estrategia:

**Objetivo de Marketing:** ${objective}
**Presupuesto Total:** $${budget}
**Producto/Servicio:** ${product}
**Mercado/Industria:** ${market || 'General'}
**Audiencia:** ${audience || 'Amplia'}

**Distribución actual propuesta (See-Think-Do-Care):**
- SEE (Descubrimiento): ${(currentDistribution.see * 100).toFixed(0)}% ($${(budget * currentDistribution.see).toFixed(0)})
- THINK (Consideración): ${(currentDistribution.think * 100).toFixed(0)}% ($${(budget * currentDistribution.think).toFixed(0)})
- DO (Conversión): ${(currentDistribution.do * 100).toFixed(0)}% ($${(budget * currentDistribution.do).toFixed(0)})
- CARE (Retención): ${(currentDistribution.care * 100).toFixed(0)}% ($${(budget * currentDistribution.care).toFixed(0)})

Basándote en:
1. El objetivo de marketing específico
2. La industria y competitividad del mercado
3. El tipo de producto/servicio
4. El presupuesto disponible
5. Mejores prácticas del sector

Genera una optimización en formato JSON:
{
  "optimizedDistribution": {
    "see": 0.35,
    "think": 0.30,
    "do": 0.25,
    "care": 0.10
  },
  "reasoning": "Explicación detallada de por qué esta distribución es óptima",
  "changes": [
    {
      "stage": "see",
      "change": "+5%",
      "reason": "razón del cambio"
    }
  ],
  "risks": ["riesgo 1", "riesgo 2"],
  "opportunities": ["oportunidad 1", "oportunidad 2"],
  "expectedImpact": {
    "roasChange": "+15%",
    "conversionChange": "+10%",
    "description": "descripción del impacto esperado"
  },
  "channelRecommendations": {
    "see": ["canal 1", "canal 2"],
    "think": ["canal 1", "canal 2"],
    "do": ["canal 1", "canal 2"],
    "care": ["canal 1", "canal 2"]
  }
}`;

  const systemPrompt = `Eres un experto en optimización de presupuestos de marketing digital y estrategia de medios.
Conoces profundamente el modelo See-Think-Do-Care y cómo aplicarlo en diferentes industrias.
Tus recomendaciones están basadas en datos, mejores prácticas y contexto específico del negocio.
Siempre respondes en español con análisis detallados y accionables.`;

  return await generateStructuredOutput({
    prompt,
    schema: 'budget_optimization',
    systemPrompt,
  });
}

/**
 * Generate competitive insights and market intelligence
 */
export async function generateCompetitiveInsights({
  product,
  market,
  audience,
  objective,
}) {
  const prompt = `Como experto en inteligencia competitiva y análisis de mercado, genera insights estratégicos para:

**Producto/Servicio:** ${product}
**Mercado/Industria:** ${market || 'General'}
**Audiencia objetivo:** ${audience || 'Amplia'}
**Objetivo:** ${objective}

Genera un análisis competitivo en formato JSON:
{
  "marketTrends": [
    {
      "trend": "Nombre de la tendencia",
      "description": "Descripción detallada",
      "impact": "alto/medio/bajo",
      "actionableInsight": "Cómo aprovecharla"
    }
  ],
  "competitiveLandscape": {
    "marketMaturity": "emergente/crecimiento/maduro/declive",
    "competitionLevel": "bajo/medio/alto",
    "barriers": ["barrera 1", "barrera 2"],
    "opportunities": ["oportunidad 1", "oportunidad 2"]
  },
  "contentOpportunities": [
    {
      "type": "Tipo de contenido",
      "rationale": "Por qué es una oportunidad",
      "differentiator": "Qué lo hace único",
      "stage": "see/think/do/care"
    }
  ],
  "benchmarks": {
    "averageROAS": "3.5x",
    "averageCPC": "$1.20",
    "averageConversionRate": "2.5%",
    "source": "Benchmarks de la industria"
  },
  "strategicRecommendations": [
    {
      "recommendation": "Recomendación específica",
      "priority": "alta/media/baja",
      "expectedImpact": "descripción del impacto",
      "implementation": "cómo implementarla"
    }
  ],
  "warningFlags": [
    "Punto de atención 1",
    "Punto de atención 2"
  ]
}`;

  const systemPrompt = `Eres un experto en inteligencia competitiva, análisis de mercado y estrategia de contenido.
Tienes conocimiento profundo de múltiples industrias y tendencias actuales del marketing digital.
Generas insights accionables basados en análisis de mercado, comportamiento del consumidor y mejores prácticas.
Siempre respondes en español con recomendaciones estratégicas y prácticas.`;

  return await generateStructuredOutput({
    prompt,
    schema: 'competitive_insights',
    systemPrompt,
  });
}

/**
 * Enhance content pieces with AI-generated titles and descriptions
 */
export async function enhanceContentPieces({
  pieces,
  product,
  valueProp,
  audience,
  pains,
  gains,
}) {
  const prompt = `Como experto en copywriting y content marketing, mejora los siguientes contenidos para el producto "${product}":

**Propuesta de valor:** ${valueProp || 'No especificada'}
**Audiencia:** ${audience || 'General'}
**Pain Points:** ${pains?.join(', ') || 'No especificados'}
**Beneficios:** ${gains?.join(', ') || 'No especificados'}

**Piezas de contenido a mejorar:**
${JSON.stringify(pieces, null, 2)}

Genera títulos y descripciones mejorados para cada pieza en formato JSON:
{
  "enhancedPieces": [
    {
      "originalType": "tipo de contenido",
      "enhancedTitle": "Título mejorado y atractivo",
      "enhancedDescription": "Descripción detallada y persuasiva",
      "ctaRecommendation": "Call-to-action recomendado"
    }
  ]
}

Los títulos deben ser:
- Específicos y atractivos
- Incluir el pain point o gain cuando sea relevante
- Usar números o datos cuando sea posible
- Generar curiosidad o urgencia cuando sea apropiado
- Estar optimizados para cada etapa del funnel`;

  const systemPrompt = `Eres un experto en copywriting, content marketing y persuasión.
Creas títulos y descripciones que convierten, generan engagement y están optimizados para cada etapa del customer journey.
Entiendes profundamente el modelo See-Think-Do-Care y adaptas el mensaje según la intención del usuario.
Siempre respondes en español con contenido profesional y persuasivo.`;

  return await generateStructuredOutput({
    prompt,
    schema: 'enhanced_content',
    systemPrompt,
  });
}

/**
 * Conversational AI assistant for strategy questions
 */
export async function chatAssistant({
  message,
  conversationHistory = [],
  context = {},
}) {
  const contextStr = Object.keys(context).length > 0
    ? `\n\n**Contexto del proyecto actual:**\n${JSON.stringify(context, null, 2)}`
    : '';

  const systemPrompt = `Eres un asistente experto en estrategia de marketing de contenidos y métricas digitales, especializado en el modelo E³ (See-Think-Do-Care).

Tu MISIÓN es EDUCAR y CLARIFICAR. Ayudas a usuarios a:

1. **Entender sus métricas**: Explicas qué significa cada KPI y por qué importa
2. **Tomar decisiones basadas en datos**: Conectas métricas con acciones estratégicas
3. **Optimizar presupuestos**: Guías hacia la distribución óptima de recursos
4. **Construir estrategias**: Desarrollas ecosistemas de contenido que conviertan
5. **Identificar problemas**: Enseñas a leer las señales de alerta en las métricas

Cuando hables de MÉTRICAS, SIEMPRE explicas:
- **Qué es**: Definición clara y simple
- **Por qué importa**: Conexión con objetivos de negocio
- **Cómo se mide**: Fórmula o método de cálculo
- **Qué hacer con el dato**: Acciones basadas en el resultado

EJEMPLOS de cómo explicar métricas:

**VTR (View Through Rate)**
"El VTR mide cuántos usuarios ven tu video completo vs las impresiones. Es CRÍTICO porque te dice si tu contenido es relevante. Un VTR bajo (<15%) indica que tu hook inicial no captura atención o la segmentación está mal. Un VTR alto (>30%) significa que tu mensaje resuena y debes escalar ese creativo."

**CTR (Click Through Rate)**
"El CTR te dice si tu anuncio está bien construido. Es el % de personas que hacen clic vs impresiones. Si tu CTR es bajo (<1%), puede indicar que tu copy no es convincente, tu imagen no llama la atención, o estás targeting a la audiencia equivocada. Un CTR alto (>3%) significa que tu mensaje-mercado fit es bueno."

**Tiempo de Permanencia**
"Mide cuánto tiempo pasan en tu sitio. Más de 2-3 minutos indica interés real. Menos de 30 segundos = problema de relevancia: o tu tráfico viene de fuentes incorrectas o tu landing page no cumple la promesa del anuncio."

**Tasa de Rebote**
"% de usuarios que abandonan sin interactuar. Alta tasa de rebote (>70%) = desconexión entre expectativa y realidad. Pueden estar llegando desde keywords incorrectas o tu página no entrega lo prometido."

Tus respuestas son:
- EDUCATIVAS: Explicas el "por qué" detrás de cada recomendación
- PRÁCTICAS: Das acciones específicas, no teoría vaga
- CLARAS: Usas analogías y ejemplos cuando sea útil
- ESTRATÉGICAS: Conectas métricas con objetivos de negocio
- EN ESPAÑOL: Profesional pero accesible

Cuando sea relevante, haces referencia al modelo See-Think-Do-Care y las métricas específicas de cada etapa.${contextStr}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: message },
  ];

  const response = await generateCompletion({
    messages,
    temperature: 0.8,
    maxTokens: 1500,
  });

  return response;
}

/**
 * Generate KPI education and strategic guidance
 */
export async function generateKPIGuidance({
  objective,
  product,
  currentDistribution,
}) {
  const prompt = `Como experto en métricas de marketing digital y optimización de campañas, genera una guía educativa completa sobre KPIs para esta estrategia:

**Objetivo de Marketing:** ${objective}
**Producto/Servicio:** ${product}
**Distribución del presupuesto:**
- SEE (Descubrimiento): ${(currentDistribution.see * 100).toFixed(0)}%
- THINK (Consideración): ${(currentDistribution.think * 100).toFixed(0)}%
- DO (Conversión): ${(currentDistribution.do * 100).toFixed(0)}%
- CARE (Retención): ${(currentDistribution.care * 100).toFixed(0)}%

Genera una guía educativa en formato JSON que explique:

1. **KPIs por etapa del funnel** (See-Think-Do-Care)
2. **Por qué importa cada métrica** y qué insights proporciona
3. **Valores de referencia (benchmarks)** para cada KPI
4. **Señales de alerta** (qué indicaría que algo no funciona)
5. **Acciones correctivas** basadas en los KPIs

Formato JSON:
{
  "kpisByStage": {
    "see": [
      {
        "name": "VTR (View Through Rate)",
        "description": "Porcentaje de usuarios que vieron el video completo o una parte significativa",
        "whyItMatters": "El VTR te indica si tu contenido es relevante y captó la atención de tu audiencia. Un VTR alto significa que tu mensaje resonó y que la segmentación fue correcta.",
        "howToMeasure": "VTR = (Visualizaciones completas / Impresiones) × 100",
        "benchmark": "25-35% para videos de awareness",
        "goodRange": "> 30%",
        "warningRange": "15-25%",
        "poorRange": "< 15%",
        "warningSignals": [
          "VTR < 15%: Tu video no está captando atención, revisa el hook inicial",
          "VTR en descenso: La fatiga de anuncio está aumentando, refresca creativos"
        ],
        "actionableInsights": [
          "VTR alto + CTR bajo: El contenido es interesante pero falta CTA claro",
          "VTR bajo en primeros 3s: Mejora el hook de apertura",
          "VTR alto en segmento específico: Duplica presupuesto en esa audiencia"
        ]
      }
    ],
    "think": [],
    "do": [],
    "care": []
  },
  "crossStageMetrics": [
    {
      "name": "Tiempo de Permanencia en Web",
      "description": "Tiempo promedio que un usuario pasa en tu sitio web",
      "whyItMatters": "Indica el nivel de interés y engagement. Un tiempo alto sugiere que el contenido es relevante y el usuario está explorando seriamente.",
      "benchmark": "2-3 minutos para sitios de consideración",
      "signals": {
        "positive": ["Tiempo > 3 min", "Múltiples páginas visitadas"],
        "negative": ["Tiempo < 30 seg", "Alta tasa de rebote"]
      }
    }
  ],
  "strategicDashboard": {
    "primaryKPIs": ["Lista de 3-5 KPIs principales para este objetivo"],
    "secondaryKPIs": ["KPIs de soporte"],
    "measurementCadence": "Con qué frecuencia revisar cada métrica",
    "successCriteria": "Qué indica que la estrategia está funcionando"
  },
  "educationalTips": [
    {
      "title": "Tip educativo 1",
      "content": "Explicación práctica",
      "example": "Ejemplo real"
    }
  ]
}

IMPORTANTE: Incluye explicaciones para:
- VTR (View Through Rate) - crítico para videos
- CTR (Click Through Rate) - para construcción de anuncios
- Tiempo de permanencia - para engagement
- Tasa de rebote - para relevancia de landing
- CPM, CPC, CPA según la etapa
- Engagement rate, ROAS, LTV

Cada explicación debe ser clara, práctica y orientada a acción.`;

  const systemPrompt = `Eres un experto en métricas de marketing digital y analítica de campañas.
Tu objetivo es EDUCAR al usuario sobre qué medir, por qué importa, y cómo tomar decisiones basadas en datos.
Proporcionas explicaciones claras, prácticas y accionables que ayudan a los marketers a entender su estrategia.
Usas analogías cuando sea útil y siempre conectas métricas con objetivos de negocio.
Respondes en español con un tono profesional pero accesible.`;

  return await generateStructuredOutput({
    prompt,
    schema: 'kpi_guidance',
    systemPrompt,
  });
}

/**
 * Generate comprehensive AI insights for an ecosystem
 * This is the main function that orchestrates all AI capabilities
 */
export async function generateEcosystemInsights({
  objective,
  budget,
  product,
  market,
  audience,
  valueProp,
  pains,
  gains,
  currentDistribution,
  pieces,
}) {
  try {
    // Run all analyses in parallel for better performance
    const [audienceAnalysis, budgetOptimization, competitiveInsights, kpiGuidance] = await Promise.all([
      analyzeAudience({ product, market, audience, pains, gains }),
      optimizeBudget({ objective, budget, product, market, audience, currentDistribution }),
      generateCompetitiveInsights({ product, market, audience, objective }),
      generateKPIGuidance({ objective, product, currentDistribution }),
    ]);

    // Enhance content pieces if provided
    let enhancedContent = null;
    if (pieces && Object.keys(pieces).length > 0) {
      const allPieces = Object.values(pieces).flat().slice(0, 10); // Limit to first 10 for cost optimization
      enhancedContent = await enhanceContentPieces({
        pieces: allPieces,
        product,
        valueProp,
        audience,
        pains,
        gains,
      });
    }

    return {
      audienceAnalysis,
      budgetOptimization,
      competitiveInsights,
      kpiGuidance,
      enhancedContent,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
}
