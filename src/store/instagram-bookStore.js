// Store de Zustand para libros con funcionalidades Instagram-like
// Extensión del store de libros original con capacidades sociales

import { create } from 'zustand';
import { searchBooks, getBookDetails } from '../services/googleBooks';
import { db, auth } from '../firebase/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  limit,
} from 'firebase/firestore';
import {
  createBook,
  fromFirestore,
  toFirestore,
  type Book
} from '../models/instagram-models';

const useInstagramBookStore = create((set, get) => ({
  // Estado
  searchResults: [],
  myLibrary: [],                    // Libros guardados por el usuario
  trendingBooks: [],                // Libros trending (Instagram-like)
  recommendedBooks: [],             // Libros recomendados personalizados
  discoveredBooks: [],              // Libros descubiertos recientemente
  selectedBook: null,
  bookDetails: {},                  // Detalles cacheados por bookId
  bookPosts: {},                    // Posts por libro {bookId: []}
  bookReviews: {},                  // Reseñas por libro {bookId: []}
  bookStats: {},                    // Estadísticas por libro {bookId: {}}

  isLoading: false,
  searchError: null,
  libraryFilter: 'all',             // 'all', 'want-to-read', 'currently-reading', 'read', 'favorites'
  discoveryFilter: 'trending',      // 'trending', 'recommended', 'new', 'popular'

  // ==================== ACCIONES PRINCIPALES ====================

  /**
   * Busca libros en Google Books API
   */
  searchBooks: async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      set({ searchResults: [], searchError: null });
      return;
    }

    set({ isLoading: true, searchError: null });

    try {
      const results = await searchBooks(searchQuery);
      set({
        searchResults: results,
        isLoading: false,
        searchError: null,
      });
    } catch (error) {
      console.error('Error en búsqueda de libros:', error);
      set({
        searchResults: [],
        isLoading: false,
        searchError: error.message,
      });
    }
  },

  /**
   * Limpia los resultados de búsqueda
   */
  clearSearchResults: () => set({ searchResults: [], searchError: null }),

  /**
   * Obtiene detalles de un libro con caching
   */
  getBookDetails: async (bookId: string, forceRefresh = false) => {
    if (!bookId) {
      set({ selectedBook: null });
      return;
    }

    // Verificar si ya tenemos los detalles cacheados
    if (!forceRefresh && get().bookDetails[bookId]) {
      set({ selectedBook: get().bookDetails[bookId] });
      return;
    }

    // Verificar si está en resultados de búsqueda o biblioteca
    const { searchResults, myLibrary } = get();
    const foundBook = searchResults.find(book => book.id === bookId) ||
      myLibrary.find(book => book.bookId === bookId);

    if (foundBook && !forceRefresh) {
      set({ selectedBook: foundBook });
      return;
    }

    // Si no se encuentra, obtener detalles de la API
    set({ isLoading: true });

    try {
      const bookDetails = await getBookDetails(bookId);

      // Enriquecer con datos sociales de Firestore si están disponibles
      const enrichedBook = await get().enrichBookWithSocialData(bookDetails);

      // Cachear detalles
      set(state => ({
        selectedBook: enrichedBook,
        bookDetails: {
          ...state.bookDetails,
          [bookId]: enrichedBook,
        },
        isLoading: false,
      }));

      // Cargar posts y reseñas del libro
      await get().loadBookPosts(bookId);
      await get().loadBookReviews(bookId);
      await get().loadBookStats(bookId);

    } catch (error) {
      console.error(`Error obteniendo detalles del libro ${bookId}:`, error);
      set({
        selectedBook: null,
        isLoading: false,
        searchError: error.message,
      });
    }
  },

  /**
   * Enriquece un libro con datos sociales de Firestore
   */
  enrichBookWithSocialData: async (bookData: any): Promise<Book> => {
    try {
      // Buscar libro en Firestore (colección books cache)
      const booksCollection = collection(db, 'books');
      const q = query(booksCollection, where('id', '==', bookData.id));
      const querySnapshot = await getDocs(q);

      let firestoreBook = null;
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        firestoreBook = fromFirestore(docSnap.data());
      }

      // Combinar datos de API con datos sociales de Firestore
      const enrichedBook: Book = {
        ...createBook(bookData),
        // Mantener datos de la API
        ...bookData,
        // Sobrescribir con datos sociales si existen
        ...(firestoreBook ? {
          averageRating: firestoreBook.averageRating || bookData.averageRating || 0,
          ratingsCount: firestoreBook.ratingsCount || bookData.ratingsCount || 0,
          reviewsCount: firestoreBook.reviewsCount || bookData.reviewsCount || 0,
          likesCount: firestoreBook.likesCount || 0,
          savesCount: firestoreBook.savesCount || 0,
          sharesCount: firestoreBook.sharesCount || 0,
          shelvesCount: firestoreBook.shelvesCount || {
            wantToRead: 0,
            currentlyReading: 0,
            read: 0,
            favorites: 0,
            recommended: 0,
            trending: 0,
          },
          trendingScore: firestoreBook.trendingScore || 0,
          discoveryScore: firestoreBook.discoveryScore || 0,
          engagementRate: firestoreBook.engagementRate || 0,
          hashtags: firestoreBook.hashtags || [],
          mentions: firestoreBook.mentions || [],
          lastUpdated: firestoreBook.lastUpdated || new Date().toISOString(),
        } : {}),
      };

      return enrichedBook;
    } catch (error) {
      console.error('Error enriqueciendo libro con datos sociales:', error);
      return createBook(bookData);
    }
  },

  /**
   * Agrega un libro a la biblioteca del usuario
   */
  addToLibrary: async (bookData: any, userId: string, status = 'want-to-read') => {
    if (!bookData || !bookData.id || !userId) {
      console.error('Datos de libro o usuario inválidos');
      return;
    }

    const { myLibrary } = get();

    // Verificar si el libro ya está en la biblioteca
    const existingBook = myLibrary.find(book => book.bookId === bookData.id && book.userId === userId);
    if (existingBook) {
      console.warn('El libro ya está en tu biblioteca');
      return;
    }

    // Crear objeto de lectura para Firestore
    const readingRecord = {
      userId,
      bookId: bookData.id,
      title: bookData.title || 'Título no disponible',
      authors: bookData.authors || [],
      thumbnail: bookData.thumbnail || '',
      image: bookData.image || bookData.thumbnail || '',
      publisher: bookData.publisher || 'Editorial no disponible',
      publishedDate: bookData.publishedDate || '',
      description: bookData.description || '',
      pageCount: bookData.pageCount || 0,
      categories: bookData.categories || [],
      isbn: bookData.isbn || '',

      // Metadatos de lectura personal
      readingStatus: status,
      progress: status === 'read' ? 100 : 0,
      currentPage: 0,
      addedAt: serverTimestamp(),
      startedAt: (status === 'currently-reading' || status === 'read') ? serverTimestamp() : null,
      finishedAt: status === 'read' ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),

      // Diario privado de lectura
      privateNotes: [],
      publicRating: 0,
      publicReview: '',
      tags: [],

      // Datos sociales (Instagram-like)
      isFavorite: false,
      isRecommended: false,
      personalTags: [],
      readingSessions: [],
      lastReadAt: null,
    };

    set({ isLoading: true });

    try {
      // Guardar en Firestore
      const readingsCollection = collection(db, 'readings');
      const docRef = await addDoc(readingsCollection, readingRecord);

      // Actualizar cache del libro en Firestore
      await get().updateBookSocialStats(bookData.id, {
        shelvesCount: {
          [status === 'want-to-read' ? 'wantToRead' :
           status === 'currently-reading' ? 'currentlyReading' :
           status === 'read' ? 'read' : 'wantToRead']: serverTimestamp() // Incrementará con Cloud Function
        }
      });

      // Actualizar estado local
      const localRecord = {
        ...readingRecord,
        id: docRef.id,
        firestoreId: docRef.id,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: readingRecord.startedAt ? new Date().toISOString() : null,
        finishedAt: readingRecord.finishedAt ? new Date().toISOString() : null,
      };

      set(state => ({
        myLibrary: [localRecord, ...state.myLibrary],
        isLoading: false,
      }));

      // Crear actividad
      await get().createActivity({
        type: 'shelf_add',
        action: 'added',
        targetType: 'book',
        targetId: bookData.id,
        userId,
        content: `añadió "${bookData.title}" a ${status === 'want-to-read' ? 'por leer' :
                 status === 'currently-reading' ? 'leyendo actualmente' : 'leídos'}`,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error agregando libro a Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Actualiza estadísticas sociales de un libro en Firestore
   */
  updateBookSocialStats: async (bookId: string, updates: any) => {
    try {
      // Buscar libro en cache de Firestore
      const booksCollection = collection(db, 'books');
      const q = query(booksCollection, where('id', '==', bookId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Actualizar libro existente
        const docSnap = querySnapshot.docs[0];
        const bookRef = doc(db, 'books', docSnap.id);
        await updateDoc(bookRef, {
          ...updates,
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Crear nuevo registro en cache
        // Necesitaríamos más datos del libro, esto es un placeholder
        console.log('Libro no encontrado en cache, necesitaría crear registro');
      }
    } catch (error) {
      console.error('Error actualizando estadísticas sociales del libro:', error);
    }
  },

  /**
   * Marca/desmarca un libro como favorito
   */
  toggleFavorite: async (firestoreId: string, userId: string, isFavorite: boolean) => {
    if (!firestoreId || !userId) return;

    set({ isLoading: true });

    try {
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, {
        isFavorite,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              isFavorite,
              updatedAt: new Date().toISOString(),
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      // Actualizar estadísticas del libro
      const book = get().myLibrary.find(b => b.id === firestoreId);
      if (book) {
        await get().updateBookSocialStats(book.bookId, {
          shelvesCount: {
            favorites: serverTimestamp() // Incrementará/decrementará con Cloud Function
          }
        });
      }

    } catch (error) {
      console.error('Error actualizando favorito:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Da like a un libro (nueva funcionalidad social)
   */
  likeBook: async (bookId: string, userId: string) => {
    if (!bookId || !userId) return;

    set({ isLoading: true });

    try {
      // Actualizar en colección de libros (cache)
      await get().updateBookSocialStats(bookId, {
        likes: arrayUnion(userId),
        likesCount: serverTimestamp(), // Cloud Function actualizará
      });

      // Crear actividad
      await get().createActivity({
        type: 'like',
        action: 'liked',
        targetType: 'book',
        targetId: bookId,
        userId,
      });

      set({ isLoading: false });

    } catch (error) {
      console.error('Error dando like al libro:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Guarda un libro para leer después (bookmark social)
   */
  saveBook: async (bookId: string, userId: string) => {
    if (!bookId || !userId) return;

    set({ isLoading: true });

    try {
      // Actualizar en colección de libros (cache)
      await get().updateBookSocialStats(bookId, {
        saves: arrayUnion(userId),
        savesCount: serverTimestamp(), // Cloud Function actualizará
      });

      // Crear actividad
      await get().createActivity({
        type: 'shelf_add',
        action: 'saved',
        targetType: 'book',
        targetId: bookId,
        userId,
        content: 'guardó este libro para leer después',
      });

      set({ isLoading: false });

    } catch (error) {
      console.error('Error guardando libro:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Comparte un libro (nueva funcionalidad social)
   */
  shareBook: async (bookId: string, userId: string) => {
    if (!bookId || !userId) return;

    set({ isLoading: true });

    try {
      // Actualizar en colección de libros (cache)
      await get().updateBookSocialStats(bookId, {
        shares: arrayUnion(userId),
        sharesCount: serverTimestamp(), // Cloud Function actualizará
      });

      // Crear actividad
      await get().createActivity({
        type: 'share',
        action: 'shared',
        targetType: 'book',
        targetId: bookId,
        userId,
        content: 'compartió este libro',
      });

      set({ isLoading: false });

    } catch (error) {
      console.error('Error compartiendo libro:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Carga libros trending (Instagram-like)
   */
  loadTrendingBooks: async () => {
    set({ isLoading: true, error: null });

    try {
      const booksCollection = collection(db, 'books');
      const q = query(
        booksCollection,
        where('trendingScore', '>=', 50),
        orderBy('trendingScore', 'desc'),
        orderBy('engagementRate', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const books = [];

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        books.push({
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
        });
      });

      set({
        trendingBooks: books,
        isLoading: false,
      });

    } catch (error) {
      console.error('Error cargando libros trending:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Carga libros recomendados personalizados
   */
  loadRecommendedBooks: async (userId: string) => {
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      // Esta sería una consulta más compleja basada en:
      // 1. Géneros favoritos del usuario
      // 2. Autores favoritos
      // 3. Libros leídos por usuarios similares
      // 4. Trending score

      // Por ahora, cargamos libros con alto discovery score
      const booksCollection = collection(db, 'books');
      const q = query(
        booksCollection,
        where('discoveryScore', '>=', 30),
        orderBy('discoveryScore', 'desc'),
        limit(15)
      );

      const querySnapshot = await getDocs(q);
      const books = [];

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        books.push({
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
        });
      });

      set({
        recommendedBooks: books,
        isLoading: false,
      });

    } catch (error) {
      console.error('Error cargando libros recomendados:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Carga libros recién descubiertos
   */
  loadDiscoveredBooks: async () => {
    set({ isLoading: true, error: null });

    try {
      const booksCollection = collection(db, 'books');
      const q = query(
        booksCollection,
        orderBy('createdAt', 'desc'),
        limit(15)
      );

      const querySnapshot = await getDocs(q);
      const books = [];

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        books.push({
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
        });
      });

      set({
        discoveredBooks: books,
        isLoading: false,
      });

    } catch (error) {
      console.error('Error cargando libros descubiertos:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Carga posts de un libro específico
   */
  loadBookPosts: async (bookId: string) => {
    if (!bookId) return;

    try {
      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection,
        where('bookId', '==', bookId),
        where('visibility', '!=', 'private'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        posts.push({
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
        });
      });

      set(state => ({
        bookPosts: {
          ...state.bookPosts,
          [bookId]: posts,
        },
      }));

    } catch (error) {
      console.error('Error cargando posts del libro:', error);
    }
  },

  /**
   * Carga reseñas de un libro específico
   */
  loadBookReviews: async (bookId: string) => {
    if (!bookId) return;

    try {
      // Podríamos usar la colección de reviews o filtrar posts de tipo 'review'
      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection,
        where('bookId', '==', bookId),
        where('type', '==', 'review'),
        where('visibility', '!=', 'private'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const reviews = [];

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        reviews.push({
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
        });
      });

      set(state => ({
        bookReviews: {
          ...state.bookReviews,
          [bookId]: reviews,
        },
      }));

    } catch (error) {
      console.error('Error cargando reseñas del libro:', error);
    }
  },

  /**
   * Carga estadísticas de un libro
   */
  loadBookStats: async (bookId: string) => {
    if (!bookId) return;

    try {
      // Obtener libro de Firestore cache
      const booksCollection = collection(db, 'books');
      const q = query(booksCollection, where('id', '==', bookId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = fromFirestore(docSnap.data());

        set(state => ({
          bookStats: {
            ...state.bookStats,
            [bookId]: {
              averageRating: data.averageRating || 0,
              ratingsCount: data.ratingsCount || 0,
              reviewsCount: data.reviewsCount || 0,
              likesCount: data.likesCount || 0,
              savesCount: data.savesCount || 0,
              sharesCount: data.sharesCount || 0,
              shelvesCount: data.shelvesCount || {},
              trendingScore: data.trendingScore || 0,
              engagementRate: data.engagementRate || 0,
            },
          },
        }));
      }
    } catch (error) {
      console.error('Error cargando estadísticas del libro:', error);
    }
  },

  /**
   * Carga la biblioteca desde Firestore
   */
  loadLibraryFromFirestore: async (userId: string) => {
    if (!userId) return;

    set({ isLoading: true, searchError: null });

    try {
      const readingsCollection = collection(db, 'readings');
      const q = query(
        readingsCollection,
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const library = [];

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        const bookEntry = {
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
          addedAt: data.addedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          startedAt: data.startedAt?.toDate?.()?.toISOString() || null,
          finishedAt: data.finishedAt?.toDate?.()?.toISOString() || null,
        };
        library.push(bookEntry);
      });

      set({
        myLibrary: library,
        isLoading: false,
        searchError: null,
      });

    } catch (error) {
      console.error('Error cargando biblioteca desde Firestore:', error);
      set({
        myLibrary: [],
        isLoading: false,
        searchError: `Error al cargar biblioteca: ${error.message}`,
      });
    }
  },

  /**
   * Cambia el filtro de la biblioteca
   */
  setLibraryFilter: (filter: string) => {
    if (!['all', 'want-to-read', 'currently-reading', 'read', 'favorites'].includes(filter)) {
      console.error('Filtro inválido');
      return;
    }
    set({ libraryFilter: filter });
  },

  /**
   * Cambia el filtro de descubrimiento
   */
  setDiscoveryFilter: (filter: string) => {
    if (!['trending', 'recommended', 'new', 'popular'].includes(filter)) return;
    set({ discoveryFilter: filter });
  },

  /**
   * Obtiene la biblioteca filtrada
   */
  getFilteredLibrary: () => {
    const { myLibrary, libraryFilter } = get();
    if (libraryFilter === 'all') return myLibrary;
    if (libraryFilter === 'favorites') return myLibrary.filter(book => book.isFavorite);
    return myLibrary.filter(book => book.readingStatus === libraryFilter);
  },

  /**
   * Obtiene estadísticas de lectura
   */
  getReadingStats: () => {
    const { myLibrary } = get();

    const totalBooks = myLibrary.length;
    const currentlyReading = myLibrary.filter(book => book.readingStatus === 'currently-reading').length;
    const completed = myLibrary.filter(book => book.readingStatus === 'read').length;
    const favorites = myLibrary.filter(book => book.isFavorite).length;
    const totalPages = myLibrary.reduce((sum, book) => sum + (book.pageCount || 0), 0);
    const pagesRead = myLibrary.reduce((sum, book) => sum + Math.floor((book.pageCount || 0) * (book.progress || 0) / 100), 0);

    return {
      totalBooks,
      currentlyReading,
      completed,
      favorites,
      totalPages,
      pagesRead,
      completionRate: totalBooks > 0 ? Math.round((completed / totalBooks) * 100) : 0,
      readingProgress: totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0,
    };
  },

  /**
   * Limpia la biblioteca local
   */
  clearLibrary: () => set({
    myLibrary: [],
    selectedBook: null,
    searchResults: [],
    libraryFilter: 'all',
    trendingBooks: [],
    recommendedBooks: [],
    discoveredBooks: [],
    bookDetails: {},
    bookPosts: {},
    bookReviews: {},
    bookStats: {},
  }),

  /**
   * Helper para crear actividades
   */
  createActivity: async (activityData: any) => {
    try {
      // Esta función sería implementada con el store de actividades
      console.log('Creando actividad:', activityData);
    } catch (error) {
      console.error('Error creando actividad:', error);
    }
  },
}));

export default useInstagramBookStore;