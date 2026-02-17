/**
 * Servicio de pruebas para el motor de recomendaciones semánticas
 * Valida la precisión y performance del sistema
 */

import { santuarioDataset, getSantuarioRecommendations } from './santuarioDataset.js';
import { getBookRecommendations } from './semanticRecommender.js';

/**
 * Test case: "Historia Romana" → recomienda "Vida en la antigua Grecia"
 */
export const testRomanHistoryRecommendation = async () => {
  console.log('🔍 Iniciando test: "Historia Romana" → "Vida en la antigua Grecia"');

  const romanHistoryBook = santuarioDataset.find(book => book.title === "Historia Romana");
  const ancientGreeceBook = santuarioDataset.find(book => book.title === "Vida en la Antigua Grecia");

  if (!romanHistoryBook || !ancientGreeceBook) {
    console.error('❌ Libros de test no encontrados en el dataset');
    return { success: false, error: 'Libros de test no encontrados' };
  }

  console.log(`📚 Libro fuente: "${romanHistoryBook.title}"`);
  console.log(`🎯 Objetivo esperado: "${ancientGreeceBook.title}"`);

  // Test 1: Recomendaciones del dataset Santuario
  console.log('\n📊 Test 1: Recomendaciones del dataset Santuario');
  const santuarioRecs = getSantuarioRecommendations(romanHistoryBook, 10);

  const santuarioMatch = santuarioRecs.find(rec => rec.id === ancientGreeceBook.id);
  const santuarioPosition = santuarioRecs.findIndex(rec => rec.id === ancientGreeceBook.id);

  console.log(`   Resultados encontrados: ${santuarioRecs.length}`);
  console.log(`   "${ancientGreeceBook.title}" encontrado: ${santuarioMatch ? '✅' : '❌'}`);
  if (santuarioMatch) {
    console.log(`   Posición: #${santuarioPosition + 1}`);
    console.log(`   Score de similitud: ${santuarioMatch.similarityScore.toFixed(3)}`);
    console.log(`   Razón: ${santuarioMatch.matchReason}`);
  }

  // Test 2: Top 5 recomendaciones del dataset
  console.log('\n📊 Test 2: Top 5 recomendaciones del dataset');
  santuarioRecs.slice(0, 5).forEach((rec, index) => {
    console.log(`   ${index + 1}. "${rec.title}" (score: ${rec.similarityScore.toFixed(3)})`);
  });

  // Test 3: Similitud semántica detallada
  console.log('\n📊 Test 3: Análisis de similitud detallada');
  analyzeBookSimilarity(romanHistoryBook, ancientGreeceBook);

  return {
    success: !!santuarioMatch,
    test1: {
      matchFound: !!santuarioMatch,
      position: santuarioPosition + 1,
      similarityScore: santuarioMatch?.similarityScore,
      matchReason: santuarioMatch?.matchReason
    },
    topRecommendations: santuarioRecs.slice(0, 5).map(rec => ({
      title: rec.title,
      score: rec.similarityScore,
      reason: rec.matchReason
    }))
  };
};

/**
 * Analiza la similitud entre dos libros específicos
 */
const analyzeBookSimilarity = (bookA, bookB) => {
  console.log(`   Comparando: "${bookA.title}" ↔ "${bookB.title}"`);

  // Campos comunes
  const commonCategories = bookA.categories.filter(cat =>
    bookB.categories.includes(cat)
  );

  console.log(`   Categorías comunes: ${commonCategories.length > 0 ? commonCategories.join(', ') : 'Ninguna'}`);

  // Palabras clave comunes
  const keywordsA = bookA.similarityKeywords || [];
  const keywordsB = bookB.similarityKeywords || [];
  const commonKeywords = keywordsA.filter(keyword => keywordsB.includes(keyword));

  console.log(`   Palabras clave comunes: ${commonKeywords.length > 0 ? commonKeywords.join(', ') : 'Ninguna'}`);

  // Análisis de títulos
  const titleAWords = new Set(bookA.title.toLowerCase().split(/\s+/));
  const titleBWords = new Set(bookB.title.toLowerCase().split(/\s+/));
  const commonTitleWords = [...titleAWords].filter(word => titleBWords.has(word));

  console.log(`   Palabras comunes en títulos: ${commonTitleWords.length > 0 ? commonTitleWords.join(', ') : 'Ninguna'}`);

  // Calcular similitud manual
  const totalFields = 3; // categorías, keywords, títulos
  let similarityScore = 0;

  if (commonCategories.length > 0) similarityScore += 0.4;
  if (commonKeywords.length > 0) similarityScore += 0.4;
  if (commonTitleWords.length > 0) similarityScore += 0.2;

  console.log(`   Score de similitud manual: ${similarityScore.toFixed(3)}/1.0`);
};

/**
 * Test de performance del motor de recomendaciones
 */
export const testPerformance = async () => {
  console.log('⚡ Iniciando test de performance');

  const testBooks = santuarioDataset.slice(0, 5); // Probar con 5 libros
  const results = [];

  for (const book of testBooks) {
    const startTime = performance.now();
    const recommendations = getSantuarioRecommendations(book, 5);
    const endTime = performance.now();
    const duration = endTime - startTime;

    results.push({
      book: book.title,
      recommendations: recommendations.length,
      duration: duration.toFixed(2),
      avgPerRec: (duration / recommendations.length).toFixed(2)
    });
  }

  console.log('\n📈 Resultados de performance:');
  results.forEach(result => {
    console.log(`   "${result.book}": ${result.recommendations} recs en ${result.duration}ms (${result.avgPerRec}ms/rec)`);
  });

  const avgDuration = results.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.length;
  console.log(`\n   ⏱️  Duración promedio: ${avgDuration.toFixed(2)}ms`);

  return results;
};

/**
 * Test de cobertura del dataset
 */
export const testDatasetCoverage = () => {
  console.log('📊 Analizando cobertura del dataset Santuario');

  const totalBooks = santuarioDataset.length;
  const categories = {};

  // Contar libros por categoría
  santuarioDataset.forEach(book => {
    book.categories.forEach(cat => {
      categories[cat] = (categories[cat] || 0) + 1;
    });
  });

  console.log(`   Total de libros: ${totalBooks}`);
  console.log(`   Categorías únicas: ${Object.keys(categories).length}`);

  console.log('\n   Distribución por categoría:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const percentage = ((count / totalBooks) * 100).toFixed(1);
      console.log(`     ${cat}: ${count} libros (${percentage}%)`);
    });

  // Análisis de campos completos
  const fields = ['title', 'authors', 'description', 'categories', 'thumbnail'];
  const completeness = {};

  fields.forEach(field => {
    const completeCount = santuarioDataset.filter(book => book[field] && (
      Array.isArray(book[field]) ? book[field].length > 0 : book[field].toString().trim().length > 0
    )).length;

    completeness[field] = {
      count: completeCount,
      percentage: ((completeCount / totalBooks) * 100).toFixed(1)
    };
  });

  console.log('\n   Completitud de campos:');
  Object.entries(completeness).forEach(([field, stats]) => {
    console.log(`     ${field}: ${stats.count}/${totalBooks} (${stats.percentage}%)`);
  });

  return {
    totalBooks,
    categories,
    completeness
  };
};

/**
 * Test de casos de borde
 */
export const testEdgeCases = () => {
  console.log('⚠️  Probando casos de borde');

  const testCases = [
    {
      name: 'Libro sin categorías',
      book: { id: 'test_001', title: 'Libro Test', categories: [] }
    },
    {
      name: 'Libro con título muy corto',
      book: { id: 'test_002', title: 'A', categories: ['Filosofía'] }
    },
    {
      name: 'Libro duplicado',
      book: santuarioDataset[0] // Usar primer libro como "duplicado"
    },
    {
      name: 'Libro nulo',
      book: null
    }
  ];

  const results = [];

  testCases.forEach(testCase => {
    console.log(`\n   Caso: ${testCase.name}`);
    try {
      const recs = getSantuarioRecommendations(testCase.book, 3);
      console.log(`     Resultado: ${recs.length} recomendaciones`);
      results.push({
        case: testCase.name,
        success: true,
        recommendations: recs.length
      });
    } catch (error) {
      console.log(`     Error: ${error.message}`);
      results.push({
        case: testCase.name,
        success: false,
        error: error.message
      });
    }
  });

  return results;
};

/**
 * Ejecuta todos los tests
 */
export const runAllTests = async () => {
  console.log('🚀 Iniciando suite completa de tests del motor de recomendaciones\n');

  const results = {
    romanHistoryTest: null,
    performanceTest: null,
    coverageTest: null,
    edgeCasesTest: null,
    summary: {}
  };

  // Test principal
  try {
    results.romanHistoryTest = await testRomanHistoryRecommendation();
    console.log('\n✅ Test principal completado');
  } catch (error) {
    console.error(`❌ Error en test principal: ${error.message}`);
    results.romanHistoryTest = { success: false, error: error.message };
  }

  // Test de performance
  try {
    results.performanceTest = await testPerformance();
    console.log('\n✅ Test de performance completado');
  } catch (error) {
    console.error(`❌ Error en test de performance: ${error.message}`);
    results.performanceTest = { success: false, error: error.message };
  }

  // Test de cobertura
  try {
    results.coverageTest = testDatasetCoverage();
    console.log('\n✅ Test de cobertura completado');
  } catch (error) {
    console.error(`❌ Error en test de cobertura: ${error.message}`);
    results.coverageTest = { success: false, error: error.message };
  }

  // Test de casos de borde
  try {
    results.edgeCasesTest = testEdgeCases();
    console.log('\n✅ Test de casos de borde completado');
  } catch (error) {
    console.error(`❌ Error en test de casos de borde: ${error.message}`);
    results.edgeCasesTest = { success: false, error: error.message };
  }

  // Resumen
  console.log('\n📋 RESUMEN DE TESTS');
  console.log('=' .repeat(50));

  const passedTests = [
    results.romanHistoryTest?.success,
    results.performanceTest?.success !== false,
    results.coverageTest?.success !== false,
    results.edgeCasesTest?.every(test => test.success !== false)
  ].filter(Boolean).length;

  const totalTests = 4;

  console.log(`   Tests pasados: ${passedTests}/${totalTests}`);

  if (results.romanHistoryTest?.success) {
    console.log(`   ✅ "Historia Romana" → "Vida en la antigua Grecia": ÉXITO`);
    if (results.romanHistoryTest.test1.position) {
      console.log(`      Posición en recomendaciones: #${results.romanHistoryTest.test1.position}`);
    }
  } else {
    console.log(`   ❌ "Historia Romana" → "Vida en la antigua Grecia": FALLÓ`);
  }

  if (results.performanceTest?.length > 0) {
    const avgTime = results.performanceTest.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.performanceTest.length;
    console.log(`   ⚡ Performance promedio: ${avgTime.toFixed(2)}ms por consulta`);
  }

  if (results.coverageTest?.totalBooks) {
    console.log(`   📚 Dataset: ${results.coverageTest.totalBooks} libros, ${Object.keys(results.coverageTest.categories).length} categorías`);
  }

  console.log('\n🎯 Recomendaciones del test principal:');
  if (results.romanHistoryTest?.topRecommendations) {
    results.romanHistoryTest.topRecommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. "${rec.title}" (score: ${rec.score.toFixed(3)}) - ${rec.reason}`);
    });
  }

  return results;
};

/**
 * Servicio de pruebas para validación manual
 */
export default {
  testRomanHistoryRecommendation,
  testPerformance,
  testDatasetCoverage,
  testEdgeCases,
  runAllTests
};