#!/usr/bin/env node

/**
 * Script de seed MOCK para Santuario Literario - Goodreads/Instagram Clone
 * Pobla Firestore con datos mock para desarrollo y testing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp, connectFirestoreEmulator } = require('firebase/firestore');
require('dotenv').config({ path: '../.env' });

// Configurar emulador Firestore para desarrollo local
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
console.log('🔧 Configurando emulador Firestore en:', process.env.FIRESTORE_EMULATOR_HOST);

// Configuración Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Datos mock para 4 libros temáticos "Santuario"
// IDs simplificados para Firestore (sin caracteres especiales)
const MOCK_BOOKS = [
  {
    id: 'faulkner_santuario',
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
    publisher: 'Random House'
  },
  {
    id: 'eco_nombre_rosa',
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
    publisher: 'Bompiani'
  },
  {
    id: 'miller_circe',
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
    publisher: 'Little, Brown and Company'
  },
  {
    id: 'miller_aquiles',
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
    publisher: 'Ecco Press'
  }
];

// Usuarios mock
const MOCK_USERS = [
  {
    id: 'admin_user_1',
    username: 'lector_profundo',
    displayName: 'Lector Profundo',
    email: 'lector@santuario.com',
    bio: 'Amante de los clásicos y la literatura introspectiva.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
    followersCount: 42,
    followingCount: 38,
    postsCount: 15
  },
  {
    id: 'admin_user_2',
    username: 'biblioteca_viva',
    displayName: 'Biblioteca Viva',
    email: 'biblioteca@santuario.com',
    bio: 'Coleccionista de historias y guardian de relatos.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    followersCount: 89,
    followingCount: 67,
    postsCount: 28
  },
  {
    id: 'admin_user_3',
    username: 'mitologa_moderna',
    displayName: 'Mitóloga Moderna',
    email: 'mitologia@santuario.com',
    bio: 'Reinterpretando mitos antiguos para lectores contemporáneos.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    followersCount: 156,
    followingCount: 124,
    postsCount: 42
  }
];

// Reviews/Posts mock
const MOCK_POSTS = [
  {
    bookId: 'faulkner_santuario',
    userId: 'admin_user_1',
    review: 'Una obra maestra del gótico sureño. Faulkner explora la corrupción y redención en el profundo sur americano con una prosa hipnótica que te atrapa desde la primera página.',
    rating: 5,
    hashtags: ['faulkner', 'literaturaamericana', 'góticosureño', 'clásico']
  },
  {
    bookId: 'eco_nombre_rosa',
    userId: 'admin_user_2',
    review: 'Una fascinante novela histórica y detectivesca ambientada en un monasterio medieval. Eco combina filosofía, semiótica y misterio en una trama que desafía al lector.',
    rating: 5,
    hashtags: ['umbertoeco', 'novelahistórica', 'misterio', 'filosofía']
  },
  {
    bookId: 'miller_circe',
    userId: 'admin_user_3',
    review: 'Una reinterpretación feminista del mito de Circe que da voz a una de las figuras más incomprendidas de la mitología griega. La prosa de Miller es pura poesía.',
    rating: 4,
    hashtags: ['madelinemiller', 'mitologíagriega', 'feminismo', 'reinterpretación']
  },
  {
    bookId: 'miller_aquiles',
    userId: 'admin_user_1',
    review: 'Una conmovedora historia de amor y guerra que reimagina la Ilíada desde la perspectiva de Patroclo. Una obra que te rompe el corazón y te lo recompone.',
    rating: 5,
    hashtags: ['madelinemiller', 'aquiles', 'mitologíagriega', 'amor', 'iliada']
  }
];

/**
 * Crea un documento de libro en Firestore
 */
function createFirestoreBook(bookData) {
  const now = Timestamp.now();
  return {
    googleBooksId: bookData.id,
    title: bookData.title,
    authors: bookData.authors,
    description: bookData.description,
    pageCount: bookData.pageCount,
    categories: bookData.categories,
    thumbnail: bookData.thumbnail,
    image: bookData.image,
    averageRating: bookData.averageRating,
    ratingsCount: bookData.ratingsCount,
    publishedDate: bookData.publishedDate,
    publisher: bookData.publisher,
    // Campos para Instagram-like
    likesCount: Math.floor(Math.random() * 100) + 20,
    savesCount: Math.floor(Math.random() * 50) + 10,
    sharesCount: Math.floor(Math.random() * 30) + 5,
    discoveryScore: Math.floor(Math.random() * 100),
    engagementRate: Math.random() * 0.5 + 0.3,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Crea un documento de usuario en Firestore
 */
function createFirestoreUser(userData) {
  const now = Timestamp.now();
  return {
    uid: userData.id,
    username: userData.username,
    displayName: userData.displayName,
    email: userData.email,
    bio: userData.bio,
    avatar: userData.avatar,
    followersCount: userData.followersCount,
    followingCount: userData.followingCount,
    postsCount: userData.postsCount,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Crea un post de Instagram-like para el feed
 */
function createInstagramPost(postConfig, bookData, userData, index) {
  const now = Timestamp.now();
  const postId = `post_${Date.now()}_${index}`;

  // Generar algunos likes y comentarios mock
  const likesCount = Math.floor(Math.random() * 50) + 10;
  const commentsCount = Math.floor(Math.random() * 20) + 3;
  const savesCount = Math.floor(Math.random() * 30) + 5;

  return {
    id: postId,
    type: 'review',
    userId: postConfig.userId,
    bookId: postConfig.bookId,
    content: postConfig.review,
    rating: postConfig.rating,
    likes: Array.from({ length: likesCount }, (_, i) => `user_like_${i}`),
    likesCount: likesCount,
    comments: Array.from({ length: commentsCount }, (_, i) => ({
      id: `comment_${i}`,
      userId: `user_comment_${i}`,
      content: `Comentario de ejemplo ${i + 1}`,
      createdAt: now
    })),
    commentsCount: commentsCount,
    sharesCount: Math.floor(Math.random() * 15) + 2,
    savesCount: savesCount,
    hashtags: postConfig.hashtags,
    visibility: 'public',
    createdAt: Timestamp.fromMillis(now.toMillis() - (index * 86400000)), // Días diferentes
    updatedAt: now,
    engagementScore: (likesCount * 0.4 + commentsCount * 0.3 + savesCount * 0.3) * 10
  };
}

/**
 * Ejecuta el seed principal
 */
async function runSeed() {
  console.log('🚀 Iniciando seed MOCK de Santuario Literario...');
  console.log('📚 Libros a sembrar:', MOCK_BOOKS.length);
  console.log('👥 Usuarios a crear:', MOCK_USERS.length);
  console.log('📝 Posts a generar:', MOCK_POSTS.length);

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Conectar al emulador Firestore
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
      connectFirestoreEmulator(db, host, parseInt(port));
      console.log(`✅ Conectado al emulador Firestore: ${host}:${port}`);
    } else {
      console.log('⚠️  Usando Firestore en producción (sin emulador)');
    }

    console.log('✅ Firebase inicializado');

    // 1. Crear usuarios
    console.log('\n👥 Creando usuarios...');
    for (const userData of MOCK_USERS) {
      const userDocRef = doc(collection(db, 'users'), userData.id);
      const firestoreUser = createFirestoreUser(userData);
      await setDoc(userDocRef, firestoreUser);
      console.log(`   ✅ Usuario creado: ${userData.username}`);
    }

    // 2. Crear libros
    console.log('\n📚 Creando libros...');
    for (const bookData of MOCK_BOOKS) {
      const bookDocRef = doc(collection(db, 'books'), bookData.id);
      const firestoreBook = createFirestoreBook(bookData);
      await setDoc(bookDocRef, firestoreBook);
      console.log(`   ✅ Libro creado: ${bookData.title}`);
    }

    // 3. Crear posts (reviews Instagram-like)
    console.log('\n📝 Creando posts Instagram-like...');
    for (const [index, postConfig] of MOCK_POSTS.entries()) {
      const bookData = MOCK_BOOKS.find(b => b.id === postConfig.bookId);
      const userData = MOCK_USERS.find(u => u.id === postConfig.userId);

      if (!bookData || !userData) {
        console.log(`   ⚠️  Saltando post ${index} - datos incompletos`);
        continue;
      }

      const instagramPost = createInstagramPost(postConfig, bookData, userData, index);
      const postDocRef = doc(collection(db, 'posts'), instagramPost.id);

      await setDoc(postDocRef, instagramPost);
      console.log(`   ✅ Post creado: ${bookData.title} por ${userData.username}`);
    }

    console.log('\n🎉 Seed MOCK completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - Usuarios creados: ${MOCK_USERS.length}`);
    console.log(`   - Libros creados: ${MOCK_BOOKS.length}`);
    console.log(`   - Posts creados: ${MOCK_POSTS.length}`);
    console.log(`   - Datos listos para feed Instagram-like`);

    console.log('\n🔤 Datos listos para indexación semántica:');
    console.log('   - Descripciones de libros disponibles para mxbai store');
    console.log('   - Agente 3 puede usar estos datos para recomendaciones');

    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Ejecutar: mxbai store para indexar descripciones');
    console.log('   2. Agente 3 puede usar datos indexados para recomendaciones');
    console.log('   3. Probar feed Instagram-like: npm run dev');
    console.log('   4. Navegar a: http://localhost:5173 y ver pestaña "✨ Feed Social"');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, MOCK_BOOKS, MOCK_USERS, MOCK_POSTS };