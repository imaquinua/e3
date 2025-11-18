/**
 * Script de demostración del Sistema de Monitoreo de Performance
 *
 * Este script muestra cómo usar el sistema completo:
 * 1. Crear una campaña desde un ecosystem
 * 2. Crear publicaciones con diferentes formatos
 * 3. Agregar métricas de performance
 * 4. Ver cómo se generan recomendaciones automáticamente
 * 5. Resolver recomendaciones
 * 6. Crear nuevas versiones de creativos
 */

import db from '../server/models/database.js';
import { randomUUID } from 'crypto';
import decisionEngine from '../server/services/decisionEngine.js';

async function runDemo() {
  console.log('\n🚀 DEMO: Sistema de Monitoreo de Performance con Árbol de Decisión\n');
  console.log('=' .repeat(70));

  try {
    // 1. Obtener un ecosystem existente (o crear uno de prueba)
    console.log('\n📊 Paso 1: Buscando ecosystem existente...');
    const ecosystemResult = await db.execute({
      sql: 'SELECT * FROM ecosystems LIMIT 1',
      args: []
    });

    if (!ecosystemResult.rows || ecosystemResult.rows.length === 0) {
      console.log('❌ No hay ecosystems en la base de datos.');
      console.log('   Por favor, crea un ecosystem primero usando la aplicación.');
      return;
    }

    const ecosystem = ecosystemResult.rows[0];
    console.log(`✓ Ecosystem encontrado: ${ecosystem.product}`);

    // 2. Crear una campaña
    console.log('\n📢 Paso 2: Creando campaña...');
    const campaignId = randomUUID();
    const campaign = {
      id: campaignId,
      ecosystem_id: ecosystem.id,
      name: `Campaña Demo - ${ecosystem.product}`,
      status: 'active',
      start_date: Date.now(),
      end_date: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 días
      total_budget: 10000,
      spent_budget: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await db.execute({
      sql: `INSERT INTO campaigns
            (id, ecosystem_id, name, status, start_date, end_date, total_budget, spent_budget, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        campaign.id, campaign.ecosystem_id, campaign.name, campaign.status,
        campaign.start_date, campaign.end_date, campaign.total_budget,
        campaign.spent_budget, campaign.created_at, campaign.updated_at
      ]
    });
    console.log(`✓ Campaña creada: ${campaign.name}`);

    // 3. Crear publicaciones con diferentes escenarios
    console.log('\n📱 Paso 3: Creando publicaciones...');

    const publications = [
      {
        name: 'Video Facebook - VTR Bajo (necesita cambio de creativo)',
        platform: 'Facebook',
        format: 'Video',
        buy_type: 'CPM',
        duration: 30,
        objective: 'awareness',
        budget: 2000,
        metrics: {
          impressions: 10000,
          views: 500,      // VTR = 5% (< 10% = CRÍTICO)
          clicks: 50,
          conversions: 2,
          spend: 500
        }
      },
      {
        name: 'Carousel Instagram - Performance Moderado',
        platform: 'Instagram',
        format: 'Carousel',
        buy_type: 'CPC',
        duration: null,
        objective: 'leads',
        budget: 3000,
        metrics: {
          impressions: 15000,
          views: 3000,     // VTR = 20% (10-25% = OK)
          clicks: 200,     // CTR = 1.33% (> 1% = OK)
          conversions: 50,
          spend: 1500
        }
      },
      {
        name: 'Video YouTube - Excelente Performance',
        platform: 'YouTube',
        format: 'Video',
        buy_type: 'TrueView',
        duration: 60,
        objective: 'sales',
        budget: 5000,
        metrics: {
          impressions: 20000,
          views: 6000,     // VTR = 30% (> 25% = EXCELENTE)
          clicks: 800,     // CTR = 4% (> 3% = EXCELENTE)
          conversions: 200,
          spend: 2000
        }
      }
    ];

    const createdPubs = [];
    for (const pubData of publications) {
      const pubId = randomUUID();
      await db.execute({
        sql: `INSERT INTO publications
              (id, campaign_id, content_piece_id, name, status, platform, format, buy_type, duration, objective, budget, start_date, end_date, creative_version, parent_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          pubId, campaign.id, null, pubData.name, 'active', pubData.platform,
          pubData.format, pubData.buy_type, pubData.duration, pubData.objective,
          pubData.budget, campaign.start_date, campaign.end_date, 1, null,
          Date.now(), Date.now()
        ]
      });

      console.log(`  ✓ ${pubData.name}`);
      createdPubs.push({ id: pubId, ...pubData });
    }

    // 4. Agregar métricas de performance
    console.log('\n📈 Paso 4: Agregando métricas de performance...');

    for (const pub of createdPubs) {
      const metrics = pub.metrics;

      // Calcular métricas derivadas
      const vtr = (metrics.views / metrics.impressions) * 100;
      const ctr = (metrics.clicks / metrics.impressions) * 100;
      const cpm = (metrics.spend / metrics.impressions) * 1000;
      const cpc = metrics.spend / metrics.clicks;
      const cpa = metrics.spend / metrics.conversions;
      const engagement = ((metrics.clicks + metrics.views) / metrics.impressions) * 100;

      const metricId = randomUUID();
      await db.execute({
        sql: `INSERT INTO performance_metrics
              (id, publication_id, metric_date, impressions, views, clicks, conversions, spend, vtr, ctr, cpm, cpc, cpa, roas, engagement_rate, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          metricId, pub.id, Date.now(), metrics.impressions, metrics.views,
          metrics.clicks, metrics.conversions, metrics.spend, vtr, ctr, cpm,
          cpc, cpa, 0, engagement, Date.now()
        ]
      });

      console.log(`  ✓ Métricas agregadas para: ${pub.name}`);
      console.log(`    - VTR: ${vtr.toFixed(2)}% | CTR: ${ctr.toFixed(2)}% | CPA: $${cpa.toFixed(2)}`);
    }

    // 5. Evaluar campaña con motor de decisión
    console.log('\n🔍 Paso 5: Evaluando campaña con motor de decisión...');
    const evaluation = await decisionEngine.evaluateCampaign(campaign.id);

    console.log(`\n  Resultados de la evaluación:`);
    console.log(`  - Publicaciones evaluadas: ${evaluation.evaluatedCount}`);

    let totalRecommendations = 0;
    evaluation.results.forEach((result, index) => {
      const pub = createdPubs[index];
      const recCount = result.recommendationsCreated || 0;
      totalRecommendations += recCount;

      if (recCount > 0) {
        console.log(`\n  📢 ${pub.name}:`);
        console.log(`    - ${recCount} recomendación(es) generada(s)`);

        if (result.recommendations) {
          result.recommendations.forEach(rec => {
            const severityEmoji = rec.severity === 'critical' ? '🔴' :
                                 rec.severity === 'high' ? '🟠' :
                                 rec.severity === 'medium' ? '🟡' : '🔵';
            console.log(`    ${severityEmoji} ${rec.message}`);
            console.log(`      → Acción: ${rec.action_required}`);
          });
        }
      } else {
        console.log(`\n  ✅ ${pub.name}: Todo bien!`);
      }
    });

    // 6. Obtener estadísticas de recomendaciones
    console.log('\n📊 Paso 6: Estadísticas de recomendaciones...');
    const stats = await decisionEngine.getRecommendationStats(campaign.id);

    console.log(`\n  Total de recomendaciones: ${stats.total}`);
    console.log(`  - Críticas: ${stats.critical}`);
    console.log(`  - Alta prioridad: ${stats.high}`);
    console.log(`  - Media prioridad: ${stats.medium}`);
    console.log(`  - Baja prioridad: ${stats.low}`);

    // 7. Demostrar cómo crear nueva versión de creativo
    if (stats.critical > 0) {
      console.log('\n🎨 Paso 7: Creando nueva versión de creativo...');

      // Buscar la publicación con VTR bajo
      const criticalPub = createdPubs[0]; // Video Facebook con VTR bajo

      const newVersionId = randomUUID();
      await db.execute({
        sql: `INSERT INTO publications
              (id, campaign_id, content_piece_id, name, status, platform, format, buy_type, duration, objective, budget, start_date, end_date, creative_version, parent_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newVersionId, campaign.id, null, `${criticalPub.name} - v2`, 'active',
          criticalPub.platform, criticalPub.format, criticalPub.buy_type,
          criticalPub.duration, criticalPub.objective, criticalPub.budget,
          Date.now(), campaign.end_date, 2, criticalPub.id,
          Date.now(), Date.now()
        ]
      });

      // Pausar versión original
      await db.execute({
        sql: 'UPDATE publications SET status = ? WHERE id = ?',
        args: ['paused', criticalPub.id]
      });

      console.log(`  ✓ Nueva versión creada: ${criticalPub.name} - v2`);
      console.log(`  ✓ Versión original pausada`);
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ DEMO COMPLETADO\n');
    console.log(`📊 Dashboard URL: /campaign/${campaign.id}/performance`);
    console.log('\nPara ver el dashboard visual:');
    console.log(`1. Abre la aplicación en el navegador`);
    console.log(`2. Navega a: http://localhost:5173/campaign/${campaign.id}/performance`);
    console.log(`3. Verás el árbol interactivo con todas las publicaciones y recomendaciones\n`);

  } catch (error) {
    console.error('\n❌ Error en el demo:', error);
    throw error;
  }
}

// Ejecutar demo
runDemo()
  .then(() => {
    console.log('Demo ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error ejecutando demo:', error);
    process.exit(1);
  });
