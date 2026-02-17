import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Avatar,
  IconButton,
  HStack,
  VStack,
  Badge,
  Tooltip,
  useToast,
  Skeleton,
  SkeletonCircle
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsHeart,
  BsHeartFill,
  BsChat,
  BsSend,
  BsBookmark,
  BsBookmarkFill,
  BsThreeDots,
  BsStarFill,
  BsStar
} from 'react-icons/bs';
import { FiMoreHorizontal } from 'react-icons/fi';

const BookCard = ({
  post,
  onLike,
  onSave,
  onComment,
  onShare,
  onDoubleTapLike
}) => {
  const [isLiked, setIsLiked] = useState(post.interactions.isLiked);
  const [isSaved, setIsSaved] = useState(post.interactions.isSaved);
  const [likesCount, setLikesCount] = useState(post.review.likesCount);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const imageRef = useRef(null);
  const toast = useToast();

  // Configurar doble tap para like
  useEffect(() => {
    const handleDoubleTap = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0) {
        // Doble tap detectado
        handleDoubleTapLike();
        setLastTap(0);
      } else {
        setLastTap(currentTime);
      }
    };

    const imageElement = imageRef.current;
    if (imageElement) {
      imageElement.addEventListener('click', handleDoubleTap);
      imageElement.addEventListener('touchend', handleDoubleTap);
    }

    return () => {
      if (imageElement) {
        imageElement.removeEventListener('click', handleDoubleTap);
        imageElement.removeEventListener('touchend', handleDoubleTap);
      }
    };
  }, [lastTap]);

  const handleDoubleTapLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      setShowHeartAnimation(true);

      if (onDoubleTapLike) {
        onDoubleTapLike(post.id);
      }

      if (onLike) {
        onLike(post.id, true);
      }

      // Mostrar toast de feedback
      toast({
        title: '¡Te gusta!',
        description: `Te gusta la reseña de ${post.user.username}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Ocultar animación después de 1 segundo
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    if (onLike) {
      onLike(post.id, newLikedState);
    }
  };

  const handleSave = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    if (onSave) {
      onSave(post.id, newSavedState);
    }

    toast({
      title: newSavedState ? 'Guardado' : 'Eliminado de guardados',
      description: newSavedState
        ? 'La reseña se ha guardado en tu biblioteca'
        : 'La reseña se ha eliminado de guardados',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  // Renderizar estrellas de rating
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Box key={i} as="span" color={i <= rating ? "yellow.400" : "gray.300"}>
          {i <= rating ? <BsStarFill size="14" /> : <BsStar size="14" />}
        </Box>
      );
    }
    return <HStack spacing={1}>{stars}</HStack>;
  };

  // Obtener color según estado de lectura
  const getReadingStatusColor = (status) => {
    switch (status) {
      case 'read': return 'green.500';
      case 'currently-reading': return 'blue.500';
      case 'want-to-read': return 'orange.500';
      default: return 'gray.500';
    }
  };

  // Obtener texto según estado de lectura
  const getReadingStatusText = (status) => {
    switch (status) {
      case 'read': return 'Leído';
      case 'currently-reading': return 'Leyendo';
      case 'want-to-read': return 'Por leer';
      default: return status;
    }
  };

  return (
    <Box
      maxW="600px"
      mx="auto"
      mb={8}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      {/* Header - Usuario y opciones */}
      <Flex
        px={4}
        py={3}
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth="1px"
        borderColor="gray.100"
      >
        <Flex alignItems="center" gap={3}>
          <Avatar
            size="sm"
            src={post.user.profilePicURL}
            name={post.user.displayName}
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="600" fontSize="sm" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
              {post.user.username}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {post.timeAgo}
            </Text>
          </VStack>
        </Flex>

        <IconButton
          aria-label="Más opciones"
          icon={<FiMoreHorizontal />}
          size="sm"
          variant="ghost"
          color="gray.500"
          _hover={{ bg: 'gray.100' }}
        />
      </Flex>

      {/* Imagen del libro con doble tap para like */}
      <Box position="relative" ref={imageRef} cursor="pointer">
        <Image
          src={post.book.image}
          alt={`Portada de ${post.book.title}`}
          w="100%"
          h="500px"
          objectFit="cover"
          fallback={
            <Skeleton height="500px" width="100%" />
          }
        />

        {/* Badge de estado de lectura */}
        <Badge
          position="absolute"
          top={3}
          left={3}
          bg={getReadingStatusColor(post.review.readingStatus)}
          color="white"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
          fontWeight="bold"
        >
          {getReadingStatusText(post.review.readingStatus)}
        </Badge>

        {/* Badge de páginas */}
        <Badge
          position="absolute"
          top={3}
          right={3}
          bg="blackAlpha.700"
          color="white"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
          fontWeight="bold"
        >
          {post.book.pageCount} págs
        </Badge>

        {/* Animación de corazón en doble tap */}
        <AnimatePresence>
          {showHeartAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <BsHeartFill size={80} color="white" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.5))' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Acciones (Like, Comment, Share, Save) */}
      <Flex px={4} py={3} alignItems="center" justifyContent="space-between">
        <HStack spacing={4}>
          <IconButton
            aria-label={isLiked ? "Quitar like" : "Dar like"}
            icon={isLiked ? <BsHeartFill color="#ED4956" /> : <BsHeart />}
            size="sm"
            variant="ghost"
            color={isLiked ? "red.500" : "gray.700"}
            onClick={handleLike}
            _hover={{ bg: 'gray.100' }}
          />

          <IconButton
            aria-label="Comentar"
            icon={<BsChat />}
            size="sm"
            variant="ghost"
            color="gray.700"
            onClick={handleComment}
            _hover={{ bg: 'gray.100' }}
          />

          <IconButton
            aria-label="Compartir"
            icon={<BsSend />}
            size="sm"
            variant="ghost"
            color="gray.700"
            onClick={handleShare}
            _hover={{ bg: 'gray.100' }}
          />
        </HStack>

        <IconButton
          aria-label={isSaved ? "Eliminar de guardados" : "Guardar"}
          icon={isSaved ? <BsBookmarkFill color="#262626" /> : <BsBookmark />}
          size="sm"
          variant="ghost"
          color="gray.700"
          onClick={handleSave}
          _hover={{ bg: 'gray.100' }}
        />
      </Flex>

      {/* Contadores de likes y descripción */}
      <Box px={4} pb={2}>
        <Text fontWeight="600" fontSize="sm" mb={2}>
          {likesCount.toLocaleString()} {likesCount === 1 ? 'me gusta' : 'me gusta'}
        </Text>

        {/* Información del libro y rating */}
        <Flex alignItems="center" mb={3} gap={2}>
          <Text fontWeight="700" fontSize="md" noOfLines={1}>
            {post.book.title}
          </Text>
          <HStack spacing={1}>
            {renderRatingStars(post.review.rating)}
            <Text fontSize="xs" color="gray.500">
              ({post.review.rating}.0)
            </Text>
          </HStack>
        </Flex>

        <Text fontSize="sm" color="gray.600" mb={2} noOfLines={1}>
          por {post.book.authors.join(', ')}
        </Text>

        {/* Reseña */}
        <Box mb={3}>
          <Text fontWeight="600" fontSize="sm" mb={1}>
            {post.review.title}
          </Text>
          <Text fontSize="sm" color="gray.800" lineHeight="tall">
            {post.review.excerpt}
          </Text>
          {post.review.content.length > 280 && (
            <Text
              as="span"
              fontSize="sm"
              color="gray.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
            >
              ... más
            </Text>
          )}
        </Box>

        {/* Tags */}
        {post.review.tags.length > 0 && (
          <Flex flexWrap="wrap" gap={2} mb={3}>
            {post.review.tags.slice(0, 3).map((tag, index) => (
              <Text
                key={index}
                as="span"
                fontSize="xs"
                color="blue.500"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                #{tag}
              </Text>
            ))}
            {post.review.tags.length > 3 && (
              <Text fontSize="xs" color="gray.500">
                +{post.review.tags.length - 3} más
              </Text>
            )}
          </Flex>
        )}

        {/* Comentarios */}
        {post.review.commentsCount > 0 && (
          <Text
            fontSize="sm"
            color="gray.500"
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            mb={2}
          >
            Ver los {post.review.commentsCount} comentarios
          </Text>
        )}

        {/* Añadir comentario (placeholder) */}
        <Text fontSize="xs" color="gray.400" mt={2}>
          Añade un comentario...
        </Text>
      </Box>
    </Box>
  );
};

export default BookCard;