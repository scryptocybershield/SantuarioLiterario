import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
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
  getDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import useAuthStore from "../store/authStore";

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  // Obtener posts recientes (para feed)
  const getRecentPosts = async (maxPosts = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const postsCollection = collection(db, "posts");
      const q = query(
        postsCollection,
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        limit(maxPosts)
      );

      const querySnapshot = await getDocs(q);
      const postsList = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        postsList.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      setPosts(postsList);
      return postsList;
    } catch (err) {
      console.error("Error obteniendo posts:", err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener posts de un usuario específico
  const getUserPosts = async (userId = null) => {
    const targetUserId = userId || user?.uid;
    if (!targetUserId) return [];

    setIsLoading(true);
    setError(null);

    try {
      const postsCollection = collection(db, "posts");
      const q = query(
        postsCollection,
        where("userId", "==", targetUserId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const postsList = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        postsList.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return postsList;
    } catch (err) {
      console.error("Error obteniendo posts del usuario:", err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener posts de un libro específico
  const getBookPosts = async (bookId) => {
    if (!bookId) return [];

    setIsLoading(true);
    setError(null);

    try {
      const postsCollection = collection(db, "posts");
      const q = query(
        postsCollection,
        where("bookId", "==", bookId),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const postsList = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        postsList.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return postsList;
    } catch (err) {
      console.error("Error obteniendo posts del libro:", err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Crear un nuevo post (cita compartida)
  const createPost = async (postData) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setIsLoading(true);
    setError(null);

    try {
      const postsCollection = collection(db, "posts");
      const newPost = {
        ...postData,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Usuario",
        userPhoto: user.photoURL || null,
        isPublic: true,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(postsCollection, newPost);

      const createdPost = {
        id: docRef.id,
        ...newPost,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Actualizar estado local
      setPosts((prev) => [createdPost, ...prev]);

      return createdPost;
    } catch (err) {
      console.error("Error creando post:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear una cita compartida (alias para createPost con tipo específico)
  const shareQuoteAsPost = async (quoteData) => {
    const postData = {
      ...quoteData,
      type: "quote_post",
      contentType: "quote",
    };
    return await createPost(postData);
  };

  // Dar like a un post
  const likePost = async (postId) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Primero verificar si el usuario ya dio like
      const likesCollection = collection(db, "post_likes");
      const likeQuery = query(
        likesCollection,
        where("postId", "==", postId),
        where("userId", "==", user.uid)
      );
      const likeSnapshot = await getDocs(likeQuery);

      if (!likeSnapshot.empty) {
        // Ya dio like, quitar like
        likeSnapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, "post_likes", docSnap.id));
        });

        // Actualizar contador de likes en el post
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          likes: (posts.find(p => p.id === postId)?.likes || 1) - 1,
          updatedAt: serverTimestamp(),
        });

        // Actualizar estado local
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, likes: Math.max(0, post.likes - 1) }
              : post
          )
        );

        return { liked: false };
      } else {
        // Dar like
        await addDoc(likesCollection, {
          postId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });

        // Actualizar contador de likes en el post
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          likes: (posts.find(p => p.id === postId)?.likes || 0) + 1,
          updatedAt: serverTimestamp(),
        });

        // Actualizar estado local
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes + 1 }
              : post
          )
        );

        return { liked: true };
      }
    } catch (err) {
      console.error("Error dando like al post:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Comentar un post (solo followers pueden comentar)
  const commentOnPost = async (postId, commentText) => {
    if (!user || !commentText.trim()) {
      throw new Error("Usuario no autenticado o comentario vacío");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Primero obtener el post para saber quién es el autor
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        throw new Error("El post no existe");
      }

      const postData = postSnap.data();
      const postAuthorId = postData.userId;

      // Verificar si el usuario actual es follower del autor del post
      if (postAuthorId !== user.uid) {
        const authorRef = doc(db, "users", postAuthorId);
        const authorSnap = await getDoc(authorRef);

        if (authorSnap.exists()) {
          const authorData = authorSnap.data();
          const authorFollowers = authorData.followers || [];

          if (!authorFollowers.includes(user.uid)) {
            throw new Error("Solo los followers pueden comentar en este post");
          }
        }
      }

      const commentsCollection = collection(db, "post_comments");
      const newComment = {
        postId,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Usuario",
        userPhoto: user.photoURL || null,
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(commentsCollection, newComment);

      // Actualizar contador de comentarios en el post
      await updateDoc(postRef, {
        comments: (postData.comments || 0) + 1,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        )
      );

      return { ...newComment, id: "temp" };
    } catch (err) {
      console.error("Error comentando en post:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un post (solo el autor o admin)
  const deletePost = async (postId) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setIsLoading(true);
    setError(null);

    try {
      const postRef = doc(db, "posts", postId);
      await deleteDoc(postRef);

      // Actualizar estado local
      setPosts((prev) => prev.filter((post) => post.id !== postId));

      return true;
    } catch (err) {
      console.error("Error eliminando post:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar un post existente
  const updatePost = async (postId, updates) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setIsLoading(true);
    setError(null);

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, ...updates, updatedAt: new Date() }
            : post
        )
      );

      return true;
    } catch (err) {
      console.error("Error actualizando post:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener estadísticas de posts
  const getPostStats = () => {
    const totalPosts = posts.length;
    const quotePosts = posts.filter((post) => post.type === "quote_post");
    const mostLikedPost = posts.length > 0
      ? posts.reduce((max, post) => post.likes > max.likes ? post : max, posts[0])
      : null;

    return {
      totalPosts,
      quotePosts: quotePosts.length,
      mostLikedPost,
      averageLikes: totalPosts > 0
        ? posts.reduce((sum, post) => sum + post.likes, 0) / totalPosts
        : 0,
    };
  };

  return {
    posts,
    isLoading,
    error,
    getRecentPosts,
    getUserPosts,
    getBookPosts,
    createPost,
    shareQuoteAsPost,
    likePost,
    commentOnPost,
    updatePost,
    deletePost,
    getPostStats,
  };
};

export default usePosts;