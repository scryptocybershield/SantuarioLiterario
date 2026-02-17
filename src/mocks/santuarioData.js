/**
 * Datos mock para Santuario Literario - Goodreads/Instagram Clone
 * Datos temáticos para desarrollo y testing
 */

export const SANTUARIO_BOOKS = [
  {
    id: 'faulkner_santuario',
    googleBooksId: 'faulkner_santuario',
    title: 'Santuario',
    authors: ['William Faulkner'],
    description: 'Una obra maestra del gótico sureño que explora la corrupción y redención en el profundo sur americano. Publicada en 1931, esta novela sigue a Temple Drake, una joven universitaria cuya vida da un giro trágico cuando es secuestrada por una banda de contrabandistas de whisky.',
    pageCount: 320,
    categories: ['Ficción', 'Literatura Americana', 'Gótico Sureño', 'Clásico'],
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop',
    averageRating: 4.2,
    ratingsCount: 1250,
    publishedDate: '1931',
    publisher: 'Random House',
    // Campos Instagram-like
    likesCount: 42,
    savesCount: 18,
    sharesCount: 7,
    discoveryScore: 85,
    engagementRate: 0.65
  },
  {
    id: 'eco_nombre_rosa',
    googleBooksId: 'eco_nombre_rosa',
    title: 'El nombre de la rosa',
    authors: ['Umberto Eco'],
    description: 'Una fascinante novela histórica y detectivesca ambientada en un monasterio benedictino en el año 1327. El fraile franciscano Guillermo de Baskerville investiga una serie de misteriosas muertes mientras explora temas de filosofía, semiótica y teología medieval.',
    pageCount: 536,
    categories: ['Ficción', 'Novela Histórica', 'Misterio', 'Filosofía'],
    thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop',
    averageRating: 4.5,
    ratingsCount: 8900,
    publishedDate: '1980',
    publisher: 'Bompiani',
    likesCount: 156,
    savesCount: 89,
    sharesCount: 23,
    discoveryScore: 92,
    engagementRate: 0.78
  },
  {
    id: 'miller_circe',
    googleBooksId: 'miller_circe',
    title: 'Circe',
    authors: ['Madeline Miller'],
    description: 'Una reinterpretación feminista del mito de Circe, la hechicera de la Odisea. La novela da voz a una de las figuras más incomprendidas de la mitología griega, explorando temas de poder, soledad, inmortalidad y la búsqueda de identidad.',
    pageCount: 393,
    categories: ['Ficción', 'Mitología Griega', 'Feminismo', 'Reinterpretación'],
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1200&fit=crop',
    averageRating: 4.7,
    ratingsCount: 15600,
    publishedDate: '2018',
    publisher: 'Little, Brown and Company',
    likesCount: 234,
    savesCount: 145,
    sharesCount: 67,
    discoveryScore: 95,
    engagementRate: 0.82
  },
  {
    id: 'miller_aquiles',
    googleBooksId: 'miller_aquiles',
    title: 'La canción de Aquiles',
    authors: ['Madeline Miller'],
    description: 'Una conmovedora historia de amor y guerra que reimagina la Ilíada desde la perspectiva de Patroclo. La novela explora la relación entre Aquiles y Patroclo, desde su infancia hasta los campos de batalla de Troya, en una narrativa lírica y emocionalmente poderosa.',
    pageCount: 378,
    categories: ['Ficción', 'Mitología Griega', 'Romance', 'Histórica'],
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
    averageRating: 4.8,
    ratingsCount: 23400,
    publishedDate: '2011',
    publisher: 'Ecco Press',
    likesCount: 312,
    savesCount: 198,
    sharesCount: 89,
    discoveryScore: 98,
    engagementRate: 0.88
  }
];

export const SANTUARIO_USERS = [
  {
    uid: 'admin_user_1',
    username: 'lector_profundo',
    displayName: 'Lector Profundo',
    email: 'lector@santuario.com',
    bio: 'Amante de los clásicos y la literatura introspectiva.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
    followersCount: 42,
    followingCount: 38,
    postsCount: 15,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString()
  },
  {
    uid: 'admin_user_2',
    username: 'biblioteca_viva',
    displayName: 'Biblioteca Viva',
    email: 'biblioteca@santuario.com',
    bio: 'Coleccionista de historias y guardián de relatos.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    followersCount: 89,
    followingCount: 67,
    postsCount: 28,
    createdAt: new Date('2023-11-20').toISOString(),
    updatedAt: new Date('2024-02-12').toISOString()
  },
  {
    uid: 'admin_user_3',
    username: 'mitologa_moderna',
    displayName: 'Mitóloga Moderna',
    email: 'mitologia@santuario.com',
    bio: 'Reinterpretando mitos antiguos para lectores contemporáneos.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    followersCount: 156,
    followingCount: 124,
    postsCount: 42,
    createdAt: new Date('2023-09-05').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString()
  }
];

export const SANTUARIO_POSTS = [
  {
    id: 'post_faulkner_review',
    type: 'review',
    userId: 'admin_user_1',
    bookId: 'faulkner_santuario',
    content: 'Una obra maestra del gótico sureño. Faulkner explora la corrupción y redención en el profundo sur americano con una prosa hipnótica que te atrapa desde la primera página.',
    rating: 5,
    likes: ['user_2', 'user_3', 'user_4', 'user_5', 'user_6'],
    likesCount: 5,
    comments: [
      { id: 'comment_1', userId: 'admin_user_2', content: 'Totalmente de acuerdo, la atmósfera es increíble.', createdAt: new Date('2024-02-10').toISOString() },
      { id: 'comment_2', userId: 'admin_user_3', content: '¿Has leído "El sonido y la furia"?', createdAt: new Date('2024-02-11').toISOString() }
    ],
    commentsCount: 2,
    sharesCount: 3,
    savesCount: 7,
    hashtags: ['faulkner', 'literaturaamericana', 'góticosureño', 'clásico'],
    visibility: 'public',
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
    engagementScore: 45
  },
  {
    id: 'post_eco_review',
    type: 'review',
    userId: 'admin_user_2',
    bookId: 'eco_nombre_rosa',
    content: 'Una fascinante novela histórica y detectivesca ambientada en un monasterio medieval. Eco combina filosofía, semiótica y misterio en una trama que desafía al lector.',
    rating: 5,
    likes: ['user_1', 'user_3', 'user_7', 'user_8', 'user_9', 'user_10'],
    likesCount: 6,
    comments: [
      { id: 'comment_3', userId: 'admin_user_1', content: 'La parte sobre los manuscritos perdidos es fascinante.', createdAt: new Date('2024-02-08').toISOString() }
    ],
    commentsCount: 1,
    sharesCount: 5,
    savesCount: 12,
    hashtags: ['umbertoeco', 'novelahistórica', 'misterio', 'filosofía'],
    visibility: 'public',
    createdAt: new Date('2024-02-03').toISOString(),
    updatedAt: new Date('2024-02-03').toISOString(),
    engagementScore: 62
  },
  {
    id: 'post_circe_review',
    type: 'review',
    userId: 'admin_user_3',
    bookId: 'miller_circe',
    content: 'Una reinterpretación feminista del mito de Circe que da voz a una de las figuras más incomprendidas de la mitología griega. La prosa de Miller es pura poesía.',
    rating: 4,
    likes: ['user_1', 'user_2', 'user_4', 'user_11', 'user_12', 'user_13', 'user_14'],
    likesCount: 7,
    comments: [
      { id: 'comment_4', userId: 'admin_user_1', content: 'Me encantó cómo humanizó a Circe.', createdAt: new Date('2024-02-01').toISOString() },
      { id: 'comment_5', userId: 'admin_user_2', content: '¿Recomiendas "La canción de Aquiles"?', createdAt: new Date('2024-02-02').toISOString() }
    ],
    commentsCount: 2,
    sharesCount: 8,
    savesCount: 15,
    hashtags: ['madelinemiller', 'mitologíagriega', 'feminismo', 'reinterpretación'],
    visibility: 'public',
    createdAt: new Date('2024-01-28').toISOString(),
    updatedAt: new Date('2024-01-28').toISOString(),
    engagementScore: 78
  },
  {
    id: 'post_aquiles_review',
    type: 'review',
    userId: 'admin_user_1',
    bookId: 'miller_aquiles',
    content: 'Una conmovedora historia de amor y guerra que reimagina la Ilíada desde la perspectiva de Patroclo. Una obra que te rompe el corazón y te lo recompone.',
    rating: 5,
    likes: ['user_2', 'user_3', 'user_5', 'user_6', 'user_7', 'user_8', 'user_9', 'user_10', 'user_15'],
    likesCount: 9,
    comments: [
      { id: 'comment_6', userId: 'admin_user_3', content: 'Lloré con el final, es precioso.', createdAt: new Date('2024-01-25').toISOString() },
      { id: 'comment_7', userId: 'admin_user_2', content: 'Una de las mejores novelas que he leído este año.', createdAt: new Date('2024-01-26').toISOString() },
      { id: 'comment_8', userId: 'user_16', content: '¿Alguien más piensa que debería ser película?', createdAt: new Date('2024-01-27').toISOString() }
    ],
    commentsCount: 3,
    sharesCount: 12,
    savesCount: 21,
    hashtags: ['madelinemiller', 'aquiles', 'mitologíagriega', 'amor', 'iliada'],
    visibility: 'public',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    engagementScore: 95
  }
];

/**
 * Función para obtener el feed Instagram-like
 */
export function getInstagramFeed() {
  return SANTUARIO_POSTS.map(post => {
    const user = SANTUARIO_USERS.find(u => u.uid === post.userId);
    const book = SANTUARIO_BOOKS.find(b => b.id === post.bookId);

    return {
      ...post,
      user,
      book,
      // Datos calculados para UI
      timeAgo: getTimeAgo(new Date(post.createdAt)),
      isLiked: false, // Por defecto no liked
      isSaved: false  // Por defecto no saved
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Ordenar por fecha descendente
}

/**
 * Función para obtener recomendaciones basadas en un libro
 */
export function getBookRecommendations(bookId, limit = 3) {
  const sourceBook = SANTUARIO_BOOKS.find(b => b.id === bookId);
  if (!sourceBook) return [];

  // Simular recomendaciones basadas en categorías similares
  return SANTUARIO_BOOKS
    .filter(b => b.id !== bookId)
    .map(book => ({
      ...book,
      similarityScore: calculateSimilarity(sourceBook, book)
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}

/**
 * Calcular similitud entre libros (simplificado)
 */
function calculateSimilarity(bookA, bookB) {
  let score = 0;

  // Mismo autor: +40 puntos
  if (bookA.authors.some(author => bookB.authors.includes(author))) {
    score += 40;
  }

  // Categorías comunes: +20 por categoría común
  const commonCategories = bookA.categories.filter(cat => bookB.categories.includes(cat));
  score += commonCategories.length * 20;

  // Rating similar: +10 si diferencia < 0.5
  if (Math.abs(bookA.averageRating - bookB.averageRating) < 0.5) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Formatear fecha como "hace X tiempo"
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays < 7) return `hace ${diffDays} d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} mes`;
  return `hace ${Math.floor(diffDays / 365)} año`;
}

export default {
  SANTUARIO_BOOKS,
  SANTUARIO_USERS,
  SANTUARIO_POSTS,
  getInstagramFeed,
  getBookRecommendations
};