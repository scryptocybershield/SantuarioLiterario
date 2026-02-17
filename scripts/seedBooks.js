#!/usr/bin/env node

/**
 * Script de seed para Santuario Literario - Goodreads/Instagram Clone
 * Pobla Firestore con 4 libros temáticos para el feed Instagram-like
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Configuración Firebase (usar variables de entorno del proyecto)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'demo-key-for-seed',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'santuario-literario.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'santuario-literario',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'santuario-literario.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

// Google Books API
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_BOOKS_API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY || 'demo-key';

// IDs de Google Books para los 4 libros temáticos
const BOOKS_TO_SEED = [
  {
    title: 'Santuario',
    author: 'William Faulkner',
    googleBooksId: 'v1p4DwAAQBAJ', // ID para Santuario de Faulkner
    userId: 'admin_user_1', // Usuario demo que crea el post
    initialReview: 'Una obra maestra del gótico sureño. Faulkner explora la corrupción y redención en el profundo sur americano con una prosa hipnótica que te atrapa desde la primera página.',
    rating: 5,
    hashtags: ['faulkner', 'literaturaamericana', 'góticosureño', 'clásico']
  },
  {
    title: 'El nombre de la rosa',
    author: 'Umberto Eco',
    googleBooksId: 'q0sqDwAAQBAJ', // ID para El nombre de la rosa
    userId: 'admin_user_2',
    initialReview: 'Una fascinante novela histórica y detectivesca ambientada en un monasterio medieval. Eco combina filosofía, semiótica y misterio en una trama que desafía al lector.',
    rating: 5,
    hashtags: ['umbertoeco', 'novelahistórica', 'misterio', 'filosofía']
  },
  {
    title: 'Circe',
    author: 'Madeline Miller',
    googleBooksId: '5v1FDwAAQBAJ', // ID para Circe
    userId: 'admin_user_3',
    initialReview: 'Una reinterpretación feminista del mito de Circe que da voz a una de las figuras más incomprendidas de la mitología griega. La prosa de Miller es pura poesía.',
    rating: 4,
    hashtags: ['madelinemiller', 'mitologíagriega', 'feminismo', 'reinterpretación']
  },
  {
    title: 'La canción de Aquiles',
    author: 'Madeline Miller',
    googleBooksId: 'BZ0bEAAAQBAJ', // ID para La canción de Aquiles
    userId: 'admin_user_1',
    initialReview: 'Una conmovedora historia de amor y guerra que reimagina la Ilíada desde la perspectiva de Patroclo. Una obra que te rompe el corazón y te lo recompone.',
    rating: 5,
    hashtags: ['madelinemiller', 'aquiles', 'mitologíagriega', 'amor', 'iliada']
  }
];

/**
 * Obtiene detalles de un libro desde Google Books API
 */
async function fetchBookDetails(googleBooksId) {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API}/${googleBooksId}`, {
      params: {
        key: GOOGLE_BOOKS_API_KEY
      }
    });

    const bookData = response.data;
    const volumeInfo = bookData.volumeInfo;

    return {
      googleBooksId,
      title: volumeInfo.title || '',
      authors: volumeInfo.authors || [],
      publisher: volumeInfo.publisher || '',
      publishedDate: volumeInfo.publishedDate || '',
      description: volumeInfo.description || '',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      thumbnail: volumeInfo.imageLinks?.thumbnail || '',
      image: volumeInfo.imageLinks?.extraLarge || volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.thumbnail || '',
      industryIdentifiers: volumeInfo.industryIdentifiers || [],
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0
    };
  } catch (error) {
    console.error(`Error fetching book ${googleBooksId}:`, error.message);
    return null;
  }
}

/**
 * Crea un post de Instagram-like para el feed
 */
function createInstagramPost(bookData, seedConfig) {
  const now = Timestamp.now();
  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: postId,
    type: 'review',
    userId: seedConfig.userId,
    bookId: bookData.googleBooksId,
    content: seedConfig.initialReview,
    rating: seedConfig.rating,
    likes: [], // Array vacío para empezar
    likesCount: 0,
    comments: [], // Array vacío para empezar
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    hashtags: seedConfig.hashtags,
    visibility: 'public',
    createdAt: now,
    updatedAt: now,
    engagementScore: 0 // Se calculará después
  };
}

/**
 * Crea un documento de libro en Firestore
 */
function createFirestoreBook(bookData) {
  return {
    googleBooksId: bookData.googleBooksId,
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
    likesCount: 0,
    savesCount: 0,
    sharesCount: 0,
    discoveryScore: 0,
    engagementRate: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
}

/**
 * Ejecuta el seed principal
 */
async function runSeed() {
  console.log('🚀 Iniciando seed de Santuario Literario...');
  console.log('📚 Libros a sembrar:', BOOKS_TO_SEED.length);

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase inicializado');

    // Procesar cada libro
    for (const [index, seedConfig] of BOOKS_TO_SEED.entries()) {
      console.log(`\n📖 Procesando libro ${index + 1}/${BOOKS_TO_SEED.length}: ${seedConfig.title}`);

      // 1. Obtener detalles del libro desde Google Books
      console.log(`   🔍 Obteniendo detalles de Google Books...`);
      const bookDetails = await fetchBookDetails(seedConfig.googleBooksId);

      if (!bookDetails) {
        console.log(`   ⚠️  Saltando ${seedConfig.title} - no se pudieron obtener detalles`);
        continue;
      }

      console.log(`   ✅ Detalles obtenidos: ${bookDetails.title}`);

      // 2. Guardar libro en Firestore
      const bookDocRef = doc(collection(db, 'books'), bookDetails.googleBooksId);
      const firestoreBook = createFirestoreBook(bookDetails);

      await setDoc(bookDocRef, firestoreBook);
      console.log(`   💾 Libro guardado en Firestore: ${bookDetails.googleBooksId}`);

      // 3. Crear post Instagram-like
      const instagramPost = createInstagramPost(bookDetails, seedConfig);
      const postDocRef = doc(collection(db, 'posts'), instagramPost.id);

      await setDoc(postDocRef, instagramPost);
      console.log(`   📝 Post creado: ${instagramPost.id}`);

      // 4. Indexar descripción para recomendaciones semánticas
      console.log(`   🔤 Indexando descripción para recomendaciones...`);
      // Aquí iría la lógica para indexar en mxbai store
      // Por ahora solo registramos
      console.log(`   📊 Descripción lista para indexación (${bookDetails.description?.length || 0} caracteres)`);

      // Pequeña pausa para no saturar APIs
      if (index < BOOKS_TO_SEED.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - Libros procesados: ${BOOKS_TO_SEED.length}`);
    console.log(`   - Posts creados: ${BOOKS_TO_SEED.length}`);
    console.log(`   - Datos listos para feed Instagram-like`);
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Ejecutar: mxbai store para indexar descripciones');
    console.log('   2. Agente 3 puede usar datos indexados para recomendaciones');
    console.log('   3. Probar feed en: npm run dev');

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

module.exports = { runSeed, BOOKS_TO_SEED, fetchBookDetails };