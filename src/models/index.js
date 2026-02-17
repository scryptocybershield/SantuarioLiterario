// Modelos de datos TypeScript/JavaScript para Goodreads
// Interfaces para tipado y conversión Firestore <-> Frontend

import { Timestamp } from 'firebase/firestore';

// ==================== TIPOS BÁSICOS ====================

/**
 * Convierte un objeto Firestore a un objeto plano JavaScript
 * @param {Object} firestoreObj - Objeto de Firestore con Timestamps
 * @returns {Object} Objeto con fechas convertidas a strings ISO
 */
export const fromFirestore = (firestoreObj) => {
  if (!firestoreObj) return null;

  const result = { ...firestoreObj };

  // Convertir Timestamps a strings ISO
  Object.keys(result).forEach(key => {
    if (result[key] && typeof result[key] === 'object') {
      if (result[key].toDate && typeof result[key].toDate === 'function') {
        result[key] = result[key].toDate().toISOString();
      } else if (Array.isArray(result[key])) {
        result[key] = result[key].map(item => {
          if (item && item.toDate && typeof item.toDate === 'function') {
            return item.toDate().toISOString();
          }
          return item;
        });
      }
    }
  });

  return result;
};

/**
 * Convierte un objeto JavaScript a formato Firestore
 * @param {Object} jsObj - Objeto JavaScript
 * @returns {Object} Objeto con fechas convertidas a Timestamps
 */
export const toFirestore = (jsObj) => {
  if (!jsObj) return null;

  const result = { ...jsObj };

  // Convertir strings ISO a Timestamps (solo para campos conocidos de fecha)
  const dateFields = ['createdAt', 'updatedAt', 'addedAt', 'startedAt', 'finishedAt',
                     'lastUpdated', 'lastLogin', 'readAt', 'startedAt', 'endedAt'];

  dateFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = Timestamp.fromDate(new Date(result[field]));
      } catch (error) {
        console.warn(`Error convirtiendo campo ${field} a Timestamp:`, error);
      }
    }
  });

  return result;
};

// ==================== INTERFACES PRINCIPALES ====================

/**
 * @typedef {Object} Book
 * @property {string} id - ID de Google Books
 * @property {string} title - Título del libro
 * @property {string} [subtitle] - Subtítulo
 * @property {string[]} authors - Array de autores
 * @property {string} publisher - Editorial
 * @property {string} publishedDate - Fecha de publicación (YYYY-MM-DD)
 * @property {string} description - Descripción/sinopsis
 * @property {number} pageCount - Número de páginas
 * @property {string[]} categories - Géneros/categorías
 * @property {string} thumbnail - URL thumbnail pequeño
 * @property {string} image - URL imagen grande
 * @property {string} isbn - ISBN
 * @property {string} language - Idioma
 * @property {number} averageRating - Rating promedio
 * @property {number} ratingsCount - Número total de ratings
 * @property {number} reviewsCount - Número total de reseñas
 * @property {Object} shelvesCount - Conteo por estantería
 * @property {number} shelvesCount.wantToRead
 * @property {number} shelvesCount.currentlyReading
 * @property {number} shelvesCount.read
 * @property {number} trendingScore - Puntuación trending
 * @property {string} lastUpdated - Última actualización (ISO string)
 * @property {string} createdAt - Fecha de creación en cache (ISO string)
 */

/**
 * @typedef {Object} Review
 * @property {string} id - ID único de reseña
 * @property {string} bookId - ID del libro
 * @property {string} userId - ID del usuario autor
 * @property {string} username - Nombre de usuario
 * @property {string} userProfilePic - Foto de perfil
 * @property {number} rating - 1-5 estrellas
 * @property {string} title - Título de la reseña
 * @property {string} content - Contenido/texto
 * @property {boolean} spoilerWarning - Advertencia de spoiler
 * @property {string[]} tags - Etiquetas
 * @property {string[]} likes - Array de userIDs que dieron like
 * @property {number} likesCount - Conteo cacheado de likes
 * @property {number} commentsCount - Conteo cacheado de comentarios
 * @property {string} readingStatus - "read", "currently-reading", "want-to-read"
 * @property {number} progress - Progreso de lectura (0-100)
 * @property {boolean} isEdited - Si fue editada
 * @property {string} [editedAt] - Fecha de edición (ISO string)
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} updatedAt - Fecha de actualización (ISO string)
 * @property {string[]} _search - Array de términos para búsqueda
 */

/**
 * @typedef {Object} Shelf
 * @property {string} id - ID único de estantería
 * @property {string} userId - ID del usuario dueño
 * @property {string} name - Nombre de la estantería
 * @property {string} [description] - Descripción
 * @property {boolean} isDefault - Si es estantería por defecto
 * @property {boolean} isPublic - Si es pública o privada
 * @property {string} [color] - Color para UI (hex)
 * @property {string} [icon] - Ícono
 * @property {string[]} bookIds - Array de bookIds
 * @property {number} booksCount - Conteo cacheado
 * @property {number} order - Orden de visualización
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} updatedAt - Fecha de actualización (ISO string)
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - = auth.uid
 * @property {string} username - Nombre de usuario único
 * @property {string} email - Email
 * @property {string} displayName - Nombre para mostrar
 * @property {string} [bio] - Biografía
 * @property {string} [profilePicURL] - URL foto de perfil
 * @property {string} [coverPicURL] - URL foto de portada
 * @property {string} [location] - Ubicación
 * @property {string} [website] - Sitio web
 * @property {string[]} favoriteGenres - Géneros favoritos
 * @property {string[]} favoriteAuthors - Autores favoritos
 * @property {number} [readingGoal] - Meta anual de libros
 * @property {string} [readingSpeed] - "slow", "medium", "fast"
 * @property {Object} stats - Estadísticas
 * @property {number} stats.totalBooks - Total de libros en biblioteca
 * @property {number} stats.booksRead - Libros leídos
 * @property {number} stats.booksReading - Leyendo actualmente
 * @property {number} stats.booksToRead - Por leer
 * @property {number} stats.totalPages - Páginas totales
 * @property {number} stats.pagesRead - Páginas leídas
 * @property {number} stats.averageRating - Rating promedio dado
 * @property {number} stats.reviewsWritten - Reseñas escritas
 * @property {number} stats.followersCount - Seguidores
 * @property {number} stats.followingCount - Siguiendo
 * @property {number} stats.streakDays - Racha de días leyendo
 * @property {string} stats.lastActive - Última actividad (ISO string)
 * @property {Object} privacy - Configuración de privacidad
 * @property {boolean} privacy.profilePublic - Perfil público
 * @property {boolean} privacy.readingActivityPublic - Actividad pública
 * @property {boolean} privacy.shelvesPublic - Estanterías públicas
 * @property {boolean} privacy.reviewsPublic - Reseñas públicas
 * @property {boolean} privacy.followersPublic - Lista de seguidores pública
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} updatedAt - Fecha de actualización (ISO string)
 * @property {string} lastLogin - Último login (ISO string)
 */

/**
 * @typedef {Object} Activity
 * @property {string} id - ID único de actividad
 * @property {string} userId - ID del usuario
 * @property {string} username - Nombre de usuario
 * @property {string} userProfilePic - Foto de perfil
 * @property {string} type - "review", "shelf_add", "reading_update", "follow", "like"
 * @property {string} action - Acción específica
 * @property {string} targetType - "book", "review", "user", "shelf"
 * @property {string} targetId - ID del objetivo
 * @property {Object} targetData - Datos cacheados del objetivo
 * @property {string} [targetData.bookTitle]
 * @property {string[]} [targetData.bookAuthors]
 * @property {string} [targetData.bookThumbnail]
 * @property {string} [targetData.reviewExcerpt]
 * @property {string} [targetData.shelfName]
 * @property {string} [content] - Texto adicional
 * @property {Object} [metadata] - Metadatos específicos
 * @property {boolean} isPublic - Si es visible públicamente
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {number} _feedScore - Puntuación para ordenar feed
 */

/**
 * @typedef {Object} Friendship
 * @property {string} id - ID único de relación
 * @property {string} followerId - ID del seguidor
 * @property {string} followingId - ID del seguido
 * @property {string} status - "pending", "accepted", "blocked"
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} updatedAt - Fecha de actualización (ISO string)
 * @property {boolean} notificationSent - Si se envió notificación
 * @property {boolean} notificationRead - Si se leyó la notificación
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - ID único de comentario
 * @property {string} reviewId - ID de la reseña
 * @property {string} userId - ID del usuario autor
 * @property {string} username - Nombre de usuario
 * @property {string} userProfilePic - Foto de perfil
 * @property {string} content - Texto del comentario
 * @property {string} [parentCommentId] - ID del comentario padre
 * @property {string[]} likes - Array de userIDs que dieron like
 * @property {number} likesCount - Conteo cacheado
 * @property {boolean} isEdited - Si fue editado
 * @property {string} [editedAt] - Fecha de edición (ISO string)
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} updatedAt - Fecha de actualización (ISO string)
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - ID único de notificación
 * @property {string} userId - ID del usuario destinatario
 * @property {string} type - "follow", "like", "comment", "mention", "system"
 * @property {string} title - Título
 * @property {string} message - Mensaje
 * @property {string} [image] - Imagen
 * @property {string} sourceUserId - ID del usuario que generó la notificación
 * @property {string} sourceUsername - Nombre de usuario
 * @property {string} targetType - Tipo de objetivo
 * @property {string} targetId - ID del objetivo
 * @property {boolean} isRead - Si fue leída
 * @property {boolean} isArchived - Si fue archivada
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} [readAt] - Fecha de lectura (ISO string)
 */

/**
 * @typedef {Object} ReadingSession
 * @property {string} id - ID único de sesión
 * @property {string} userId - ID del usuario
 * @property {string} bookId - ID del libro
 * @property {string} readingId - ID del documento en "readings"
 * @property {number} startPage - Página inicial
 * @property {number} endPage - Página final
 * @property {number} pagesRead - Páginas leídas en esta sesión
 * @property {number} duration - Duración en minutos
 * @property {string} [device] - Dispositivo
 * @property {string} [location] - Ubicación
 * @property {string} [notes] - Notas de la sesión
 * @property {string} startedAt - Inicio de sesión (ISO string)
 * @property {string} endedAt - Fin de sesión (ISO string)
 * @property {string} createdAt - Fecha de creación (ISO string)
 */

// ==================== FACTORY FUNCTIONS ====================

/**
 * Crea un objeto Book con valores por defecto
 * @param {Partial<Book>} data - Datos del libro
 * @returns {Book}
 */
export const createBook = (data = {}) => ({
  id: '',
  title: '',
  authors: [],
  publisher: '',
  publishedDate: '',
  description: '',
  pageCount: 0,
  categories: [],
  thumbnail: '',
  image: '',
  isbn: '',
  language: 'es',
  averageRating: 0,
  ratingsCount: 0,
  reviewsCount: 0,
  shelvesCount: {
    wantToRead: 0,
    currentlyReading: 0,
    read: 0
  },
  trendingScore: 0,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto Review con valores por defecto
 * @param {Partial<Review>} data - Datos de la reseña
 * @returns {Review}
 */
export const createReview = (data = {}) => ({
  id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  bookId: '',
  userId: '',
  username: '',
  userProfilePic: '',
  rating: 0,
  title: '',
  content: '',
  spoilerWarning: false,
  tags: [],
  likes: [],
  likesCount: 0,
  commentsCount: 0,
  readingStatus: 'read',
  progress: 100,
  isEdited: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _search: [],
  ...data
});

/**
 * Crea un objeto Shelf con valores por defecto
 * @param {Partial<Shelf>} data - Datos de la estantería
 * @returns {Shelf}
 */
export const createShelf = (data = {}) => ({
  id: `shelf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: '',
  name: '',
  description: '',
  isDefault: false,
  isPublic: true,
  color: '#4A90E2',
  icon: '📚',
  bookIds: [],
  booksCount: 0,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto UserProfile con valores por defecto
 * @param {Partial<UserProfile>} data - Datos del perfil
 * @returns {UserProfile}
 */
export const createUserProfile = (data = {}) => ({
  id: '',
  username: '',
  email: '',
  displayName: '',
  bio: '',
  profilePicURL: '',
  coverPicURL: '',
  location: '',
  website: '',
  favoriteGenres: [],
  favoriteAuthors: [],
  readingGoal: 12, // 12 libros por año por defecto
  readingSpeed: 'medium',
  stats: {
    totalBooks: 0,
    booksRead: 0,
    booksReading: 0,
    booksToRead: 0,
    totalPages: 0,
    pagesRead: 0,
    averageRating: 0,
    reviewsWritten: 0,
    followersCount: 0,
    followingCount: 0,
    streakDays: 0,
    lastActive: new Date().toISOString()
  },
  privacy: {
    profilePublic: true,
    readingActivityPublic: true,
    shelvesPublic: true,
    reviewsPublic: true,
    followersPublic: true
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto Activity con valores por defecto
 * @param {Partial<Activity>} data - Datos de la actividad
 * @returns {Activity}
 */
export const createActivity = (data = {}) => ({
  id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: '',
  username: '',
  userProfilePic: '',
  type: '',
  action: '',
  targetType: '',
  targetId: '',
  targetData: {},
  content: '',
  metadata: {},
  isPublic: true,
  createdAt: new Date().toISOString(),
  _feedScore: Date.now(), // Por defecto, ordenar por fecha más reciente
  ...data
});

// ==================== VALIDACIÓN ====================

/**
 * Valida un objeto Book
 * @param {Book} book - Libro a validar
 * @returns {Array<string>} Array de errores, vacío si es válido
 */
export const validateBook = (book) => {
  const errors = [];

  if (!book.id) errors.push('ID es requerido');
  if (!book.title || book.title.trim().length === 0) errors.push('Título es requerido');
  if (!Array.isArray(book.authors)) errors.push('Authors debe ser un array');
  if (book.rating && (book.rating < 1 || book.rating > 5)) errors.push('Rating debe estar entre 1 y 5');

  return errors;
};

/**
 * Valida un objeto Review
 * @param {Review} review - Reseña a validar
 * @returns {Array<string>} Array de errores, vacío si es válido
 */
export const validateReview = (review) => {
  const errors = [];

  if (!review.bookId) errors.push('Book ID es requerido');
  if (!review.userId) errors.push('User ID es requerido');
  if (review.rating < 1 || review.rating > 5) errors.push('Rating debe estar entre 1 y 5');
  if (!review.content || review.content.trim().length === 0) errors.push('Contenido es requerido');
  if (review.content && review.content.trim().length > 10000) errors.push('Contenido demasiado largo (máx 10000 caracteres)');

  return errors;
};

/**
 * Valida un objeto UserProfile
 * @param {UserProfile} profile - Perfil a validar
 * @returns {Array<string>} Array de errores, vacío si es válido
 */
export const validateUserProfile = (profile) => {
  const errors = [];

  if (!profile.id) errors.push('User ID es requerido');
  if (!profile.username || profile.username.trim().length === 0) errors.push('Username es requerido');
  if (profile.username && profile.username.length < 3) errors.push('Username debe tener al menos 3 caracteres');
  if (profile.username && profile.username.length > 30) errors.push('Username no puede exceder 30 caracteres');
  if (profile.bio && profile.bio.length > 500) errors.push('Biografía no puede exceder 500 caracteres');

  return errors;
};

// ==================== HELPERS PARA FIRESTORE ====================

/**
 * Prepara un objeto para búsqueda en Firestore
 * @param {Object} data - Datos a indexar
 * @param {string[]} fields - Campos a incluir en búsqueda
 * @returns {string[]} Array de términos de búsqueda
 */
export const prepareSearchTerms = (data, fields = ['title', 'content', 'authors', 'tags']) => {
  const terms = new Set();

  fields.forEach(field => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        data[field].forEach(item => {
          if (typeof item === 'string') {
            item.toLowerCase().split(/\s+/).forEach(term => {
              if (term.length > 2) terms.add(term);
            });
          }
        });
      } else if (typeof data[field] === 'string') {
        data[field].toLowerCase().split(/\s+/).forEach(term => {
          if (term.length > 2) terms.add(term);
        });
      }
    }
  });

  return Array.from(terms);
};

/**
 * Calcula el score para el feed de actividad
 * @param {Activity} activity - Actividad
 * @returns {number} Puntuación para ordenar
 */
export const calculateFeedScore = (activity) => {
  let score = Date.parse(activity.createdAt);

  // Bonus por tipo de actividad
  const typeBonuses = {
    'review': 1000,
    'reading_update': 500,
    'shelf_add': 300,
    'follow': 200,
    'like': 100
  };

  if (typeBonuses[activity.type]) {
    score += typeBonuses[activity.type];
  }

  return score;
};

// ==================== EXPORT ====================

export default {
  // Funciones de conversión
  fromFirestore,
  toFirestore,

  // Factory functions
  createBook,
  createReview,
  createShelf,
  createUserProfile,
  createActivity,

  // Validación
  validateBook,
  validateReview,
  validateUserProfile,

  // Helpers
  prepareSearchTerms,
  calculateFeedScore
};