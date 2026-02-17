/**
 * Servicio de recomendaciones semánticas para Santuario Literario
 * Utiliza algoritmos de similitud de texto para recomendar libros relacionados
 */

import { searchBooks, searchBooksByCategory } from './googleBooks.js';
import { db } from '../firebase/firebase.js';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Cache para resultados de recomendaciones (mejora performance)
const recommendationCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

/**
 * Limpia y tokeniza texto para análisis semántico
 * @param {string} text - Texto a procesar
 * @returns {Array<string>} Array de tokens limpios
 */
const tokenizeText = (text) => {
  if (!text) return [];

  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ]/g, ' ') // Mantener letras con acentos
    .split(/\s+/)
    .filter(token => token.length > 2) // Filtrar tokens muy cortos
    .filter(token => !STOP_WORDS.has(token)); // Eliminar palabras vacías
};

/**
 * Palabras vacías en español para filtrar
 */
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'a', 'ante', 'bajo', 'cabe', 'con',
  'contra', 'desde', 'en', 'entre', 'hacia', 'hasta', 'para',
  'por', 'según', 'sin', 'so', 'sobre', 'tras', 'y', 'e',
  'o', 'u', 'que', 'quien', 'cual', 'cuyo', 'cuya', 'cuyos',
  'cuyas', 'como', 'cuando', 'donde', 'mientras', 'aunque',
  'pero', 'mas', 'sino', 'porque', 'si', 'así', 'también',
  'ya', 'todavía', 'aún', 'solo', 'solamente', 'tan', 'tanto',
  'muy', 'mucho', 'poco', 'algo', 'nada', 'todo', 'cada',
  'varios', 'algunos', 'ninguno', 'este', 'esta', 'estos',
  'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
  'aquellos', 'aquellas', 'mismo', 'misma', 'mismos', 'mismas',
  'tal', 'tales', 'cualquier', 'cualesquier', 'demás', 'otro',
  'otra', 'otros', 'otras', 'cierto', 'cierta', 'ciertos',
  'ciertas', 'sendos', 'sendas', 'sendos', 'sendas'
]);

/**
 * Calcula la frecuencia de términos (TF) para un documento
 * @param {Array<string>} tokens - Tokens del documento
 * @returns {Object} Frecuencia de términos
 */
const calculateTF = (tokens) => {
  const tf = {};
  const totalTokens = tokens.length;

  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });

  // Normalizar por total de tokens
  Object.keys(tf).forEach(token => {
    tf[token] = tf[token] / totalTokens;
  });

  return tf;
};

/**
 * Calcula la frecuencia inversa de documentos (IDF) para un conjunto de documentos
 * @param {Array<Array<string>>} allDocumentsTokens - Tokens de todos los documentos
 * @returns {Object} IDF para cada término
 */
const calculateIDF = (allDocumentsTokens) => {
  const idf = {};
  const totalDocuments = allDocumentsTokens.length;

  // Contar en cuántos documentos aparece cada término
  allDocumentsTokens.forEach(tokens => {
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });

  // Calcular IDF: log(totalDocuments / (1 + documentos con término))
  Object.keys(idf).forEach(token => {
    idf[token] = Math.log(totalDocuments / (1 + idf[token]));
  });

  return idf;
};

/**
 * Calcula vectores TF-IDF para un conjunto de documentos
 * @param {Array<Object>} documents - Documentos con campos de texto
 * @param {Array<string>} textFields - Campos de texto a considerar
 * @returns {Object} Vectores TF-IDF y vocabulario
 */
const calculateTFIDFVectors = (documents, textFields = ['title', 'description', 'categories']) => {
  // Extraer tokens de cada documento
  const allDocumentsTokens = documents.map(doc => {
    const combinedText = textFields
      .map(field => {
        if (Array.isArray(doc[field])) {
          return doc[field].join(' ');
        }
        return doc[field] || '';
      })
      .join(' ');

    return tokenizeText(combinedText);
  });

  // Calcular TF para cada documento
  const tfVectors = allDocumentsTokens.map(tokens => calculateTF(tokens));

  // Calcular IDF global
  const idf = calculateIDF(allDocumentsTokens);

  // Crear vocabulario único
  const vocabulary = new Set();
  allDocumentsTokens.forEach(tokens => {
    tokens.forEach(token => vocabulary.add(token));
  });

  // Calcular vectores TF-IDF
  const tfidfVectors = tfVectors.map((tf, docIndex) => {
    const vector = {};
    Array.from(vocabulary).forEach(token => {
      const tfValue = tf[token] || 0;
      const idfValue = idf[token] || 0;
      vector[token] = tfValue * idfValue;
    });
    return vector;
  });

  return {
    vectors: tfidfVectors,
    vocabulary: Array.from(vocabulary),
    documents
  };
};

/**
 * Calcula similitud coseno entre dos vectores
 * @param {Object} vectorA - Vector A
 * @param {Object} vectorB - Vector B
 * @param {Array<string>} vocabulary - Vocabulario común
 * @returns {number} Similitud coseno (0-1)
 */
const cosineSimilarity = (vectorA, vectorB, vocabulary) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  vocabulary.forEach(token => {
    const a = vectorA[token] || 0;
    const b = vectorB[token] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Genera recomendaciones semánticas basadas en un libro
 * @param {Object} sourceBook - Libro fuente para recomendaciones
 * @param {Array<Object>} candidateBooks - Libros candidatos para recomendar
 * @param {number} maxRecommendations - Máximo de recomendaciones (default: 5)
 * @returns {Array<Object>} Libros recomendados ordenados por similitud
 */
const generateSemanticRecommendations = (sourceBook, candidateBooks, maxRecommendations = 5) => {
  if (!sourceBook || !candidateBooks || candidateBooks.length === 0) {
    return [];
  }

  // Filtrar el libro fuente de los candidatos
  const filteredCandidates = candidateBooks.filter(book =>
    book.id !== sourceBook.id && book.bookId !== sourceBook.id
  );

  if (filteredCandidates.length === 0) {
    return [];
  }

  // Preparar documentos para análisis
  const allBooks = [sourceBook, ...filteredCandidates];
  const { vectors, vocabulary, documents } = calculateTFIDFVectors(allBooks);

  // El primer vector es el libro fuente
  const sourceVector = vectors[0];
  const candidateVectors = vectors.slice(1);

  // Calcular similitudes
  const similarities = candidateVectors.map((vector, index) => ({
    book: filteredCandidates[index],
    similarity: cosineSimilarity(sourceVector, vector, vocabulary)
  }));

  // Ordenar por similitud descendente
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Filtrar por umbral de similitud y limitar resultados
  const threshold = 0.1; // Umbral mínimo de similitud
  return similarities
    .filter(item => item.similarity > threshold)
    .slice(0, maxRecommendations)
    .map(item => ({
      ...item.book,
      similarityScore: item.similarity
    }));
};

/**
 * Obtiene recomendaciones basadas en un libro específico
 * @param {Object} book - Libro fuente
 * @param {string} userId - ID del usuario (opcional, para personalización)
 * @returns {Promise<Array<Object>>} Libros recomendados
 */
export const getBookRecommendations = async (book, userId = null) => {
  if (!book) {
    return [];
  }

  // Crear clave de cache
  const cacheKey = `book_${book.id}_${userId || 'anonymous'}`;
  const cached = recommendationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.recommendations;
  }

  try {
    // Buscar libros candidatos basados en categorías del libro fuente
    let candidateBooks = [];

    // Priorizar búsqueda por categorías
    if (book.categories && book.categories.length > 0) {
      for (const category of book.categories.slice(0, 3)) {
        try {
          const categoryBooks = await searchBooksByCategory(category, 15);
          candidateBooks = [...candidateBooks, ...categoryBooks];
        } catch (error) {
          console.warn(`Error buscando libros por categoría ${category}:`, error);
        }
      }
    }

    // Si no hay suficientes candidatos, buscar por términos del título
    if (candidateBooks.length < 10) {
      try {
        const titleKeywords = book.title.split(' ').slice(0, 3).join(' ');
        const titleBooks = await searchBooks(titleKeywords, 20);
        candidateBooks = [...candidateBooks, ...titleBooks];
      } catch (error) {
        console.warn('Error buscando libros por título:', error);
      }
    }

    // Eliminar duplicados
    const uniqueBooks = [];
    const seenIds = new Set();

    candidateBooks.forEach(book => {
      if (!seenIds.has(book.id)) {
        seenIds.add(book.id);
        uniqueBooks.push(book);
      }
    });

    // Generar recomendaciones semánticas
    const recommendations = generateSemanticRecommendations(book, uniqueBooks, 5);

    // Personalizar recomendaciones basadas en historial del usuario
    if (userId) {
      const personalizedRecs = await personalizeRecommendations(recommendations, userId);
      recommendationCache.set(cacheKey, {
        recommendations: personalizedRecs,
        timestamp: Date.now()
      });
      return personalizedRecs;
    }

    // Cachear resultados
    recommendationCache.set(cacheKey, {
      recommendations,
      timestamp: Date.now()
    });

    return recommendations;
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    return [];
  }
};

/**
 * Personaliza recomendaciones basadas en historial del usuario
 * @param {Array<Object>} recommendations - Recomendaciones base
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array<Object>>} Recomendaciones personalizadas
 */
const personalizeRecommendations = async (recommendations, userId) => {
  if (!userId || recommendations.length === 0) {
    return recommendations;
  }

  try {
    // Obtener historial de lectura del usuario desde Firestore
    const readingsCollection = collection(db, 'readings');
    const userReadingsQuery = query(
      readingsCollection,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(userReadingsQuery);
    const userBooks = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      userBooks.push({
        id: data.bookId,
        title: data.title,
        categories: data.categories || [],
        readingStatus: data.readingStatus,
        rating: data.publicRating || 0
      });
    });

    if (userBooks.length === 0) {
      return recommendations;
    }

    // Calcular preferencias del usuario basadas en historial
    const userPreferences = calculateUserPreferences(userBooks);

    // Ajustar puntuaciones de recomendaciones basadas en preferencias
    const personalized = recommendations.map(rec => {
      let personalizationScore = 1.0;

      // Aumentar puntuación si coincide con categorías preferidas
      if (rec.categories && userPreferences.topCategories.length > 0) {
        const matchingCategories = rec.categories.filter(cat =>
          userPreferences.topCategories.includes(cat)
        );
        if (matchingCategories.length > 0) {
          personalizationScore += 0.3 * matchingCategories.length;
        }
      }

      // Aumentar puntuación si coincide con autores preferidos
      if (rec.authors && userPreferences.topAuthors.length > 0) {
        const matchingAuthors = rec.authors.filter(author =>
          userPreferences.topAuthors.includes(author)
        );
        if (matchingAuthors.length > 0) {
          personalizationScore += 0.2 * matchingAuthors.length;
        }
      }

      return {
        ...rec,
        similarityScore: rec.similarityScore * personalizationScore,
        personalizationScore
      };
    });

    // Reordenar por nueva puntuación
    personalized.sort((a, b) => b.similarityScore - a.similarityScore);

    return personalized.slice(0, 5);
  } catch (error) {
    console.error('Error personalizando recomendaciones:', error);
    return recommendations;
  }
};

/**
 * Calcula preferencias del usuario basadas en historial de lectura
 * @param {Array<Object>} userBooks - Libros del usuario
 * @returns {Object} Preferencias del usuario
 */
const calculateUserPreferences = (userBooks) => {
  const categoryCount = {};
  const authorCount = {};

  userBooks.forEach(book => {
    // Contar categorías
    if (book.categories) {
      book.categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    }

    // Contar autores (si estuvieran disponibles)
    if (book.authors) {
      book.authors.forEach(author => {
        authorCount[author] = (authorCount[author] || 0) + 1;
      });
    }
  });

  // Obtener categorías y autores más frecuentes
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);

  const topAuthors = Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([author]) => author);

  return {
    topCategories,
    topAuthors,
    totalBooks: userBooks.length
  };
};

/**
 * Obtiene recomendaciones basadas en historial del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array<Object>>} Libros recomendados
 */
export const getUserBasedRecommendations = async (userId) => {
  if (!userId) {
    return [];
  }

  const cacheKey = `user_${userId}`;
  const cached = recommendationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.recommendations;
  }

  try {
    // Obtener historial del usuario
    const readingsCollection = collection(db, 'readings');
    const userReadingsQuery = query(
      readingsCollection,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(userReadingsQuery);
    const userBooks = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      userBooks.push({
        id: data.bookId,
        title: data.title,
        categories: data.categories || [],
        description: data.description || '',
        authors: data.authors || []
      });
    });

    if (userBooks.length === 0) {
      return [];
    }

    // Usar el libro más reciente como fuente
    const latestBook = userBooks[0];

    // Buscar libros similares
    const recommendations = await getBookRecommendations(latestBook, userId);

    // Cachear resultados
    recommendationCache.set(cacheKey, {
      recommendations,
      timestamp: Date.now()
    });

    return recommendations;
  } catch (error) {
    console.error('Error obteniendo recomendaciones basadas en usuario:', error);
    return [];
  }
};

/**
 * Limpia el cache de recomendaciones
 */
export const clearRecommendationCache = () => {
  recommendationCache.clear();
};

/**
 * Servicio principal de recomendaciones
 */
export default {
  getBookRecommendations,
  getUserBasedRecommendations,
  clearRecommendationCache
};