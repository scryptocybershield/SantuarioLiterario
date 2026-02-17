// Mock data para Instagram-like Book Feed
// Basado en interfaces TypeScript de src/models/index.js

import { createBook, createReview, createUserProfile, createActivity } from '../models/index.js';

// Usuarios de ejemplo
export const mockUsers = [
  createUserProfile({
    id: 'user_1',
    username: 'lector_apasionado',
    displayName: 'María García',
    bio: 'Amante de la literatura clásica y la poesía contemporánea 📚✨',
    profilePicURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    location: 'Madrid, España',
    stats: {
      totalBooks: 142,
      booksRead: 89,
      booksReading: 3,
      booksToRead: 50,
      totalPages: 45000,
      pagesRead: 32000,
      averageRating: 4.2,
      reviewsWritten: 45,
      followersCount: 1245,
      followingCount: 890,
      streakDays: 42,
      lastActive: new Date().toISOString()
    }
  }),
  createUserProfile({
    id: 'user_2',
    username: 'bookworm_23',
    displayName: 'Carlos Rodríguez',
    bio: 'Ciencia ficción y fantasía son mi refugio 🚀🧙‍♂️',
    profilePicURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    location: 'Barcelona, España',
    stats: {
      totalBooks: 203,
      booksRead: 156,
      booksReading: 5,
      booksToRead: 42,
      totalPages: 68000,
      pagesRead: 52000,
      averageRating: 4.5,
      reviewsWritten: 78,
      followersCount: 2341,
      followingCount: 1200,
      streakDays: 67,
      lastActive: new Date().toISOString()
    }
  }),
  createUserProfile({
    id: 'user_3',
    username: 'literary_explorer',
    displayName: 'Ana Martínez',
    bio: 'Explorando voces latinoamericanas y literatura experimental 🌎📖',
    profilePicURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    location: 'Ciudad de México',
    stats: {
      totalBooks: 178,
      booksRead: 112,
      booksReading: 4,
      booksToRead: 62,
      totalPages: 52000,
      pagesRead: 38000,
      averageRating: 4.0,
      reviewsWritten: 56,
      followersCount: 1890,
      followingCount: 950,
      streakDays: 28,
      lastActive: new Date().toISOString()
    }
  }),
  createUserProfile({
    id: 'user_4',
    username: 'philosophy_reader',
    displayName: 'David Chen',
    bio: 'Filosofía, psicología y ensayos que cuestionan la realidad 🧠💭',
    profilePicURL: 'https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=400&h=400&fit=crop',
    location: 'Buenos Aires, Argentina',
    stats: {
      totalBooks: 95,
      booksRead: 72,
      booksReading: 2,
      booksToRead: 21,
      totalPages: 32000,
      pagesRead: 25000,
      averageRating: 4.3,
      reviewsWritten: 34,
      followersCount: 876,
      followingCount: 420,
      streakDays: 15,
      lastActive: new Date().toISOString()
    }
  })
];

// Libros de ejemplo
export const mockBooks = [
  createBook({
    id: 'book_1',
    title: 'Cien años de soledad',
    authors: ['Gabriel García Márquez'],
    publisher: 'Editorial Sudamericana',
    publishedDate: '1967-05-30',
    description: 'La historia de la familia Buendía en el pueblo ficticio de Macondo, una obra maestra del realismo mágico que explora temas de soledad, amor y destino.',
    pageCount: 471,
    categories: ['Realismo mágico', 'Literatura latinoamericana', 'Ficción'],
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=900&fit=crop',
    isbn: '9780307474728',
    language: 'es',
    averageRating: 4.5,
    ratingsCount: 1250000,
    reviewsCount: 89000,
    shelvesCount: {
      wantToRead: 450000,
      currentlyReading: 12000,
      read: 890000
    },
    trendingScore: 98
  }),
  createBook({
    id: 'book_2',
    title: 'El nombre del viento',
    authors: ['Patrick Rothfuss'],
    publisher: 'DAW Books',
    publishedDate: '2007-03-27',
    description: 'La historia de Kvothe, un hombre de leyenda, contada en sus propias palabras. Una epopeya de magia, música y misterio.',
    pageCount: 662,
    categories: ['Fantasía', 'Aventura', 'Ficción'],
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=900&fit=crop',
    isbn: '9780756404741',
    language: 'es',
    averageRating: 4.7,
    ratingsCount: 890000,
    reviewsCount: 45000,
    shelvesCount: {
      wantToRead: 320000,
      currentlyReading: 15000,
      read: 550000
    },
    trendingScore: 95
  }),
  createBook({
    id: 'book_3',
    title: 'Sapiens: De animales a dioses',
    authors: ['Yuval Noah Harari'],
    publisher: 'Debate',
    publishedDate: '2011-01-01',
    description: 'Una breve historia de la humanidad que explora cómo los humanos llegaron a dominar el mundo y qué futuro nos espera.',
    pageCount: 496,
    categories: ['Historia', 'Ensayo', 'Ciencia'],
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=900&fit=crop',
    isbn: '9788499926223',
    language: 'es',
    averageRating: 4.4,
    ratingsCount: 980000,
    reviewsCount: 67000,
    shelvesCount: {
      wantToRead: 380000,
      currentlyReading: 18000,
      read: 580000
    },
    trendingScore: 92
  }),
  createBook({
    id: 'book_4',
    title: '1984',
    authors: ['George Orwell'],
    publisher: 'Secker & Warburg',
    publishedDate: '1949-06-08',
    description: 'Una distopía que explora los peligros del totalitarismo, la vigilancia masiva y la manipulación de la verdad.',
    pageCount: 328,
    categories: ['Distopía', 'Ficción política', 'Clásico'],
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=900&fit=crop',
    isbn: '9780451524935',
    language: 'es',
    averageRating: 4.6,
    ratingsCount: 2100000,
    reviewsCount: 120000,
    shelvesCount: {
      wantToRead: 620000,
      currentlyReading: 25000,
      read: 1450000
    },
    trendingScore: 96
  }),
  createBook({
    id: 'book_5',
    title: 'El amor en los tiempos del cólera',
    authors: ['Gabriel García Márquez'],
    publisher: 'Editorial Oveja Negra',
    publishedDate: '1985-01-01',
    description: 'Una historia de amor que dura más de cincuenta años, explorando la pasión, el tiempo y la fidelidad.',
    pageCount: 368,
    categories: ['Realismo mágico', 'Romance', 'Literatura latinoamericana'],
    thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=450&fit=crop',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=900&fit=crop',
    isbn: '9789580600183',
    language: 'es',
    averageRating: 4.3,
    ratingsCount: 780000,
    reviewsCount: 34000,
    shelvesCount: {
      wantToRead: 290000,
      currentlyReading: 8000,
      read: 480000
    },
    trendingScore: 88
  })
];

// Reseñas de ejemplo (posts de Instagram-like)
export const mockReviews = [
  createReview({
    id: 'review_1',
    bookId: 'book_1',
    userId: 'user_1',
    username: 'lector_apasionado',
    userProfilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    rating: 5,
    title: 'Una obra maestra que redefine la literatura',
    content: 'Releer "Cien años de soledad" después de una década fue una experiencia completamente nueva. García Márquez teje una telaraña de personajes tan vívidos que parecen respirar en cada página. La forma en que entrelaza lo real con lo mágico es simplemente brillante. Cada relectura revela nuevas capas de significado. 📚✨ #RealismoMágico #LiteraturaLatinoamericana',
    spoilerWarning: false,
    tags: ['clásico', 'realismo mágico', 'relectura', 'favorito'],
    likes: ['user_2', 'user_3', 'user_4'],
    likesCount: 245,
    commentsCount: 42,
    readingStatus: 'read',
    progress: 100,
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  }),
  createReview({
    id: 'review_2',
    bookId: 'book_2',
    userId: 'user_2',
    username: 'bookworm_23',
    userProfilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 4,
    title: 'Magia, música y una prosa hipnótica',
    content: 'Rothfuss crea un mundo tan rico que es fácil perderse en él. La prosa es poética sin ser pretenciosa, y el sistema de magia basado en la simpatía es fascinante. Lo único que me dejó con ganas de más fue el ritmo en algunas partes. ¡Necesito el tercer libro ya! 🎶🔥 #Fantasía #KingkillerChronicle',
    spoilerWarning: false,
    tags: ['fantasía', 'prosa poética', 'saga', 'esperando continuación'],
    likes: ['user_1', 'user_4'],
    likesCount: 189,
    commentsCount: 31,
    readingStatus: 'read',
    progress: 100,
    createdAt: '2024-02-12T09:15:00Z',
    updatedAt: '2024-02-12T09:15:00Z'
  }),
  createReview({
    id: 'review_3',
    bookId: 'book_3',
    userId: 'user_3',
    username: 'literary_explorer',
    userProfilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    rating: 5,
    title: 'Un viaje épico por la historia humana',
    content: 'Harari tiene el don de hacer accesible lo complejo. Este libro cambió mi perspectiva sobre lo que significa ser humano. La forma en que conecta la revolución cognitiva, agrícola y científica es brillante. Me hizo cuestionar todo lo que daba por sentado. 🧠🌍 #Historia #Filosofía #Recomendación',
    spoilerWarning: false,
    tags: ['ensayo', 'historia', 'filosofía', 'libro que cambia perspectivas'],
    likes: ['user_1', 'user_2', 'user_4'],
    likesCount: 312,
    commentsCount: 56,
    readingStatus: 'read',
    progress: 100,
    createdAt: '2024-02-14T16:45:00Z',
    updatedAt: '2024-02-14T16:45:00Z'
  }),
  createReview({
    id: 'review_4',
    bookId: 'book_4',
    userId: 'user_4',
    username: 'philosophy_reader',
    userProfilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=400&h=400&fit=crop',
    rating: 5,
    title: 'Más relevante hoy que nunca',
    content: 'Releer "1984" en la era de la vigilancia masiva y las noticias falsas fue una experiencia escalofriante. La capacidad de Orwell para prever los peligros del totalitarismo digital es profética. "La guerra es la paz. La libertad es la esclavitud. La ignorancia es la fuerza." Estas palabras resuenan hoy más que nunca. ⚠️📡 #Distopía #Política #Vigilancia',
    spoilerWarning: false,
    tags: ['distopía', 'política', 'clásico', 'relevante'],
    likes: ['user_1', 'user_2', 'user_3'],
    likesCount: 278,
    commentsCount: 48,
    readingStatus: 'read',
    progress: 100,
    createdAt: '2024-02-15T11:20:00Z',
    updatedAt: '2024-02-15T11:20:00Z'
  }),
  createReview({
    id: 'review_5',
    bookId: 'book_5',
    userId: 'user_1',
    username: 'lector_apasionado',
    userProfilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    rating: 4,
    title: 'El amor como fuerza que trasciende el tiempo',
    content: 'García Márquez explora la paciencia del amor de una manera que solo él puede hacerlo. Florentino Ariza espera más de cincuenta años por Fermina Daza, y en ese tiempo el amor se transforma, madura, sufre y renace. Una lectura perfecta para reflexionar sobre la constancia en las relaciones. 💘⏳ #Amor #Paciencia #GarcíaMárquez',
    spoilerWarning: false,
    tags: ['amor', 'constancia', 'realismo mágico', 'reflexión'],
    likes: ['user_3', 'user_4'],
    likesCount: 167,
    commentsCount: 29,
    readingStatus: 'read',
    progress: 100,
    createdAt: '2024-02-16T18:10:00Z',
    updatedAt: '2024-02-16T18:10:00Z'
  })
];

// Actividades para el feed
export const mockActivities = [
  createActivity({
    id: 'activity_1',
    userId: 'user_1',
    username: 'lector_apasionado',
    userProfilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    type: 'review',
    action: 'published_review',
    targetType: 'book',
    targetId: 'book_1',
    targetData: {
      bookTitle: 'Cien años de soledad',
      bookAuthors: ['Gabriel García Márquez'],
      bookThumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w-300&h=450&fit=crop',
      reviewExcerpt: 'Releer "Cien años de soledad" después de una década fue una experiencia completamente nueva...'
    },
    content: 'Publicó una reseña de 5 estrellas',
    createdAt: '2024-02-10T14:30:00Z',
    _feedScore: 1644498600000
  }),
  createActivity({
    id: 'activity_2',
    userId: 'user_2',
    username: 'bookworm_23',
    userProfilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    type: 'review',
    action: 'published_review',
    targetType: 'book',
    targetId: 'book_2',
    targetData: {
      bookTitle: 'El nombre del viento',
      bookAuthors: ['Patrick Rothfuss'],
      bookThumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop',
      reviewExcerpt: 'Rothfuss crea un mundo tan rico que es fácil perderse en él...'
    },
    content: 'Publicó una reseña de 4 estrellas',
    createdAt: '2024-02-12T09:15:00Z',
    _feedScore: 1644657300000
  }),
  createActivity({
    id: 'activity_3',
    userId: 'user_3',
    username: 'literary_explorer',
    userProfilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    type: 'review',
    action: 'published_review',
    targetType: 'book',
    targetId: 'book_3',
    targetData: {
      bookTitle: 'Sapiens: De animales a dioses',
      bookAuthors: ['Yuval Noah Harari'],
      bookThumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
      reviewExcerpt: 'Harari tiene el don de hacer accesible lo complejo...'
    },
    content: 'Publicó una reseña de 5 estrellas',
    createdAt: '2024-02-14T16:45:00Z',
    _feedScore: 1644857100000
  }),
  createActivity({
    id: 'activity_4',
    userId: 'user_4',
    username: 'philosophy_reader',
    userProfilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=400&h=400&fit=crop',
    type: 'review',
    action: 'published_review',
    targetType: 'book',
    targetId: 'book_4',
    targetData: {
      bookTitle: '1984',
      bookAuthors: ['George Orwell'],
      bookThumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop',
      reviewExcerpt: 'Releer "1984" en la era de la vigilancia masiva...'
    },
    content: 'Publicó una reseña de 5 estrellas',
    createdAt: '2024-02-15T11:20:00Z',
    _feedScore: 1644924000000
  }),
  createActivity({
    id: 'activity_5',
    userId: 'user_1',
    username: 'lector_apasionado',
    userProfilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    type: 'review',
    action: 'published_review',
    targetType: 'book',
    targetId: 'book_5',
    targetData: {
      bookTitle: 'El amor en los tiempos del cólera',
      bookAuthors: ['Gabriel García Márquez'],
      bookThumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=450&fit=crop',
      reviewExcerpt: 'García Márquez explora la paciencia del amor...'
    },
    content: 'Publicó una reseña de 4 estrellas',
    createdAt: '2024-02-16T18:10:00Z',
    _feedScore: 1645035000000
  })
];

// Función para obtener posts combinados para el feed Instagram-like
export const getInstagramFeedPosts = () => {
  return mockReviews.map(review => {
    const book = mockBooks.find(b => b.id === review.bookId);
    const user = mockUsers.find(u => u.id === review.userId);

    return {
      id: review.id,
      type: 'review',
      user: {
        id: user?.id || '',
        username: user?.username || '',
        displayName: user?.displayName || '',
        profilePicURL: user?.profilePicURL || '',
        stats: user?.stats || { followersCount: 0, followingCount: 0 }
      },
      book: {
        id: book?.id || '',
        title: book?.title || '',
        authors: book?.authors || [],
        thumbnail: book?.thumbnail || '',
        image: book?.image || '',
        pageCount: book?.pageCount || 0,
        averageRating: book?.averageRating || 0
      },
      review: {
        rating: review.rating,
        title: review.title,
        content: review.content,
        excerpt: review.content.length > 280 ? review.content.substring(0, 280) + '...' : review.content,
        tags: review.tags,
        likesCount: review.likesCount,
        commentsCount: review.commentsCount,
        readingStatus: review.readingStatus,
        progress: review.progress
      },
      interactions: {
        isLiked: false,
        isSaved: false,
        likes: review.likes || [],
        comments: []
      },
      timestamp: review.createdAt,
      timeAgo: getTimeAgo(review.createdAt)
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Función auxiliar para calcular tiempo relativo
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes`;
  return `Hace ${Math.floor(diffDays / 365)} año`;
}

// Exportar todo
export default {
  mockUsers,
  mockBooks,
  mockReviews,
  mockActivities,
  getInstagramFeedPosts
};