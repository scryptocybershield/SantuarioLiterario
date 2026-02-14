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
} from 'firebase/firestore';

const useBookStore = create((set, get) => ({
  // Estado
  searchResults: [],
  myLibrary: [], // Libros guardados por el usuario (sincronizados con Firestore)
  selectedBook: null,
  isLoading: false,
  searchError: null,
  libraryFilter: 'all', // 'all', 'want-to-read', 'currently-reading', 'read', 'on-hold'
  publicReviews: [], // Reseñas públicas de libros (para funcionalidad social)

  // Acciones

  /**
   * Busca libros en Google Books API
   * @param {string} query - Término de búsqueda
   */
  searchBooks: async (query) => {
    if (!query || query.trim().length === 0) {
      set({ searchResults: [], searchError: null });
      return;
    }

    set({ isLoading: true, searchError: null });

    try {
      const results = await searchBooks(query);
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
   * Selecciona un libro para ver detalles
   * @param {string} bookId - ID del libro a seleccionar
   */
  selectBook: async (bookId) => {
    if (!bookId) {
      set({ selectedBook: null });
      return;
    }

    // Verificar si el libro ya está en los resultados de búsqueda
    const { searchResults, myLibrary } = get();
    const foundBook = searchResults.find(book => book.id === bookId) ||
      myLibrary.find(book => book.bookId === bookId);

    if (foundBook) {
      set({ selectedBook: foundBook });
      return;
    }

    // Si no se encuentra, obtener detalles de la API
    set({ isLoading: true });

    try {
      const bookDetails = await getBookDetails(bookId);
      set({
        selectedBook: bookDetails,
        isLoading: false,
      });
    } catch (error) {
      console.error(`Error obteniendo detalles del libro ${bookId}:`, error);
      set({
        selectedBook: null,
        isLoading: false,
        searchError: error.message,
      });
    }
  },

  addToLibrary: async (bookData, userId, status = 'want-to-read') => {
    if (!bookData || !bookData.id || !userId) {
      console.error('Datos de libro o usuario inválidos');
      return;
    }

    const { myLibrary } = get();

    // Verificar si el libro ya está en la biblioteca del usuario
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
    };

    set({ isLoading: true });

    try {
      // Guardar en Firestore
      const readingsCollection = collection(db, 'readings');
      const docRef = await addDoc(readingsCollection, readingRecord);

      // Actualizar estado local con el ID de Firestore
      const localRecord = {
        ...readingRecord,
        id: docRef.id,
        firestoreId: docRef.id,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: readingRecord.startedAt ? new Date().toISOString() : null,
        finishedAt: readingRecord.finishedAt ? new Date().toISOString() : null,
      };

      console.log("Libro añadido localmente con IDs:", { id: localRecord.id, firestoreId: localRecord.firestoreId });

      set(state => ({
        myLibrary: [localRecord, ...state.myLibrary],
        isLoading: false,
      }));

      return docRef.id;
    } catch (error) {
      console.error('Error agregando libro a Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Actualiza el progreso de lectura de un libro en Firestore
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {number} progress - Progreso (0-100)
   * @param {number} currentPage - Página actual
   * @param {string} userId - ID del usuario (para seguridad)
   */
  updateReadingProgress: async (firestoreId, progress, currentPage, userId) => {
    if (!firestoreId || progress < 0 || progress > 100 || !userId) {
      console.error('Integrity Error: Invalid progress data or missing credentials.');
      return;
    }

    // Bastionado: Validación de Integridad de Datos (Métricas)
    if (userId !== (auth.currentUser?.uid || userId)) {
      throw new Error("Violación de Integridad: Origen de petición no validado.");
    }

    const updates = {
      progress,
      currentPage: currentPage || 0,
      readingStatus: progress === 100 ? 'read' : progress > 0 ? 'currently-reading' : 'want-to-read',
      updatedAt: serverTimestamp(),
    };

    // Actualizar fechas si corresponde
    if (progress > 0) {
      updates.startedAt = serverTimestamp();
    }
    if (progress === 100) {
      updates.finishedAt = serverTimestamp();
    }

    set({ isLoading: true });

    try {
      // Actualizar en Firestore
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, updates);

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              ...updates,
              updatedAt: new Date().toISOString(),
              startedAt: progress > 0 && !book.startedAt ? new Date().toISOString() : book.startedAt,
              finishedAt: progress === 100 && !book.finishedAt ? new Date().toISOString() : book.finishedAt,
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      console.log('Progreso actualizado en Firestore:', firestoreId);
    } catch (error) {
      console.error('Error actualizando progreso en Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Cambia el estado de lectura de un libro en Firestore
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {string} status - Nuevo estado ('want-to-read', 'currently-reading', 'read', 'on-hold')
   * @param {string} userId - ID del usuario (para seguridad)
   */
  updateReadingStatus: async (firestoreId, status, userId) => {
    if (!firestoreId || !['want-to-read', 'currently-reading', 'read', 'on-hold'].includes(status) || !userId) {
      console.error('Integrity Error: Invalid status or missing credentials.');
      return;
    }

    // Bastionado: Validación de Integridad de Datos
    if (userId !== (auth.currentUser?.uid || userId)) {
      throw new Error("Violación de Integridad: El usuario no coincide con el origen autenticado.");
    }

    const updates = {
      readingStatus: status,
      updatedAt: serverTimestamp(),
    };

    // Actualizar fechas y progreso si corresponde
    if (status === 'currently-reading') {
      updates.startedAt = serverTimestamp();
      updates.progress = Math.max(get().myLibrary.find(b => b.id === firestoreId)?.progress || 0, 1);
    } else if (status === 'read') {
      updates.progress = 100;
      updates.finishedAt = serverTimestamp();
    } else if (status === 'on-hold') {
      // Mantener progreso actual
    }

    set({ isLoading: true });

    try {
      // Actualizar en Firestore
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, updates);

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              ...updates,
              updatedAt: new Date().toISOString(),
              startedAt: status === 'currently-reading' && !book.startedAt ? new Date().toISOString() : book.startedAt,
              finishedAt: status === 'read' && !book.finishedAt ? new Date().toISOString() : book.finishedAt,
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      console.log('Estado de lectura actualizado en Firestore:', firestoreId);
    } catch (error) {
      console.error('Error actualizando estado en Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Agrega una nota privada a un libro en Firestore
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {string} content - Contenido de la nota
   * @param {string} userId - ID del usuario (para seguridad)
   * @param {number} pageReference - Página de referencia (opcional)
   * @param {boolean} isSpoiler - Si la nota contiene spoilers
   */
  addPrivateNote: async (firestoreId, content, userId, pageReference = null, isSpoiler = false) => {
    if (!firestoreId || !content || content.trim().length === 0 || !userId) {
      console.error('Contenido de nota inválido');
      return;
    }

    const note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      pageReference,
      isSpoiler,
      createdAt: new Date().toISOString(),
    };

    set({ isLoading: true });

    try {
      // Obtener libro actual para actualizar el array de notas
      const { myLibrary } = get();
      const book = myLibrary.find(b => b.id === firestoreId);
      if (!book) throw new Error('Libro no encontrado');

      const updatedNotes = [note, ...(book.privateNotes || [])];

      // Actualizar en Firestore
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, {
        privateNotes: updatedNotes,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              privateNotes: updatedNotes,
              updatedAt: new Date().toISOString(),
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      console.log('Nota añadida en Firestore:', firestoreId);
    } catch (error) {
      console.error('Error añadiendo nota en Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Elimina un libro de la biblioteca en Firestore
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {string} userId - ID del usuario (para seguridad)
   */
  removeFromLibrary: async (firestoreId, userId) => {
    console.log("Store: removeFromLibrary called with ID:", firestoreId, "userId:", userId);
    if (!firestoreId || !userId) {
      console.error('Integrity Error: Missing identifiers for deletion.');
      return;
    }

    // Bastionado: Validación de Integridad de Datos
    if (userId !== (auth.currentUser?.uid || userId)) {
      throw new Error("Petición de eliminación rechazada: Origen no autorizado.");
    }

    set({ isLoading: true });

    try {
      // Eliminar de Firestore
      const readingRef = doc(db, 'readings', firestoreId);
      console.log("Store: Intentando deleteDoc en Firestore para path: readings/" + firestoreId);
      await deleteDoc(readingRef);

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.filter(book => book.id !== firestoreId && book.firestoreId !== firestoreId),
        isLoading: false,
      }));

      console.log('Store: Libro eliminado exitosamente de Firestore e interfaz');
    } catch (error) {
      console.error('Store: Error al eliminar libro de Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Filtra la biblioteca por estado de lectura
   * @param {string} filter - Tipo de filtro ('all', 'want-to-read', 'currently-reading', 'read', 'on-hold')
   */
  setLibraryFilter: (filter) => {
    if (!['all', 'want-to-read', 'currently-reading', 'read', 'on-hold'].includes(filter)) {
      console.error('Filtro inválido');
      return;
    }
    set({ libraryFilter: filter });
  },

  /**
   * Obtiene la biblioteca filtrada según el filtro actual
   */
  getFilteredLibrary: () => {
    const { myLibrary, libraryFilter } = get();
    if (libraryFilter === 'all') return myLibrary;
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
    const totalPages = myLibrary.reduce((sum, book) => sum + (book.pageCount || 0), 0);
    const pagesRead = myLibrary.reduce((sum, book) => sum + Math.floor((book.pageCount || 0) * (book.progress || 0) / 100), 0);

    return {
      totalBooks,
      currentlyReading,
      completed,
      totalPages,
      pagesRead,
      completionRate: totalBooks > 0 ? Math.round((completed / totalBooks) * 100) : 0,
      readingProgress: totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0,
    };
  },

  /**
   * Carga la biblioteca desde Firestore
   * @param {string} userId - ID del usuario autenticado
   */
  loadLibraryFromFirestore: async (userId) => {
    if (!userId) return;

    set({ isLoading: true, searchError: null });

    try {
      // Consultar Firestore por los libros del usuario
      const readingsCollection = collection(db, 'readings');
      const q = query(
        readingsCollection,
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const library = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const bookEntry = {
          ...data,
          id: docSnap.id, // ID de Firestore (siempre al final para asegurar precedencia)
          firestoreId: docSnap.id,
          // Convertir timestamps de Firestore a strings ISO
          addedAt: data.addedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          startedAt: data.startedAt?.toDate?.()?.toISOString() || null,
          finishedAt: data.finishedAt?.toDate?.()?.toISOString() || null,
        };
        console.log(`Cargado libro "${bookEntry.title}" con Firestore ID: ${bookEntry.id}`);
        library.push(bookEntry);
      });

      set({
        myLibrary: library,
        isLoading: false,
        searchError: null,
      });

      console.log(`Biblioteca cargada desde Firestore: ${library.length} libros`);
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
   * Actualiza un campo específico de un libro en Firestore
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {Object} updates - Campos a actualizar
   * @param {string} userId - ID del usuario (para seguridad)
   */
  updateBookField: async (firestoreId, updates, userId) => {
    if (!firestoreId || !updates || !userId) {
      console.error('Parámetros inválidos');
      return;
    }

    set({ isLoading: true });

    try {
      // Actualizar en Firestore
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      console.log('Campo actualizado en Firestore:', firestoreId);
    } catch (error) {
      console.error('Error actualizando campo en Firestore:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Califica un libro (1-5 estrellas)
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {number} rating - Calificación (1-5)
   * @param {string} userId - ID del usuario
   */
  rateBook: async (firestoreId, rating, userId) => {
    if (!firestoreId || rating < 1 || rating > 5 || !userId) {
      console.error('Parámetros inválidos para calificación');
      return;
    }

    set({ isLoading: true });

    try {
      // Actualizar en Firestore
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, {
        publicRating: rating,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              publicRating: rating,
              updatedAt: new Date().toISOString(),
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      console.log('Libro calificado:', firestoreId, 'Rating:', rating);
    } catch (error) {
      console.error('Error calificando libro:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Agrega una reseña pública a un libro
   * @param {string} firestoreId - ID del documento en Firestore
   * @param {string} review - Contenido de la reseña
   * @param {string} userId - ID del usuario
   * @param {string} username - Nombre de usuario
   * @param {string} profilePicURL - URL de la foto de perfil
   */
  addPublicReview: async (firestoreId, review, userId, username, profilePicURL) => {
    if (!firestoreId || !review || !userId || !username) {
      console.error('Parámetros inválidos para reseña');
      return;
    }

    const reviewData = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: review.trim(),
      userId,
      username,
      profilePicURL: profilePicURL || '',
      createdAt: new Date().toISOString(),
      likes: [], // Array de UIDs de usuarios que dieron like a la reseña
      isEdited: false,
      editedAt: null,
    };

    set({ isLoading: true });

    try {
      // Actualizar en Firestore - agregar reseña al array de reseñas públicas
      const readingRef = doc(db, 'readings', firestoreId);
      await updateDoc(readingRef, {
        publicReview: review,
        updatedAt: serverTimestamp(),
        // También podríamos tener un array de reseñas si queremos múltiples reseñas por libro
      });

      // Actualizar estado local
      set(state => ({
        myLibrary: state.myLibrary.map(book => {
          if (book.id === firestoreId) {
            return {
              ...book,
              publicReview: review,
              updatedAt: new Date().toISOString(),
            };
          }
          return book;
        }),
        isLoading: false,
      }));

      console.log('Reseña pública agregada:', firestoreId);
    } catch (error) {
      console.error('Error agregando reseña pública:', error);
      set({ isLoading: false, searchError: error.message });
      throw error;
    }
  },

  /**
   * Da like a una reseña (para funcionalidad social futura)
   * @param {string} bookId - ID del libro
   * @param {string} reviewId - ID de la reseña
   * @param {string} userId - ID del usuario que da like
   */
  likeReview: async (bookId, reviewId, userId) => {
    if (!bookId || !reviewId || !userId) {
      console.error('Parámetros inválidos para like de reseña');
      return;
    }

    // Esta función sería para un sistema de reseñas más complejo
    // Por ahora es un placeholder para funcionalidad futura
    console.log('Like a reseña:', { bookId, reviewId, userId });
  },

  /**
   * Obtiene estadísticas de calificaciones
   */
  getRatingStats: () => {
    const { myLibrary } = get();

    const ratedBooks = myLibrary.filter(book => book.publicRating > 0);
    const totalRated = ratedBooks.length;

    if (totalRated === 0) {
      return {
        averageRating: 0,
        totalRated: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const sumRatings = ratedBooks.reduce((sum, book) => sum + book.publicRating, 0);
    const averageRating = sumRatings / totalRated;

    // Distribución de calificaciones
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedBooks.forEach(book => {
      ratingDistribution[book.publicRating]++;
    });

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRated,
      ratingDistribution
    };
  },

  /**
   * Limpia la biblioteca local (útil para logout)
   */
  clearLibrary: () => set({ myLibrary: [], selectedBook: null, searchResults: [], libraryFilter: 'all', publicReviews: [] }),
}));

export default useBookStore;