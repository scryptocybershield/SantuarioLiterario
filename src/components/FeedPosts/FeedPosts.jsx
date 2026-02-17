import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Heading, HStack, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import BookCard from "../BookCard/BookCard";
import { getInstagramFeedPosts } from "../../mocks/instagramBooks";

const FeedPosts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // Cargar posts del mock data
  useEffect(() => {
    const loadPosts = () => {
      setIsLoading(true);
      // Simular carga de datos
      setTimeout(() => {
        const feedPosts = getInstagramFeedPosts();
        setPosts(feedPosts);
        setIsLoading(false);
      }, 1000);
    };

    loadPosts();
  }, []);

  // Filtrar posts según el filtro activo
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'following') return true; // En un caso real, filtrar por usuarios seguidos
    if (activeFilter === 'trending') return post.review.likesCount > 200;
    return true;
  });

  // Handlers para interacciones
  const handleLike = (postId, liked) => {
    console.log(`Post ${postId} ${liked ? 'liked' : 'unliked'}`);
    // En una implementación real, actualizaría el estado en el backend
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              interactions: {
                ...post.interactions,
                isLiked: liked
              },
              review: {
                ...post.review,
                likesCount: liked ? post.review.likesCount + 1 : Math.max(0, post.review.likesCount - 1)
              }
            }
          : post
      )
    );
  };

  const handleSave = (postId, saved) => {
    console.log(`Post ${postId} ${saved ? 'saved' : 'unsaved'}`);
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              interactions: {
                ...post.interactions,
                isSaved: saved
              }
            }
          : post
      )
    );
  };

  const handleComment = (postId) => {
    console.log(`Comment on post ${postId}`);
    // Aquí se podría abrir un modal de comentarios
  };

  const handleShare = (postId) => {
    console.log(`Share post ${postId}`);
    // Aquí se podría implementar compartir en redes sociales
  };

  const handleDoubleTapLike = (postId) => {
    console.log(`Double tap like on post ${postId}`);
    handleLike(postId, true);
  };

  // Skeletons de carga
  const renderSkeletons = () => {
    return [0, 1, 2].map((_, idx) => (
      <Box
        key={idx}
        maxW="600px"
        mx="auto"
        mb={8}
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
      >
        {/* Header skeleton */}
        <Flex px={4} py={3} alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap={3}>
            <SkeletonCircle size="10" />
            <VStack align="start" spacing={1}>
              <Skeleton height="12px" width="100px" />
              <Skeleton height="10px" width="60px" />
            </VStack>
          </Flex>
          <Skeleton height="20px" width="20px" />
        </Flex>

        {/* Image skeleton */}
        <Skeleton height="500px" width="100%" />

        {/* Actions skeleton */}
        <Flex px={4} py={3} justifyContent="space-between">
          <HStack spacing={4}>
            {[0, 1, 2].map(i => (
              <Skeleton key={i} height="24px" width="24px" />
            ))}
          </HStack>
          <Skeleton height="24px" width="24px" />
        </Flex>

        {/* Content skeleton */}
        <Box px={4} pb={4}>
          <Skeleton height="16px" width="80px" mb={3} />
          <Skeleton height="20px" width="200px" mb={2} />
          <Skeleton height="16px" width="150px" mb={2} />
          <Skeleton height="60px" width="100%" mb={2} />
          <Skeleton height="16px" width="120px" />
        </Box>
      </Box>
    ));
  };

  return (
    <Container maxW="container.lg" py={8} px={4}>
      {/* Header del feed */}
      <Box mb={8} textAlign="center">
        <Heading as="h1" size="xl" mb={2} color="santuario.charcoal">
          Santuario Literario
        </Heading>
        <Text fontSize="md" color="gray.600" mb={6}>
          Descubre reseñas, comparte lecturas y conecta con otros lectores
        </Text>

        {/* Filtros */}
        <HStack spacing={4} justifyContent="center" mb={8}>
          <Button
            size="sm"
            variant={activeFilter === 'all' ? 'solid' : 'outline'}
            colorScheme={activeFilter === 'all' ? 'blue' : 'gray'}
            onClick={() => setActiveFilter('all')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'following' ? 'solid' : 'outline'}
            colorScheme={activeFilter === 'following' ? 'blue' : 'gray'}
            onClick={() => setActiveFilter('following')}
          >
            Siguiendo
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'trending' ? 'solid' : 'outline'}
            colorScheme={activeFilter === 'trending' ? 'blue' : 'gray'}
            onClick={() => setActiveFilter('trending')}
          >
            Trending
          </Button>
        </HStack>
      </Box>

      {/* Feed de posts */}
      {isLoading ? (
        renderSkeletons()
      ) : filteredPosts.length > 0 ? (
        <VStack spacing={8} align="stretch">
          {filteredPosts.map((post) => (
            <BookCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onComment={handleComment}
              onShare={handleShare}
              onDoubleTapLike={handleDoubleTapLike}
            />
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" py={20}>
          <Box fontSize="6xl" color="gray.300" mb={4}>
            📚
          </Box>
          <Heading as="h2" size="lg" mb={3} color="gray.700">
            No hay publicaciones aún
          </Heading>
          <Text color="gray.500" maxW="400px" mx="auto">
            Sé el primero en compartir una reseña o sigue a otros lectores para ver sus publicaciones.
          </Text>
          <Button colorScheme="blue" mt={6} size="lg">
            Compartir mi primera reseña
          </Button>
        </Box>
      )}

      {/* Estadísticas del feed */}
      {!isLoading && filteredPosts.length > 0 && (
        <Box mt={12} pt={8} borderTopWidth="1px" borderColor="gray.200">
          <Flex justifyContent="space-between" alignItems="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">
                Mostrando {filteredPosts.length} de {posts.length} publicaciones
              </Text>
              <Text fontSize="xs" color="gray.400">
                Actualizado hace unos momentos
              </Text>
            </VStack>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Volver arriba
            </Button>
          </Flex>
        </Box>
      )}
    </Container>
  );
};

export default FeedPosts;