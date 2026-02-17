// Store de Zustand para posts con funcionalidades Instagram-like
// Reemplaza el store de posts original con nuevas capacidades sociales

import { create } from "zustand";
import { db } from '../firebase/firebase';
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
  limit,
  startAfter,
  getDoc,
} from 'firebase/firestore';
import {
  createPost,
  createComment,
  fromFirestore,
  toFirestore,
  calculateEngagementScore,
  extractHashtags,
  extractMentions,
  type Post,
  type Comment
} from '../models/instagram-models';

const useInstagramPostStore = create((set, get) => ({
  // Estado
  posts: [],                    // Posts cargados
  feedPosts: [],                // Posts del feed (seguidos + trending)
  userPosts: [],                // Posts del usuario actual
  bookPosts: {},                // Posts por libro {bookId: Post[]}
  selectedPost: null,           // Post seleccionado para ver detalles
  isLoading: false,
  error: null,
  hasMorePosts: true,           // Para paginación infinita
  lastPostDoc: null,            // Último documento para paginación

  // Filtros y preferencias
  feedFilter: 'following',      // 'following', 'trending', 'discovery'
  postTypes: ['review', 'quote', 'progress', 'recommendation'], // Tipos a mostrar
  hideSpoilers: false,          // Ocultar posts con spoilers

  // ==================== ACCIONES PRINCIPALES ====================

  /**
   * Crea un nuevo post (review, quote, progress, etc.)
   */
  createPost: async (postData: Partial<Post>) => {
    set({ isLoading: true, error: null });

    try {
      // Crear post con datos por defecto
      const newPost = createPost(postData);

      // Extraer hashtags y menciones
      newPost._hashtags = extractHashtags(newPost.content);
      newPost._mentions = extractMentions(newPost.content);

      // Calcular engagement score inicial
      newPost.engagementScore = calculateEngagementScore(newPost);

      // Preparar para Firestore
      const firestorePost = toFirestore(newPost);

      // Guardar en Firestore
      const postsCollection = collection(db, 'posts');
      const docRef = await addDoc(postsCollection, firestorePost);

      // Actualizar con ID real
      const savedPost = {
        ...newPost,
        id: docRef.id,
        firestoreId: docRef.id,
      };

      // Actualizar estado local
      set(state => ({
        posts: [savedPost, ...state.posts],
        userPosts: [savedPost, ...state.userPosts],
        isLoading: false,
      }));

      // Crear actividad en el feed
      await get().createActivity({
        type: 'post',
        action: 'created',
        targetType: 'post',
        targetId: docRef.id,
        targetData: {
          postContent: newPost.content.substring(0, 100) + '...',
          postImages: newPost.images || [],
        },
        content: `publicó ${newPost.type === 'review' ? 'una reseña' : 'un post'}`,
      });

      return savedPost;
    } catch (error) {
      console.error('Error creando post:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Da like a un post
   */
  likePost: async (postId: string, userId: string) => {
    if (!postId || !userId) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);

      // Actualizar en Firestore
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likesCount: serverTimestamp(), // Se actualizará con Cloud Function
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const newLikes = [...(post.likes || []), userId];
            return {
              ...post,
              likes: newLikes,
              likesCount: newLikes.length,
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        }),
        isLoading: false,
      }));

      // Crear actividad de like
      await get().createActivity({
        type: 'like',
        action: 'liked',
        targetType: 'post',
        targetId: postId,
        userId,
      });

    } catch (error) {
      console.error('Error dando like al post:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Quita like de un post
   */
  unlikePost: async (postId: string, userId: string) => {
    if (!postId || !userId) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);

      // Actualizar en Firestore
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likesCount: serverTimestamp(), // Se actualizará con Cloud Function
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const newLikes = (post.likes || []).filter(id => id !== userId);
            return {
              ...post,
              likes: newLikes,
              likesCount: newLikes.length,
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        }),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error quitando like del post:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Guarda un post (bookmark)
   */
  savePost: async (postId: string, userId: string) => {
    if (!postId || !userId) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);

      // Actualizar en Firestore
      await updateDoc(postRef, {
        saves: arrayUnion(userId),
        savesCount: serverTimestamp(), // Se actualizará con Cloud Function
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const newSaves = [...(post.saves || []), userId];
            return {
              ...post,
              saves: newSaves,
              savesCount: newSaves.length,
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        }),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error guardando post:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Quita guardado de un post
   */
  unsavePost: async (postId: string, userId: string) => {
    if (!postId || !userId) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);

      // Actualizar en Firestore
      await updateDoc(postRef, {
        saves: arrayRemove(userId),
        savesCount: serverTimestamp(), // Se actualizará con Cloud Function
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const newSaves = (post.saves || []).filter(id => id !== userId);
            return {
              ...post,
              saves: newSaves,
              savesCount: newSaves.length,
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        }),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error quitando guardado del post:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Comparte un post
   */
  sharePost: async (postId: string, userId: string) => {
    if (!postId || !userId) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);

      // Actualizar en Firestore
      await updateDoc(postRef, {
        shares: arrayUnion(userId),
        sharesCount: serverTimestamp(), // Se actualizará con Cloud Function
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const newShares = [...(post.shares || []), userId];
            return {
              ...post,
              shares: newShares,
              sharesCount: newShares.length,
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        }),
        isLoading: false,
      }));

      // Crear actividad de share
      await get().createActivity({
        type: 'share',
        action: 'shared',
        targetType: 'post',
        targetId: postId,
        userId,
      });

    } catch (error) {
      console.error('Error compartiendo post:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Agrega un comentario a un post
   */
  addComment: async (postId: string, commentData: Partial<Comment>) => {
    if (!postId || !commentData.content) return;

    set({ isLoading: true });

    try {
      // Crear comentario
      const newComment = createComment(commentData);

      // Guardar en Firestore (subcolección)
      const commentsCollection = collection(db, 'posts', postId, 'comments');
      const commentRef = await addDoc(commentsCollection, toFirestore(newComment));

      // Actualizar contador en el post
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: serverTimestamp(), // Se actualizará con Cloud Function
        updatedAt: serverTimestamp(),
      });

      const savedComment = {
        ...newComment,
        id: commentRef.id,
        firestoreId: commentRef.id,
      };

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentsCount: (post.commentsCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        }),
        isLoading: false,
      }));

      // Crear actividad de comentario
      await get().createActivity({
        type: 'comment',
        action: 'commented',
        targetType: 'post',
        targetId: postId,
        userId: newComment.userId,
        content: `comentó: "${newComment.content.substring(0, 50)}..."`,
      });

      return savedComment;
    } catch (error) {
      console.error('Error agregando comentario:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Carga posts del feed (seguidos, trending, discovery)
   */
  loadFeedPosts: async (userId: string, loadMore = false) => {
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const { feedFilter, lastPostDoc, postTypes, hideSpoilers } = get();
      const postsCollection = collection(db, 'posts');

      let q;
      const filters = [];

      // Filtro por visibilidad
      filters.push(where('visibility', 'in', ['public', 'followers']));

      // Filtro por tipo de post
      if (postTypes.length > 0) {
        filters.push(where('type', 'in', postTypes));
      }

      // Filtro por spoilers
      if (hideSpoilers) {
        filters.push(where('spoilerWarning', '==', false));
      }

      // Ordenamiento según filtro
      let orderField = 'createdAt';
      let orderDirection = 'desc';

      switch (feedFilter) {
        case 'trending':
          orderField = 'engagementScore';
          orderDirection = 'desc';
          filters.push(where('engagementScore', '>=', 50)); // Solo posts con engagement
          break;
        case 'discovery':
          orderField = 'discoveryScore'; // Campo futuro para descubrimiento
          orderDirection = 'desc';
          break;
        case 'following':
        default:
          // Para "following", necesitamos obtener posts de usuarios seguidos
          // Esto se manejaría con una Cloud Function o query más compleja
          orderField = 'createdAt';
          orderDirection = 'desc';
          break;
      }

      filters.push(orderBy(orderField, orderDirection));
      filters.push(limit(20));

      // Paginación
      if (loadMore && lastPostDoc) {
        filters.push(startAfter(lastPostDoc));
      }

      q = query(postsCollection, ...filters);
      const querySnapshot = await getDocs(q);

      const posts = [];
      let newLastDoc = null;

      querySnapshot.forEach((docSnap) => {
        const data = fromFirestore(docSnap.data());
        posts.push({
          ...data,
          id: docSnap.id,
          firestoreId: docSnap.id,
        });
        newLastDoc = docSnap;
      });

      // Actualizar estado
      set(state => ({
        feedPosts: loadMore ? [...state.feedPosts, ...posts] : posts,
        isLoading: false,
        lastPostDoc: newLastDoc,
        hasMorePosts: posts.length === 20, // Si hay 20 posts, probablemente hay más
      }));

    } catch (error) {
      console.error('Error cargando feed posts:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Carga posts de un usuario específico
   */
  loadUserPosts: async (userId: string) => {
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection,
        where('userId', '==', userId),
        where('visibility', '!=', 'private'),
        orderBy('createdAt', 'desc'),
        limit(50)
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

      set({
        userPosts: posts,
        isLoading: false,
      });

    } catch (error) {
      console.error('Error cargando posts de usuario:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Carga posts de un libro específico
   */
  loadBookPosts: async (bookId: string) => {
    if (!bookId) return;

    set({ isLoading: true, error: null });

    try {
      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection,
        where('bookId', '==', bookId),
        where('visibility', '!=', 'private'),
        orderBy('createdAt', 'desc'),
        limit(50)
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
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error cargando posts de libro:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Obtiene un post específico por ID
   */
  getPostById: async (postId: string) => {
    if (!postId) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        throw new Error('Post no encontrado');
      }

      const data = fromFirestore(postSnap.data());
      const post = {
        ...data,
        id: postSnap.id,
        firestoreId: postSnap.id,
      };

      set({
        selectedPost: post,
        isLoading: false,
      });

      return post;
    } catch (error) {
      console.error('Error obteniendo post:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Actualiza un post existente
   */
  updatePost: async (postId: string, updates: Partial<Post>) => {
    if (!postId || !updates) return;

    set({ isLoading: true });

    try {
      const postRef = doc(db, 'posts', postId);

      // Extraer nuevos hashtags y menciones si hay nuevo contenido
      if (updates.content) {
        updates._hashtags = extractHashtags(updates.content);
        updates._mentions = extractMentions(updates.content);
      }

      // Recalcular engagement score si hay cambios relevantes
      if (updates.content || updates.rating || updates.images) {
        const currentPost = get().posts.find(p => p.id === postId);
        if (currentPost) {
          const updatedPost = { ...currentPost, ...updates };
          updates.engagementScore = calculateEngagementScore(updatedPost);
        }
      }

      updates.isEdited = true;
      updates.editedAt = new Date().toISOString();
      updates.updatedAt = new Date().toISOString();

      await updateDoc(postRef, toFirestore(updates));

      // Actualizar estado local
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              ...updates,
            };
          }
          return post;
        }),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error actualizando post:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Elimina un post
   */
  deletePost: async (postId: string, userId: string) => {
    if (!postId || !userId) return;

    set({ isLoading: true });

    try {
      // Verificar que el usuario es el dueño del post
      const post = get().posts.find(p => p.id === postId);
      if (!post || post.userId !== userId) {
        throw new Error('No tienes permiso para eliminar este post');
      }

      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);

      // Actualizar estado local
      set(state => ({
        posts: state.posts.filter(p => p.id !== postId),
        userPosts: state.userPosts.filter(p => p.id !== postId),
        feedPosts: state.feedPosts.filter(p => p.id !== postId),
        selectedPost: state.selectedPost?.id === postId ? null : state.selectedPost,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error eliminando post:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Cambia el filtro del feed
   */
  setFeedFilter: (filter: string) => {
    if (!['following', 'trending', 'discovery'].includes(filter)) return;
    set({
      feedFilter: filter,
      feedPosts: [],
      lastPostDoc: null,
      hasMorePosts: true,
    });
  },

  /**
   * Cambia los tipos de post a mostrar
   */
  setPostTypes: (types: string[]) => {
    set({
      postTypes: types,
      feedPosts: [],
      lastPostDoc: null,
      hasMorePosts: true,
    });
  },

  /**
   * Cambia la preferencia de spoilers
   */
  setHideSpoilers: (hide: boolean) => {
    set({
      hideSpoilers: hide,
      feedPosts: [],
      lastPostDoc: null,
      hasMorePosts: true,
    });
  },

  /**
   * Limpia el estado del store
   */
  clearStore: () => set({
    posts: [],
    feedPosts: [],
    userPosts: [],
    bookPosts: {},
    selectedPost: null,
    isLoading: false,
    error: null,
    hasMorePosts: true,
    lastPostDoc: null,
  }),

  /**
   * Helper para crear actividades (usado internamente)
   */
  createActivity: async (activityData: any) => {
    try {
      // Esta función sería implementada con el store de actividades
      // Por ahora es un placeholder
      console.log('Creando actividad:', activityData);
    } catch (error) {
      console.error('Error creando actividad:', error);
    }
  },
}));

export default useInstagramPostStore;