// Modelos TypeScript para migración a modelo Instagram-like
// Extensión del sistema Goodreads actual con funcionalidades sociales tipo Instagram

import { Timestamp } from 'firebase/firestore';

// ==================== TIPOS BÁSICOS ====================

/**
 * Convierte un objeto Firestore a un objeto plano JavaScript
 * @param {Object} firestoreObj - Objeto de Firestore con Timestamps
 * @returns {Object} Objeto con fechas convertidas a strings ISO
 */
export const fromFirestore = (firestoreObj: any): any => {
  if (!firestoreObj) return null;

  const result = { ...firestoreObj };

  // Convertir Timestamps a strings ISO
  Object.keys(result).forEach(key => {
    if (result[key] && typeof result[key] === 'object') {
      if (result[key].toDate && typeof result[key].toDate === 'function') {
        result[key] = result[key].toDate().toISOString();
      } else if (Array.isArray(result[key])) {
        result[key] = result[key].map((item: any) => {
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
export const toFirestore = (jsObj: any): any => {
  if (!jsObj) return null;

  const result = { ...jsObj };

  // Convertir strings ISO a Timestamps (solo para campos conocidos de fecha)
  const dateFields = ['createdAt', 'updatedAt', 'addedAt', 'startedAt', 'finishedAt',
                     'lastUpdated', 'lastLogin', 'readAt', 'startedAt', 'endedAt',
                     'postedAt', 'likedAt', 'commentedAt', 'sharedAt'];

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
 * Libro con funcionalidades sociales extendidas (Instagram-like)
 */
export interface Book {
  // Identificación básica
  id: string;                    // ID de Google Books
  title: string;                 // Título del libro
  subtitle?: string;             // Subtítulo
  authors: string[];             // Array de autores
  publisher: string;             // Editorial
  publishedDate: string;         // Fecha de publicación (YYYY-MM-DD)
  description: string;           // Descripción/sinopsis
  pageCount: number;             // Número de páginas
  categories: string[];          // Géneros/categorías

  // Multimedia
  thumbnail: string;             // URL thumbnail pequeño
  image: string;                 // URL imagen grande
  coverColor?: string;           // Color dominante de portada (para UI)

  // Identificadores
  isbn: string;                  // ISBN
  language: string;              // Idioma

  // Estadísticas sociales (Instagram-like)
  averageRating: number;         // Rating promedio
  ratingsCount: number;          // Número total de ratings
  reviewsCount: number;          // Número total de reseñas
  likesCount: number;            // Número total de likes (nuevo)
  savesCount: number;            // Número de veces guardado (nuevo)
  sharesCount: number;           // Número de veces compartido (nuevo)

  // Shelves extendidas (Instagram-like)
  shelvesCount: {
    wantToRead: number;          // Por leer
    currentlyReading: number;    // Leyendo actualmente
    read: number;                // Leídos
    favorites: number;           // Favoritos (nuevo)
    recommended: number;         // Recomendados (nuevo)
    trending: number;            // Trending (nuevo)
  };

  // Trending y descubrimiento
  trendingScore: number;         // Puntuación trending
  discoveryScore: number;        // Puntuación para descubrimiento (nuevo)
  engagementRate: number;        // Tasa de engagement (nuevo)

  // Metadatos temporales
  lastUpdated: string;           // Última actualización (ISO string)
  createdAt: string;             // Fecha de creación en cache (ISO string)
  trendingSince?: string;        // Desde cuándo está trending (nuevo)

  // Hashtags y etiquetas sociales
  hashtags: string[];            // Hashtags populares (nuevo)
  mentions: string[];            // Usuarios mencionados frecuentemente (nuevo)
}

/**
 * Post/Reseña con funcionalidades Instagram-like
 */
export interface Post {
  // Identificación
  id: string;                    // ID único del post
  type: 'review' | 'quote' | 'progress' | 'shelf' | 'recommendation'; // Tipo de post
  userId: string;                // ID del usuario autor
  username: string;              // Nombre de usuario
  userProfilePic: string;        // Foto de perfil

  // Contenido principal
  bookId: string;                // ID del libro relacionado
  bookTitle: string;             // Título del libro (cache)
  bookAuthors: string[];         // Autores del libro (cache)
  bookThumbnail: string;         // Thumbnail del libro (cache)

  // Contenido del post
  title?: string;                // Título del post
  content: string;               // Contenido/texto
  rating?: number;               // 1-5 estrellas (para reviews)
  spoilerWarning: boolean;       // Advertencia de spoiler
  tags: string[];                // Etiquetas

  // Multimedia (Instagram-like)
  images?: string[];             // Array de URLs de imágenes (nuevo)
  quotes?: string[];             // Citas destacadas (nuevo)
  highlights?: string[];         // Textos destacados (nuevo)

  // Interacciones sociales (Instagram-like)
  likes: string[];               // Array de userIDs que dieron like
  likesCount: number;            // Conteo cacheado de likes
  commentsCount: number;         // Conteo cacheado de comentarios
  sharesCount: number;           // Número de veces compartido (nuevo)
  savesCount: number;            // Número de veces guardado (nuevo)

  // Engagement avanzado
  engagementScore: number;       // Puntuación de engagement (nuevo)
  reach: number;                 // Alcance estimado (nuevo)
  impressions: number;           // Impresiones estimadas (nuevo)

  // Metadatos de lectura
  readingStatus?: string;        // "read", "currently-reading", "want-to-read"
  progress?: number;             // Progreso de lectura (0-100)

  // Visibilidad y privacidad
  visibility: 'public' | 'private' | 'followers'; // Visibilidad del post
  isEdited: boolean;             // Si fue editado
  editedAt?: string;             // Fecha de edición (ISO string)

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de actualización (ISO string)
  postedAt: string;              // Fecha de publicación (nuevo)

  // Índices para búsqueda
  _search: string[];             // Array de términos para búsqueda
  _hashtags: string[];           // Hashtags extraídos (nuevo)
  _mentions: string[];           // Menciones extraídas (nuevo)
}

/**
 * Comentario con funcionalidades Instagram-like
 */
export interface Comment {
  id: string;                    // ID único de comentario
  postId: string;                // ID del post
  userId: string;                // ID del usuario autor
  username: string;              // Nombre de usuario
  userProfilePic: string;        // Foto de perfil

  // Contenido
  content: string;               // Texto del comentario
  parentCommentId?: string;      // ID del comentario padre (para respuestas)

  // Interacciones
  likes: string[];               // Array de userIDs que dieron like
  likesCount: number;            // Conteo cacheado

  // Multimedia
  images?: string[];             // Imágenes en comentario (nuevo)

  // Metadatos
  isEdited: boolean;             // Si fue editado
  editedAt?: string;             // Fecha de edición (ISO string)

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de actualización (ISO string)
}

/**
 * Estantería con funcionalidades Instagram-like
 */
export interface Shelf {
  id: string;                    // ID único de estantería
  userId: string;                // ID del usuario dueño
  username: string;              // Nombre de usuario (cache)

  // Información básica
  name: string;                  // Nombre de la estantería
  description?: string;          // Descripción
  isDefault: boolean;            // Si es estantería por defecto
  isPublic: boolean;             // Si es pública o privada

  // Diseño y personalización
  color: string;                 // Color para UI (hex)
  icon: string;                  // Ícono
  coverImage?: string;           // Imagen de portada (nuevo)

  // Contenido
  bookIds: string[];             // Array de bookIds en esta estantería
  booksCount: number;            // Conteo cacheado

  // Estadísticas sociales
  followersCount: number;        // Número de seguidores (nuevo)
  likesCount: number;            // Número de likes (nuevo)

  // Metadatos
  order: number;                 // Orden de visualización
  featured: boolean;             // Si está destacada (nuevo)

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de actualización (ISO string)
}

/**
 * Perfil de usuario con funcionalidades Instagram-like
 */
export interface UserProfile {
  // Identificación básica
  id: string;                    // = auth.uid
  username: string;              // Nombre de usuario único
  email: string;                 // Email
  displayName: string;           // Nombre para mostrar

  // Información personal
  bio?: string;                  // Biografía
  profilePicURL: string;         // URL foto de perfil
  coverPicURL: string;           // URL foto de portada
  location?: string;             // Ubicación
  website?: string;              // Sitio web

  // Preferencias de lectura
  favoriteGenres: string[];      // Géneros favoritos
  favoriteAuthors: string[];     // Autores favoritos
  readingGoal: number;           // Meta anual de libros
  readingSpeed: string;          // "slow", "medium", "fast"

  // Estadísticas sociales (Instagram-like)
  stats: {
    // Lectura
    totalBooks: number;          // Total de libros en biblioteca
    booksRead: number;           // Libros leídos
    booksReading: number;        // Leyendo actualmente
    booksToRead: number;         // Por leer
    totalPages: number;          // Páginas totales
    pagesRead: number;           // Páginas leídas
    averageRating: number;       // Rating promedio dado

    // Social
    followersCount: number;      // Seguidores
    followingCount: number;      // Siguiendo
    postsCount: number;          // Posts publicados (nuevo)
    reviewsCount: number;        // Reseñas escritas
    commentsCount: number;       // Comentarios escritos (nuevo)
    likesGiven: number;          // Likes dados (nuevo)
    likesReceived: number;       // Likes recibidos (nuevo)

    // Engagement
    streakDays: number;          // Racha de días activo
    lastActive: string;          // Última actividad (ISO string)
    engagementRate: number;      // Tasa de engagement (nuevo)
  };

  // Configuración de privacidad
  privacy: {
    profilePublic: boolean;      // Perfil público
    readingActivityPublic: boolean; // Actividad de lectura pública
    shelvesPublic: boolean;      // Estanterías públicas
    reviewsPublic: boolean;      // Reseñas públicas
    followersPublic: boolean;    // Lista de seguidores pública
    postsPublic: boolean;        // Posts públicos (nuevo)
  };

  // Preferencias de feed
  feedPreferences: {
    showSpoilers: boolean;       // Mostrar posts con spoilers
    showQuotes: boolean;         // Mostrar posts de citas
    showProgress: boolean;       // Mostrar posts de progreso
    showRecommendations: boolean; // Mostrar recomendaciones
    languageFilter: string[];    // Idiomas preferidos
  };

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de actualización (ISO string)
  lastLogin: string;             // Último login (ISO string)
}

/**
 * Actividad en el feed (Instagram-like)
 */
export interface Activity {
  id: string;                    // ID único de actividad
  userId: string;                // ID del usuario
  username: string;              // Nombre de usuario
  userProfilePic: string;        // Foto de perfil

  // Tipo de actividad
  type: 'post' | 'like' | 'comment' | 'follow' | 'shelf_add' | 'reading_update' | 'share';
  action: string;                // Acción específica

  // Referencias
  targetType: 'book' | 'post' | 'user' | 'shelf' | 'comment';
  targetId: string;              // ID del objetivo
  targetData: {                  // Datos cacheados del objetivo
    bookTitle?: string;
    bookAuthors?: string[];
    bookThumbnail?: string;
    postContent?: string;
    postImages?: string[];
    shelfName?: string;
    commentContent?: string;
  };

  // Contenido adicional
  content?: string;              // Texto adicional
  metadata: any;                 // Metadatos específicos

  // Engagement
  likesCount: number;            // Likes en esta actividad (nuevo)
  commentsCount: number;         // Comentarios en esta actividad (nuevo)

  // Visibilidad
  isPublic: boolean;             // Si es visible públicamente

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)

  // Índices para queries
  _feedScore: number;            // Puntuación para ordenar feed
  _engagementScore: number;      // Puntuación de engagement (nuevo)
}

/**
 * Relación de seguimiento (Instagram-like)
 */
export interface Friendship {
  id: string;                    // ID único de relación
  followerId: string;            // ID del seguidor
  followingId: string;           // ID del seguido
  status: 'pending' | 'accepted' | 'blocked' | 'muted';

  // Metadatos
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de actualización (ISO string)

  // Notificaciones
  notificationSent: boolean;     // Si se envió notificación
  notificationRead: boolean;     // Si se leyó la notificación

  // Configuración
  showPosts: boolean;            // Mostrar posts de este usuario (nuevo)
  showActivity: boolean;         // Mostrar actividad de este usuario (nuevo)
}

/**
 * Notificación (Instagram-like)
 */
export interface Notification {
  id: string;                    // ID único de notificación
  userId: string;                // ID del usuario destinatario
  type: 'follow' | 'like' | 'comment' | 'mention' | 'share' | 'system' | 'recommendation';
  title: string;                 // Título
  message: string;               // Mensaje
  image?: string;                // Imagen

  // Referencias
  sourceUserId: string;          // ID del usuario que generó la notificación
  sourceUsername: string;        // Nombre de usuario
  targetType: string;            // Tipo de objetivo
  targetId: string;              // ID del objetivo

  // Estado
  isRead: boolean;               // Si fue leída
  isArchived: boolean;           // Si fue archivada

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)
  readAt?: string;               // Fecha de lectura (ISO string)
}

/**
 * Sesión de lectura con métricas avanzadas
 */
export interface ReadingSession {
  id: string;                    // ID único de sesión
  userId: string;                // ID del usuario
  bookId: string;                // ID del libro
  readingId: string;             // ID del documento en "readings"

  // Progreso
  startPage: number;             // Página inicial
  endPage: number;               // Página final
  pagesRead: number;             // Páginas leídas en esta sesión
  duration: number;              // Duración en minutos

  // Métricas de lectura
  readingSpeed: number;          // Páginas por minuto (nuevo)
  focusScore: number;            // Puntuación de concentración (nuevo)
  comprehensionScore: number;    // Puntuación de comprensión (nuevo)

  // Metadatos
  device: string;                // Dispositivo
  location?: string;             // Ubicación
  notes?: string;                // Notas de la sesión

  // Timestamps
  startedAt: string;             // Inicio de sesión (ISO string)
  endedAt: string;               // Fin de sesión (ISO string)
  createdAt: string;             // Fecha de creación (ISO string)
}

/**
 * Historial de engagement (Instagram-like)
 */
export interface EngagementHistory {
  id: string;                    // ID único
  userId: string;                // ID del usuario
  date: string;                  // Fecha (YYYY-MM-DD)

  // Métricas diarias
  postsCreated: number;          // Posts creados
  likesGiven: number;            // Likes dados
  commentsGiven: number;         // Comentarios dados
  followsGiven: number;          // Seguimientos dados

  postsReceived: number;         // Posts recibidos (de seguidos)
  likesReceived: number;         // Likes recibidos
  commentsReceived: number;      // Comentarios recibidos
  followsReceived: number;       // Seguimientos recibidos

  // Engagement
  totalEngagement: number;       // Engagement total
  engagementRate: number;        // Tasa de engagement

  // Timestamps
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de actualización (ISO string)
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Crea un objeto Book con valores por defecto
 */
export const createBook = (data: Partial<Book> = {}): Book => ({
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
  likesCount: 0,
  savesCount: 0,
  sharesCount: 0,
  shelvesCount: {
    wantToRead: 0,
    currentlyReading: 0,
    read: 0,
    favorites: 0,
    recommended: 0,
    trending: 0,
  },
  trendingScore: 0,
  discoveryScore: 0,
  engagementRate: 0,
  hashtags: [],
  mentions: [],
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto Post con valores por defecto
 */
export const createPost = (data: Partial<Post> = {}): Post => ({
  id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'review',
  userId: '',
  username: '',
  userProfilePic: '',
  bookId: '',
  bookTitle: '',
  bookAuthors: [],
  bookThumbnail: '',
  content: '',
  spoilerWarning: false,
  tags: [],
  likes: [],
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  savesCount: 0,
  engagementScore: 0,
  reach: 0,
  impressions: 0,
  visibility: 'public',
  isEdited: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  postedAt: new Date().toISOString(),
  _search: [],
  _hashtags: [],
  _mentions: [],
  ...data
});

/**
 * Crea un objeto Comment con valores por defecto
 */
export const createComment = (data: Partial<Comment> = {}): Comment => ({
  id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  postId: '',
  userId: '',
  username: '',
  userProfilePic: '',
  content: '',
  likes: [],
  likesCount: 0,
  isEdited: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto Shelf con valores por defecto
 */
export const createShelf = (data: Partial<Shelf> = {}): Shelf => ({
  id: `shelf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: '',
  username: '',
  name: '',
  description: '',
  isDefault: false,
  isPublic: true,
  color: '#4A90E2',
  icon: '📚',
  bookIds: [],
  booksCount: 0,
  followersCount: 0,
  likesCount: 0,
  order: 0,
  featured: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto UserProfile con valores por defecto
 */
export const createUserProfile = (data: Partial<UserProfile> = {}): UserProfile => ({
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
  readingGoal: 12,
  readingSpeed: 'medium',
  stats: {
    totalBooks: 0,
    booksRead: 0,
    booksReading: 0,
    booksToRead: 0,
    totalPages: 0,
    pagesRead: 0,
    averageRating: 0,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    reviewsCount: 0,
    commentsCount: 0,
    likesGiven: 0,
    likesReceived: 0,
    streakDays: 0,
    lastActive: new Date().toISOString(),
    engagementRate: 0,
  },
  privacy: {
    profilePublic: true,
    readingActivityPublic: true,
    shelvesPublic: true,
    reviewsPublic: true,
    followersPublic: true,
    postsPublic: true,
  },
  feedPreferences: {
    showSpoilers: false,
    showQuotes: true,
    showProgress: true,
    showRecommendations: true,
    languageFilter: ['es'],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  ...data
});

/**
 * Crea un objeto Activity con valores por defecto
 */
export const createActivity = (data: Partial<Activity> = {}): Activity => ({
  id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: '',
  username: '',
  userProfilePic: '',
  type: 'post',
  action: '',
  targetType: 'post',
  targetId: '',
  targetData: {},
  metadata: {},
  likesCount: 0,
  commentsCount: 0,
  isPublic: true,
  createdAt: new Date().toISOString(),
  _feedScore: Date.now(),
  _engagementScore: 0,
  ...data
});

/**
 * Crea un objeto Friendship con valores por defecto
 */
export const createFriendship = (data: Partial<Friendship> = {}): Friendship => ({
  id: `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  followerId: '',
  followingId: '',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notificationSent: false,
  notificationRead: false,
  showPosts: true,
  showActivity: true,
  ...data
});

// ==================== FUNCIONES DE CONVERSIÓN ====================

/**
 * Convierte un Review antiguo a un Post nuevo
 */
export const reviewToPost = (review: any): Post => {
  return {
    ...createPost(),
    id: review.id,
    type: 'review',
    userId: review.userId,
    username: review.username,
    userProfilePic: review.userProfilePic,
    bookId: review.bookId,
    bookTitle: '', // Se debe obtener del libro
    bookAuthors: [], // Se debe obtener del libro
    bookThumbnail: '', // Se debe obtener del libro
    title: review.title,
    content: review.content,
    rating: review.rating,
    spoilerWarning: review.spoilerWarning,
    tags: review.tags,
    likes: review.likes || [],
    likesCount: review.likesCount || 0,
    commentsCount: review.commentsCount || 0,
    readingStatus: review.readingStatus,
    progress: review.progress,
    isEdited: review.isEdited,
    editedAt: review.editedAt,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    postedAt: review.createdAt,
    _search: review._search || [],
  };
};

/**
 * Convierte un Post nuevo a un Review antiguo (para compatibilidad)
 */
export const postToReview = (post: Post): any => {
  return {
    id: post.id,
    bookId: post.bookId,
    userId: post.userId,
    username: post.username,
    userProfilePic: post.userProfilePic,
    rating: post.rating || 0,
    title: post.title || '',
    content: post.content,
    spoilerWarning: post.spoilerWarning,
    tags: post.tags,
    likes: post.likes,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    readingStatus: post.readingStatus,
    progress: post.progress,
    isEdited: post.isEdited,
    editedAt: post.editedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    _search: post._search,
  };
};

// ==================== VALIDACIÓN ====================

/**
 * Valida un objeto Book
 */
export const validateBook = (book: Book): string[] => {
  const errors: string[] = [];

  if (!book.id) errors.push('ID es requerido');
  if (!book.title || book.title.trim().length === 0) errors.push('Título es requerido');
  if (!Array.isArray(book.authors)) errors.push('Authors debe ser un array');
  if (book.averageRating && (book.averageRating < 0 || book.averageRating > 5)) {
    errors.push('Rating promedio debe estar entre 0 y 5');
  }

  return errors;
};

/**
 * Valida un objeto Post
 */
export const validatePost = (post: Post): string[] => {
  const errors: string[] = [];

  if (!post.userId) errors.push('User ID es requerido');
  if (!post.bookId) errors.push('Book ID es requerido');
  if (!post.content || post.content.trim().length === 0) errors.push('Contenido es requerido');
  if (post.content && post.content.trim().length > 10000) {
    errors.push('Contenido demasiado largo (máx 10000 caracteres)');
  }
  if (post.rating && (post.rating < 1 || post.rating > 5)) {
    errors.push('Rating debe estar entre 1 y 5');
  }

  return errors;
};

/**
 * Valida un objeto UserProfile
 */
export const validateUserProfile = (profile: UserProfile): string[] => {
  const errors: string[] = [];

  if (!profile.id) errors.push('User ID es requerido');
  if (!profile.username || profile.username.trim().length === 0) errors.push('Username es requerido');
  if (profile.username && profile.username.length < 3) errors.push('Username debe tener al menos 3 caracteres');
  if (profile.username && profile.username.length > 30) errors.push('Username no puede exceder 30 caracteres');
  if (profile.bio && profile.bio.length > 500) errors.push('Biografía no puede exceder 500 caracteres');

  return errors;
};

// ==================== HELPERS PARA FIRESTORE ====================

/**
 * Prepara términos de búsqueda para Firestore
 */
export const prepareSearchTerms = (
  data: any,
  fields: string[] = ['title', 'content', 'authors', 'tags', 'hashtags']
): string[] => {
  const terms = new Set<string>();

  fields.forEach(field => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        data[field].forEach((item: string) => {
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
 * Extrae hashtags de un texto
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map(tag => tag.toLowerCase().replace('#', ''));
};

/**
 * Extrae menciones de un texto
 */
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex) || [];
  return matches.map(mention => mention.toLowerCase().replace('@', ''));
};

/**
 * Calcula el score para el feed de actividad
 */
export const calculateFeedScore = (activity: Activity): number => {
  let score = Date.parse(activity.createdAt);

  // Bonus por tipo de actividad
  const typeBonuses: Record<string, number> = {
    'post': 1000,
    'like': 300,
    'comment': 500,
    'follow': 800,
    'share': 700,
    'reading_update': 400,
    'shelf_add': 200,
  };

  if (typeBonuses[activity.type]) {
    score += typeBonuses[activity.type];
  }

  // Bonus por engagement
  score += (activity.likesCount * 10) + (activity.commentsCount * 20);

  return score;
};

/**
 * Calcula el engagement score para un post
 */
export const calculateEngagementScore = (post: Post): number => {
  let score = 0;

  // Puntos base por tipo de post
  const typeScores: Record<string, number> = {
    'review': 100,
    'quote': 50,
    'progress': 30,
    'shelf': 40,
    'recommendation': 80,
  };

  score += typeScores[post.type] || 0;

  // Puntos por interacciones
  score += post.likesCount * 2;
  score += post.commentsCount * 5;
  score += post.sharesCount * 10;
  score += post.savesCount * 3;

  // Bonus por rating (si es review)
  if (post.rating) {
    score += post.rating * 20;
  }

  // Penalización por spoiler
  if (post.spoilerWarning) {
    score *= 0.8;
  }

  return Math.round(score);
};

// ==================== EXPORT ====================

export default {
  // Funciones de conversión
  fromFirestore,
  toFirestore,

  // Interfaces
  Book,
  Post,
  Comment,
  Shelf,
  UserProfile,
  Activity,
  Friendship,
  Notification,
  ReadingSession,
  EngagementHistory,

  // Factory functions
  createBook,
  createPost,
  createComment,
  createShelf,
  createUserProfile,
  createActivity,
  createFriendship,

  // Funciones de conversión
  reviewToPost,
  postToReview,

  // Validación
  validateBook,
  validatePost,
  validateUserProfile,

  // Helpers
  prepareSearchTerms,
  extractHashtags,
  extractMentions,
  calculateFeedScore,
  calculateEngagementScore,
};