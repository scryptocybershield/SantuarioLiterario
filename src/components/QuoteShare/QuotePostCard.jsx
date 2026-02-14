import {
  Box,
  Flex,
  Text,
  Avatar,
  IconButton,
  Badge,
  HStack,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { BsHeart, BsHeartFill, BsChat, BsShare, BsBook } from "react-icons/bs";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import usePosts from "../../hooks/usePosts";
import useAuthStore from "../../store/authStore";

const QuotePostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const { user } = useAuthStore();
  const { likePost, commentOnPost } = usePosts();

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es,
      });
    } catch (error) {
      return "hace un momento";
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dar like",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await likePost(post.id);
      setIsLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el like",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = () => {
    // Por ahora solo muestra un toast, se puede expandir para abrir un modal de comentarios
    toast({
      title: "Comentarios",
      description: "Funcionalidad de comentarios próximamente",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    // Por ahora solo muestra un toast, se puede expandir para compartir en redes
    toast({
      title: "Compartir",
      description: "Funcionalidad de compartir próximamente",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box
      p={5}
      bg="santuario.cream"
      borderRadius="lg"
      border="1px solid"
      borderColor="santuario.border"
      mb={4}
      _hover={{
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
    >
      {/* Encabezado del post */}
      <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center">
          <Avatar
            size="sm"
            name={post.userName || "Usuario"}
            src={post.userPhoto}
            mr={3}
            bg="santuario.accent"
            color="white"
          />
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="600" color="santuario.charcoal">
              {post.userName || "Usuario"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(post.createdAt)}
            </Text>
          </VStack>
        </Flex>

        <Badge colorScheme="santuario" variant="subtle" fontSize="xs">
          Cita
        </Badge>
      </Flex>

      {/* Información del libro */}
      {post.bookTitle && (
        <Box
          mb={4}
          p={3}
          bg="santuario.paper"
          borderRadius="md"
          borderLeft="4px solid"
          borderLeftColor="santuario.accent"
        >
          <Flex align="center">
            <BsBook style={{ marginRight: "8px", color: "#8b5cf6" }} />
            <Text fontSize="sm" fontWeight="600" color="santuario.charcoal">
              De "{post.bookTitle}"
            </Text>
          </Flex>
        </Box>
      )}

      {/* Contenido de la cita */}
      <Box
        mb={4}
        p={4}
        bg="white"
        borderRadius="md"
        border="1px solid"
        borderColor="santuario.border"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          bg: "santuario.accent",
          borderRadius: "2px",
        }}
      >
        <Text
          fontSize="md"
          color="santuario.charcoal"
          fontStyle="italic"
          lineHeight="1.6"
        >
          "{post.text}"
        </Text>
      </Box>

      {/* Estadísticas y acciones */}
      <Flex align="center" justify="space-between" pt={3} borderTop="1px solid" borderColor="santuario.border">
        <HStack spacing={4}>
          <Flex align="center">
            <IconButton
              aria-label="Like"
              icon={isLiked ? <BsHeartFill color="#ef4444" /> : <BsHeart />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={handleLike}
              isLoading={isLoading}
              isDisabled={isLoading}
            />
            <Text fontSize="sm" color="gray.600" ml={1}>
              {likeCount}
            </Text>
          </Flex>

          <Flex align="center">
            <IconButton
              aria-label="Comentar"
              icon={<BsChat />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={handleComment}
            />
            <Text fontSize="sm" color="gray.600" ml={1}>
              {commentCount}
            </Text>
          </Flex>

          <IconButton
            aria-label="Compartir"
            icon={<BsShare />}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            onClick={handleShare}
          />
        </HStack>

        {/* Tipo de contenido */}
        <Text fontSize="xs" color="gray.500">
          {post.type === "quote_post" ? "Cita compartida" : "Post"}
        </Text>
      </Flex>
    </Box>
  );
};

export default QuotePostCard;