/**
 * Servicio principal de recomendaciones para Santuario Literario
 * API unificada para el motor de recomendaciones semánticas
 */

import semanticRecommender from './semanticRecommender.js';
import santuarioDataset from './santuarioDataset.js';
import recommendationTester from './recommendationTester.js';

/**
 * Servicio de recomendaciones con métricas y logging
 */
class RecommendationService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0
    };

    this.startTime = Date.now();
  }

  /**
   * Obtiene recomendaciones con métricas
   * @param {Object} sourceBook - Libro fuente
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Recomendaciones
   */
  async getRecommendations(sourceBook, userId = null, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const recommendations = await semanticRecommender.getBookRecommendations(
        sourceBook,
        userId
      );

      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);

      // Aplicar filtros adicionales si se especifican
      let filteredRecs = recommendations;

      if (options.excludeCategories && options.excludeCategories.length > 0) {
        filteredRecs = filteredRecs.filter(rec =>
          !rec.categories?.some(cat => options.excludeCategories.includes(cat))
        );
      }

      if (options.minSimilarityScore) {
        filteredRecs = filteredRecs.filter(rec =>
          rec.similarityScore >= options.minSimilarityScore
        );
      }

      if (options.limit) {
        filteredRecs = filteredRecs.slice(0, options.limit);
      }

      this.logRequest('SUCCESS', {
        sourceBook: sourceBook?.title,
        userId,
        recommendations: filteredRecs.length,
        responseTime
      });

      return filteredRecs;
    } catch (error) {
      this.metrics.failedRequests++;
      this.logRequest('ERROR', {
        sourceBook: sourceBook?.title,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtiene recomendaciones basadas en usuario con métricas
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Recomendaciones
   */
  async getUserRecommendations(userId) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const recommendations = await semanticRecommender.getUserBasedRecommendations(userId);
      const responseTime = Date.now() - startTime;

      this.updateMetrics(true, responseTime);
      this.logRequest('USER_SUCCESS', {
        userId,
        recommendations: recommendations.length,
        responseTime
      });

      return recommendations;
    } catch (error) {
      this.metrics.failedRequests++;
      this.logRequest('USER_ERROR', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtiene recomendaciones del dataset Santuario (para pruebas/offline)
   * @param {Object} sourceBook - Libro fuente
   * @param {number} limit - Límite de resultados
   * @returns {Array} Recomendaciones del dataset
   */
  getSantuarioRecommendations(sourceBook, limit = 5) {
    return santuarioDataset.getSantuarioRecommendations(sourceBook, limit);
  }

  /**
   * Busca libros en el dataset Santuario
   * @param {string} query - Término de búsqueda
   * @returns {Array} Resultados
   */
  searchSantuarioBooks(query) {
    return santuarioDataset.searchSantuarioBooks(query);
  }

  /**
   * Obtiene estadísticas del servicio
   * @returns {Object} Métricas del servicio
   */
  getServiceMetrics() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.metrics.totalRequests > 0
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
      : 0;

    return {
      ...this.metrics,
      uptime: this.formatUptime(uptime),
      successRate: parseFloat(successRate.toFixed(2)),
      cacheHitRate: this.metrics.totalRequests > 0
        ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100
        : 0
    };
  }

  /**
   * Ejecuta tests del sistema de recomendaciones
   * @returns {Promise<Object>} Resultados de tests
   */
  async runTests() {
    return recommendationTester.runAllTests();
  }

  /**
   * Limpia el cache del motor de recomendaciones
   */
  clearCache() {
    semanticRecommender.clearRecommendationCache();
    this.logRequest('CACHE_CLEAR', { timestamp: new Date().toISOString() });
  }

  /**
   * Actualiza métricas del servicio
   * @param {boolean} success - Si la request fue exitosa
   * @param {number} responseTime - Tiempo de respuesta en ms
   */
  updateMetrics(success, responseTime) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Actualizar tiempo de respuesta promedio
    const totalSuccessful = this.metrics.successfulRequests;
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (totalSuccessful - 1) + responseTime) / totalSuccessful
    );
  }

  /**
   * Registra una request en el log
   * @param {string} type - Tipo de request
   * @param {Object} data - Datos adicionales
   */
  logRequest(type, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      ...data
    };

    // En producción, esto iría a un servicio de logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RecommendationService] ${type}:`, logEntry);
    }
  }

  /**
   * Formatea el tiempo de actividad
   * @param {number} ms - Milisegundos
   * @returns {string} Tiempo formateado
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Obtiene información del sistema
   * @returns {Object} Información del sistema
   */
  getSystemInfo() {
    return {
      version: '1.0.0',
      engine: 'Semantic Recommender v1',
      dataset: {
        name: 'Santuario Dataset',
        size: santuarioDataset.dataset.length,
        categories: santuarioDataset.categories.length
      },
      features: [
        'Recomendaciones semánticas (TF-IDF + Cosine Similarity)',
        'Personalización basada en usuario',
        'Cache de resultados',
        'Dataset temático Santuario',
        'Métricas y logging'
      ],
      dependencies: {
        semanticRecommender: true,
        santuarioDataset: true,
        recommendationTester: true
      }
    };
  }
}

// Instancia singleton del servicio
const recommendationService = new RecommendationService();

// Exportar instancia y clases
export default recommendationService;
export { RecommendationService };
export { default as semanticRecommender } from './semanticRecommender.js';
export { default as santuarioDataset } from './santuarioDataset.js';
export { default as recommendationTester } from './recommendationTester.js';