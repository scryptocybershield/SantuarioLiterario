// Utilidades de migración y compatibilidad para transición a modelo Instagram-like
// Permite migración quirúrgica sin romper funcionalidad existente

import { db } from '../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  reviewToPost,
  postToReview,
  fromFirestore,
  toFirestore,
  type Post,
  type Book,
  createBook,
  createPost,
} from './instagram-models';

// ==================== MIGRACIÓN DE DATOS ====================

/**
 * Migra reseñas existentes a posts (Instagram-like)
 * @param {string} userId - ID del usuario (opcional, si se quiere migrar solo un usuario)
 * @returns {Promise<{migrated: number, errors: number}>} Resultados de la migración
 */
export const migrateReviewsToPosts = async (userId?: string): Promise<{ migrated: number; errors: number }> => {
  console.log('Iniciando migración de reseñas a posts...');

  try {
    const reviewsCollection = collection(db, 'reviews');
    let q = reviewsCollection;

    // Filtrar por usuario si se especifica
    if (userId) {
      q = query(reviewsCollection, where('userId', '==', userId));
    }

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let migrated = 0;
    let errors = 0;

    // Procesar cada reseña
    for (const docSnap of querySnapshot.docs) {
      try {
        const reviewData = fromFirestore(docSnap.data());

        // Convertir reseña a post
        const postData = reviewToPost(reviewData);

        // Añadir metadatos de migración
        const postWithMetadata: Post = {
          ...postData,
          _migratedFrom: 'review',
          _originalReviewId: docSnap.id,
          _migratedAt: new Date().toISOString(),
        };

        // Crear nuevo documento en colección posts
        const postsCollection = collection(db, 'posts');
        const postRef = doc(postsCollection);
        batch.set(postRef, toFirestore(postWithMetadata));

        // Marcar reseña como migrada (opcional: mantener para compatibilidad)
        const reviewRef = doc(db, 'reviews', docSnap.id);
        batch.update(reviewRef, {
          _migratedToPost: true,
          _postId: postRef.id,
          _migratedAt: serverTimestamp(),
        });

        migrated++;

        // Limitar tamaño del batch
        if (migrated % 400 === 0) {
          await batch.commit();
          console.log(`Migrados ${migrated} reseñas...`);
        }

      } catch (error) {
        console.error(`Error migrando reseña ${docSnap.id}:`, error);
        errors++;
      }
    }

    // Commit del batch final
    if (migrated % 400 !== 0) {
      await batch.commit();
    }

    console.log(`Migración completada: ${migrated} reseñas migradas, ${errors} errores`);
    return { migrated, errors };

  } catch (error) {
    console.error('Error en migración de reseñas:', error);
    throw error;
  }
};

/**
 * Migra datos de libros existentes al nuevo esquema con estadísticas sociales
 * @returns {Promise<{updated: number, errors: number}>} Resultados de la actualización
 */
export const migrateBooksToSocialSchema = async (): Promise<{ updated: number; errors: number }> => {
  console.log('Iniciando migración de libros a esquema social...');

  try {
    const booksCollection = collection(db, 'books');
    const querySnapshot = await getDocs(booksCollection);
    const batch = writeBatch(db);
    let updated = 0;
    let errors = 0;

    for (const docSnap of querySnapshot.docs) {
      try {
        const bookData = fromFirestore(docSnap.data());

        // Añadir campos sociales si no existen
        const updatedBook: Book = {
          ...createBook(bookData),
          // Mantener datos existentes
          ...bookData,
          // Añadir campos sociales con valores por defecto
          likesCount: bookData.likesCount || 0,
          savesCount: bookData.savesCount || 0,
          sharesCount: bookData.sharesCount || 0,
          shelvesCount: {
            wantToRead: bookData.shelvesCount?.wantToRead || 0,
            currentlyReading: bookData.shelvesCount?.currentlyReading || 0,
            read: bookData.shelvesCount?.read || 0,
            favorites: bookData.shelvesCount?.favorites || 0,
            recommended: bookData.shelvesCount?.recommended || 0,
            trending: bookData.shelvesCount?.trending || 0,
          },
          discoveryScore: bookData.discoveryScore || 0,
          engagementRate: bookData.engagementRate || 0,
          hashtags: bookData.hashtags || [],
          mentions: bookData.mentions || [],
          _migratedToSocial: true,
          _migratedAt: new Date().toISOString(),
        };

        const bookRef = doc(db, 'books', docSnap.id);
        batch.update(bookRef, toFirestore(updatedBook));
        updated++;

        // Limitar tamaño del batch
        if (updated % 400 === 0) {
          await batch.commit();
          console.log(`Actualizados ${updated} libros...`);
        }

      } catch (error) {
        console.error(`Error migrando libro ${docSnap.id}:`, error);
        errors++;
      }
    }

    // Commit del batch final
    if (updated % 400 !== 0) {
      await batch.commit();
    }

    console.log(`Migración de libros completada: ${updated} actualizados, ${errors} errores`);
    return { updated, errors };

  } catch (error) {
    console.error('Error en migración de libros:', error);
    throw error;
  }
};

/**
 * Migra perfiles de usuario al nuevo esquema con preferencias de feed
 * @returns {Promise<{updated: number, errors: number}>} Resultados de la actualización
 */
export const migrateUserProfilesToSocialSchema = async (): Promise<{ updated: number; errors: number }> => {
  console.log('Iniciando migración de perfiles de usuario...');

  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    const batch = writeBatch(db);
    let updated = 0;
    let errors = 0;

    for (const docSnap of querySnapshot.docs) {
      try {
        const userData = fromFirestore(docSnap.data());

        // Añadir campos de feed preferences si no existen
        const updatedUser = {
          ...userData,
          feedPreferences: userData.feedPreferences || {
            showSpoilers: false,
            showQuotes: true,
            showProgress: true,
            showRecommendations: true,
            languageFilter: ['es'],
          },
          stats: {
            ...userData.stats,
            postsCount: userData.stats?.postsCount || 0,
            commentsCount: userData.stats?.commentsCount || 0,
            likesGiven: userData.stats?.likesGiven || 0,
            likesReceived: userData.stats?.likesReceived || 0,
            engagementRate: userData.stats?.engagementRate || 0,
          },
          privacy: {
            ...userData.privacy,
            postsPublic: userData.privacy?.postsPublic !== undefined ? userData.privacy.postsPublic : true,
          },
          _migratedToSocial: true,
          _migratedAt: new Date().toISOString(),
        };

        const userRef = doc(db, 'users', docSnap.id);
        batch.update(userRef, toFirestore(updatedUser));
        updated++;

        // Limitar tamaño del batch
        if (updated % 400 === 0) {
          await batch.commit();
          console.log(`Actualizados ${updated} perfiles...`);
        }

      } catch (error) {
        console.error(`Error migrando perfil ${docSnap.id}:`, error);
        errors++;
      }
    }

    // Commit del batch final
    if (updated % 400 !== 0) {
      await batch.commit();
    }

    console.log(`Migración de perfiles completada: ${updated} actualizados, ${errors} errores`);
    return { updated, errors };

  } catch (error) {
    console.error('Error en migración de perfiles:', error);
    throw error;
  }
};

// ==================== COMPATIBILIDAD HACIA ATRÁS ====================

/**
 * Adaptador para componentes que esperan el formato antiguo de reseña
 * @param {Post} post - Post en formato Instagram-like
 * @returns {Object} Reseña en formato antiguo (compatibilidad)
 */
export const getLegacyReviewFromPost = (post: Post): any => {
  if (post.type !== 'review') {
    throw new Error('El post no es una reseña');
  }

  return postToReview(post);
};

/**
 * Adaptador para componentes que esperan array de reseñas
 * @param {Post[]} posts - Array de posts
 * @returns {Object[]} Array de reseñas en formato antiguo
 */
export const getLegacyReviewsFromPosts = (posts: Post[]): any[] => {
  return posts
    .filter(post => post.type === 'review')
    .map(post => postToReview(post));
};

/**
 * Wrapper para hooks existentes que usan reseñas
 * @param {Function} hook - Hook original que usa reseñas
 * @returns {Function} Hook adaptado que usa posts
 */
export const createReviewHookWrapper = (originalHook: Function) => {
  return (...args: any[]) => {
    const result = originalHook(...args);

    // Adaptar datos si es necesario
    if (result.data && Array.isArray(result.data)) {
      return {
        ...result,
        data: result.data.map((item: any) => {
          if (item.type === 'review') {
            return postToReview(item);
          }
          return item;
        }),
      };
    }

    return result;
  };
};

// ==================== VALIDACIÓN DE MIGRACIÓN ====================

/**
 * Verifica el estado de la migración
 * @returns {Promise<{
 *   reviews: { total: number, migrated: number, percentage: number },
 *   books: { total: number, migrated: number, percentage: number },
 *   users: { total: number, migrated: number, percentage: number }
 * }>} Estado de la migración
 */
export const getMigrationStatus = async () => {
  try {
    // Contar reseñas
    const reviewsCollection = collection(db, 'reviews');
    const reviewsSnapshot = await getDocs(reviewsCollection);
    const totalReviews = reviewsSnapshot.size;

    const migratedReviews = reviewsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data._migratedToPost === true;
    }).length;

    // Contar libros
    const booksCollection = collection(db, 'books');
    const booksSnapshot = await getDocs(booksCollection);
    const totalBooks = booksSnapshot.size;

    const migratedBooks = booksSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data._migratedToSocial === true;
    }).length;

    // Contar usuarios
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const totalUsers = usersSnapshot.size;

    const migratedUsers = usersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data._migratedToSocial === true;
    }).length;

    return {
      reviews: {
        total: totalReviews,
        migrated: migratedReviews,
        percentage: totalReviews > 0 ? Math.round((migratedReviews / totalReviews) * 100) : 0,
      },
      books: {
        total: totalBooks,
        migrated: migratedBooks,
        percentage: totalBooks > 0 ? Math.round((migratedBooks / totalBooks) * 100) : 0,
      },
      users: {
        total: totalUsers,
        migrated: migratedUsers,
        percentage: totalUsers > 0 ? Math.round((migratedUsers / totalUsers) * 100) : 0,
      },
    };

  } catch (error) {
    console.error('Error obteniendo estado de migración:', error);
    throw error;
  }
};

/**
 * Ejecuta migración completa en modo seguro (por lotes)
 * @param {number} batchSize - Tamaño del lote (default: 100)
 * @returns {Promise<{success: boolean, results: any}>} Resultado de la migración
 */
export const runSafeMigration = async (batchSize: number = 100): Promise<{ success: boolean; results: any }> => {
  console.log('Iniciando migración segura...');

  try {
    const results = {
      reviews: { migrated: 0, errors: 0 },
      books: { updated: 0, errors: 0 },
      users: { updated: 0, errors: 0 },
    };

    // Migrar en lotes pequeños para evitar timeouts
    const migrationStatus = await getMigrationStatus();

    if (migrationStatus.reviews.percentage < 100) {
      console.log('Migrando reseñas...');
      const reviewResult = await migrateReviewsToPosts();
      results.reviews = reviewResult;
    }

    if (migrationStatus.books.percentage < 100) {
      console.log('Migrando libros...');
      const bookResult = await migrateBooksToSocialSchema();
      results.books = bookResult;
    }

    if (migrationStatus.users.percentage < 100) {
      console.log('Migrando usuarios...');
      const userResult = await migrateUserProfilesToSocialSchema();
      results.users = userResult;
    }

    console.log('Migración completada:', results);
    return { success: true, results };

  } catch (error) {
    console.error('Error en migración segura:', error);
    return { success: false, results: { error: error.message } };
  }
};

// ==================== CONFIGURACIÓN DE MIGRACIÓN ====================

/**
 * Configuración para migración progresiva
 */
export const migrationConfig = {
  // Habilitar/deshabilitar características durante la migración
  features: {
    useNewPostModel: true,      // Usar modelo de posts Instagram-like
    useSocialBookStats: true,   // Usar estadísticas sociales en libros
    useFeedPreferences: true,   // Usar preferencias de feed en usuarios
    backwardCompatibility: true, // Mantener compatibilidad con formato antiguo
  },

  // Umbrales para migración automática
  thresholds: {
    minReviewsForMigration: 1000,  // Mínimo de reseñas para migrar
    migrationBatchSize: 100,        // Tamaño del lote para migración
    maxMigrationTime: 300000,       // Tiempo máximo en ms (5 minutos)
  },

  // Estrategias de migración
  strategies: {
    lazyMigration: true,        // Migrar solo al acceder a los datos
    backgroundMigration: true,   // Migrar en segundo plano
    userTriggeredMigration: true, // Permitir migración manual por usuario
  },
};

/**
 * Inicializa el sistema con configuración de migración
 */
export const initializeWithMigration = async () => {
  console.log('Inicializando sistema con migración...');

  // Verificar estado de migración
  const status = await getMigrationStatus();
  console.log('Estado de migración:', status);

  // Configurar características según estado de migración
  const config = { ...migrationConfig };

  if (status.reviews.percentage < 50) {
    // Si menos del 50% de reseñas migradas, mantener compatibilidad
    config.features.backwardCompatibility = true;
    config.features.useNewPostModel = false;
  } else if (status.reviews.percentage >= 50 && status.reviews.percentage < 100) {
    // Migración en progreso, usar ambos modelos
    config.features.useNewPostModel = true;
    config.features.backwardCompatibility = true;
  } else {
    // Migración completa, usar solo nuevo modelo
    config.features.useNewPostModel = true;
    config.features.backwardCompatibility = false;
  }

  console.log('Configuración aplicada:', config);
  return config;
};

// ==================== EXPORT ====================

export default {
  // Migración de datos
  migrateReviewsToPosts,
  migrateBooksToSocialSchema,
  migrateUserProfilesToSocialSchema,
  runSafeMigration,
  getMigrationStatus,

  // Compatibilidad
  getLegacyReviewFromPost,
  getLegacyReviewsFromPosts,
  createReviewHookWrapper,

  // Configuración
  migrationConfig,
  initializeWithMigration,
};