/**
 * Hook personalizado para manejar recomendaciones de libros
 * Integra el motor semántico con la UI de Santuario Literario
 */

import { useState, useEffect, useCallback } from 'react';
import { getBookRecommendations, getUserBasedRecommendations } from '../services/semanticRecommender.js';
import useAuthStore from '../store/authStore.js';
import useBookStore from '../store/bookStore.js';

/**
 * Hook para obtener recomendaciones basadas en contexto
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones de recomendaciones
 */
const useRecommendations = (options = {}) => {
  const {
    sourceBook = null,
    autoLoad = true,
    maxRecommendations = 5,
    refreshInterval = null
  } = options;

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { user } = useAuthStore();
  const { selectedBook, myLibrary } = useBookStore();

  // Determinar libro fuente si no se proporciona explícitamente
  const effectiveSourceBook = sourceBook || selectedBook;

  // Cargar recomendaciones
  const loadRecommendations = useCallback(async () => {
    if (!effectiveSourceBook && !user?.uid) {
      setError('Se requiere un libro fuente o usuario autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let recs = [];

      if (effectiveSourceBook) {
        // Recomendaciones basadas en libro específico
        recs = await getBookRecommendations(effectiveSourceBook, user?.uid);
      } else if (user?.uid) {
        // Recomendaciones basadas en historial del usuario
        recs = await getUserBasedRecommendations(user.uid);
      }

      setRecommendations(recs.slice(0, maxRecommendations));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      setError('No se pudieron cargar las recomendaciones');
    } finally {
      setIsLoading(false);
    }
  }, [effectiveSourceBook, user?.uid, maxRecommendations]);

  // Cargar automáticamente al montar
  useEffect(() => {
    if (autoLoad) {
      loadRecommendations();
    }
  }, [autoLoad, loadRecommendations]);

  // Configurar refresh automático si se especifica
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(() => {
      loadRecommendations();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, loadRecommendations]);

  // Recargar cuando cambia el libro seleccionado
  useEffect(() => {
    if (autoLoad && effectiveSourceBook) {
      loadRecommendations();
    }
  }, [effectiveSourceBook?.id, autoLoad, loadRecommendations]);

  // Recargar cuando el usuario cambia
  useEffect(() => {
    if (autoLoad && user?.uid) {
      loadRecommendations();
    }
  }, [user?.uid, autoLoad, loadRecommendations]);

  /**
   * Obtiene recomendaciones basadas en un libro específico de la biblioteca
   * @param {string} bookId - ID del libro
   * @returns {Promise<Array>} Recomendaciones
   */
  const getRecommendationsForLibraryBook = useCallback(async (bookId) => {
    const book = myLibrary.find(b => b.bookId === bookId || b.id === bookId);
    if (!book) {
      throw new Error('Libro no encontrado en la biblioteca');
    }

    setIsLoading(true);
    try {
      const recs = await getBookRecommendations(book, user?.uid);
      return recs.slice(0, maxRecommendations);
    } finally {
      setIsLoading(false);
    }
  }, [myLibrary, user?.uid, maxRecommendations]);

  /**
   * Obtiene recomendaciones basadas en categorías de interés
   * @param {Array<string>} categories - Categorías de interés
   * @returns {Promise<Array>} Recomendaciones
   */
  const getRecommendationsByCategories = useCallback(async (categories) => {
    if (!categories || categories.length === 0) {
      return [];
    }

    // Esta función sería implementada con búsquedas a Google Books API
    // Por ahora devuelve un array vacío como placeholder
    console.log('Buscando recomendaciones por categorías:', categories);
    return [];
  }, []);

  /**
   * Marca una recomendación como vista/interesante
   * @param {string} bookId - ID del libro recomendado
   */
  const markRecommendationAsSeen = useCallback((bookId) => {
    // Podría implementarse tracking de interacción con recomendaciones
    console.log('Recomendación marcada como vista:', bookId);
  }, []);

  /**
   * Obtiene estadísticas de las recomendaciones
   * @returns {Object} Estadísticas
   */
  const getStats = useCallback(() => {
    if (recommendations.length === 0) {
      return {
        total: 0,
        averageScore: 0,
        byCategory: {}
      };
    }

    const total = recommendations.length;
    const averageScore = recommendations.reduce((sum, rec) =>
      sum + (rec.similarityScore || 0), 0
    ) / total;

    // Agrupar por categoría principal
    const byCategory = {};
    recommendations.forEach(rec => {
      if (rec.categories && rec.categories.length > 0) {
        const mainCategory = rec.categories[0];
        byCategory[mainCategory] = (byCategory[mainCategory] || 0) + 1;
      }
    });

    return {
      total,
      averageScore: parseFloat(averageScore.toFixed(3)),
      byCategory,
      lastUpdated
    };
  }, [recommendations, lastUpdated]);

  return {
    // Estado
    recommendations,
    isLoading,
    error,
    lastUpdated,
    sourceBook: effectiveSourceBook,

    // Funciones
    loadRecommendations,
    getRecommendationsForLibraryBook,
    getRecommendationsByCategories,
    markRecommendationAsSeen,
    getStats,

    // Utilidades
    hasRecommendations: recommendations.length > 0,
    isEmpty: recommendations.length === 0 && !isLoading && !error,
    shouldShow: recommendations.length > 0 || isLoading || error
  };
};

export default useRecommendations;