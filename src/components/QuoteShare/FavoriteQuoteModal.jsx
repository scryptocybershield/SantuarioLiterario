import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  Flex,
  Box,
  Text,
  useToast,
  Spinner,
  VStack,
  Badge,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState } from "react";
import { BsChatQuote } from "react-icons/bs";
import usePosts from "../../hooks/usePosts";
import useAuthStore from "../../store/authStore";

const FavoriteQuoteModal = ({ bookId, bookTitle, isOpen, onClose, onShare }) => {
  console.log("FavoriteQuoteModal props:", { bookId, bookTitle, isOpen });

  const [quoteText, setQuoteText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const toast = useToast();
  const { user } = useAuthStore();
  const { shareQuoteAsPost } = usePosts();

  const handleTextChange = (e) => {
    const text = e.target.value;
    setQuoteText(text);
    setCharacterCount(text.length);
  };

  const handleShareQuote = async () => {
    console.log("handleShareQuote called");
    console.log("quoteText:", quoteText);
    console.log("user:", user);
    console.log("bookId:", bookId);

    if (!quoteText.trim()) {
      console.log("Error: quoteText is empty");
      toast({
        title: "Error",
        description: "La cita no puede estar vacía",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!user || !bookId) {
      console.log("Error: user or bookId missing", { user, bookId });
      toast({
        title: "Error",
        description: "Debes iniciar sesión para compartir citas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    console.log("Starting to share quote...");

    try {
      const quoteData = {
        userId: user.uid,
        bookId,
        bookTitle,
        text: quoteText.trim(),
        type: "quote_post",
        isPublic: true,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      console.log("Quote data prepared:", quoteData);

      // Usar el hook usePosts para compartir la cita
      console.log("Attempting to share quote using usePosts hook...");
      const createdPost = await shareQuoteAsPost(quoteData);
      console.log("Quote shared successfully:", createdPost);

      toast({
        title: "Cita compartida",
        description: "Tu cita favorita ha sido compartida como post",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Llamar a la función onShare si existe
      if (onShare) {
        console.log("Calling onShare callback");
        onShare(createdPost);
      }

      // Cerrar el modal y resetear
      onClose();
      setQuoteText("");
      setCharacterCount(0);
      console.log("Modal closed and reset");
    } catch (error) {
      console.error("Error compartiendo cita:", error);
      console.error("Error details:", error.message, error.stack);
      toast({
        title: "Error",
        description: "No se pudo compartir la cita. Intenta nuevamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      console.log("Loading state reset");
    }
  };

  const handleClose = () => {
    setQuoteText("");
    setCharacterCount(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg="santuario.cream" color="santuario.charcoal" borderRadius="lg">
        <ModalHeader borderBottom="1px solid" borderColor="santuario.border">
          <Flex align="center" justify="space-between">
            <Text fontSize="lg" fontWeight="600">
              <BsChatQuote style={{ display: "inline", marginRight: "8px" }} />
              Compartir cita favorita
            </Text>
            <Badge colorScheme="santuario" variant="subtle">
              Post
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Información del libro */}
            <Box p={4} bg="santuario.paper" borderRadius="md" border="1px solid" borderColor="santuario.border">
              <Text fontSize="sm" fontWeight="600" color="santuario.charcoal">
                Libro:
              </Text>
              <Text fontSize="md" color="santuario.charcoal" mt={1}>
                "{bookTitle}"
              </Text>
            </Box>

            {/* Formulario para escribir la cita */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="santuario.charcoal">
                Escribe tu cita favorita de este libro:
              </FormLabel>
              <Textarea
                value={quoteText}
                onChange={handleTextChange}
                placeholder="Ej: 'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.'"
                size="md"
                minHeight="150px"
                resize="vertical"
                borderColor="santuario.border"
                _hover={{ borderColor: "santuario.accent" }}
                _focus={{
                  borderColor: "santuario.accent",
                  boxShadow: "0 0 0 1px var(--chakra-colors-santuario-accent)",
                }}
                bg="white"
              />
              <Flex justify="space-between" mt={2}>
                <Text fontSize="xs" color={characterCount > 500 ? "red.500" : "gray.500"}>
                  {characterCount} / 500 caracteres
                </Text>
                {characterCount > 500 && (
                  <Text fontSize="xs" color="red.500">
                    Límite excedido
                  </Text>
                )}
              </Flex>
            </FormControl>

            {/* Consejos */}
            <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <Text fontSize="xs" fontWeight="600" mb={1} color="blue.800">
                💡 Consejos para una buena cita:
              </Text>
              <Text fontSize="xs" color="blue.700">
                • Elige frases que te hayan impactado o inspirado
                • Incluye contexto si es necesario
                • Revisa la ortografía antes de compartir
                • Las citas cortas suelen tener más engagement
              </Text>
            </Box>

            {/* Botones de acción */}
            <Flex justify="space-between" pt={4}>
              <Button
                onClick={handleClose}
                variant="outline"
                colorScheme="gray"
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleShareQuote}
                colorScheme="santuario"
                isLoading={isLoading}
                loadingText="Compartiendo..."
                isDisabled={!quoteText.trim() || characterCount > 500 || isLoading}
                leftIcon={<BsChatQuote />}
              >
                Compartir como post
              </Button>
            </Flex>

            {/* Estado de carga */}
            {isLoading && (
              <VStack spacing={3} py={4}>
                <Spinner
                  size="md"
                  color="santuario.accent"
                  thickness="3px"
                  speed="0.65s"
                />
                <Text fontSize="sm" color="santuario.charcoal" opacity={0.8}>
                  Publicando tu cita...
                </Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FavoriteQuoteModal;