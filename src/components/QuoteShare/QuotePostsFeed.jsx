import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  Spinner,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BsChatQuote } from "react-icons/bs";
import usePosts from "../../hooks/usePosts";
import QuotePostCard from "./QuotePostCard";
import FavoriteQuoteModal from "./FavoriteQuoteModal";
import useAuthStore from "../../store/authStore";

const QuotePostsFeed = ({ bookId = null, limit = 10, showHeader = true }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuthStore();

  const { getRecentPosts, getBookPosts, isLoading: postsLoading } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [bookId]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let fetchedPosts;
      if (bookId) {
        fetchedPosts = await getBookPosts(bookId);
      } else {
        fetchedPosts = await getRecentPosts(limit);
      }
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error cargando posts:", err);
      setError("No se pudieron cargar las citas compartidas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteShared = () => {
    fetchPosts(); // Recargar posts después de compartir
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justify="center" py={10}>
          <Spinner
            size="lg"
            color="santuario.accent"
            thickness="3px"
            speed="0.65s"
          />
        </Flex>
      );
    }

    if (error) {
      return (
        <Box textAlign="center" py={8}>
          <Text color="red.500" mb={2}>
            {error}
          </Text>
          <Button
            size="sm"
            colorScheme="santuario"
            variant="outline"
            onClick={fetchPosts}
          >
            Reintentar
          </Button>
        </Box>
      );
    }

    if (posts.length === 0) {
      return (
        <Box textAlign="center" py={8}>
          <BsChatQuote size={48} color="#9ca3af" style={{ margin: "0 auto 16px" }} />
          <Text fontSize="md" color="gray.500" mb={2}>
            {bookId
              ? "Aún no hay citas compartidas de este libro"
              : "Aún no hay citas compartidas"}
          </Text>
          <Text fontSize="sm" color="gray.400" mb={4}>
            Sé el primero en compartir una cita favorita
          </Text>
          {user && !bookId && (
            <Button
              leftIcon={<BsChatQuote />}
              colorScheme="santuario"
              size="sm"
              onClick={onOpen}
            >
              Compartir mi primera cita
            </Button>
          )}
        </Box>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {posts.map((post) => (
          <QuotePostCard key={post.id} post={post} />
        ))}
      </VStack>
    );
  };

  return (
    <Box>
      {showHeader && (
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h3" size="md" color="santuario.charcoal">
            <BsChatQuote style={{ display: "inline", marginRight: "8px" }} />
            {bookId ? "Citas compartidas" : "Citas recientes"}
          </Heading>
          {user && !bookId && (
            <Button
              leftIcon={<BsChatQuote />}
              colorScheme="santuario"
              size="sm"
              onClick={onOpen}
            >
              Compartir cita
            </Button>
          )}
        </Flex>
      )}

      {renderContent()}

      {/* Modal para compartir cita (solo en feed general) */}
      {!bookId && (
        <FavoriteQuoteModal
          isOpen={isOpen}
          onClose={onClose}
          onShare={handleQuoteShared}
        />
      )}
    </Box>
  );
};

export default QuotePostsFeed;