import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  useToast,
  Progress,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ArrowBackIcon, CloseIcon, SettingsIcon, InfoIcon } from "@chakra-ui/icons";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBookStore from "../../store/bookStore";
import useAuthStore from "../../store/authStore";
import PomodoroTimer from "../../components/PomodoroTimer/PomodoroTimer";
import EbookReader from "../../components/EbookReader/EbookReader";

const DeepReadingPage = () => {
  const { id } = useParams(); // firestoreId del libro
  const navigate = useNavigate();
  const toast = useToast();
  const { myLibrary, isLoading } = useBookStore();
  const { user } = useAuthStore();
  const userId = user?.uid;

  const [book, setBook] = useState(null);
  const [showTimer, setShowTimer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Buscar el libro en la biblioteca local
  useEffect(() => {
    if (id) {
      const foundBook = myLibrary.find((b) => b.id === id);
      if (foundBook) {
        setBook(foundBook);
      } else {
        toast({
          title: "Libro no encontrado",
          description: "Este libro no está en tu biblioteca",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        navigate("/");
      }
    }
  }, [id, myLibrary, navigate, toast]);

  const handleExitSantuario = () => {
    navigate("/");
  };

  const handleToggleTimer = () => {
    setShowTimer(!showTimer);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleUpdateProgress = useCallback((newProgress) => {
    if (book && userId) {
      const { updateReadingProgress } = useBookStore.getState();
      updateReadingProgress(book.id, newProgress, book.currentPage, userId);
    }
  }, [book, userId]);

  const handleLocationChange = (cfi) => {
    // Aquí podríamos guardar el CFI en Firestore para persistencia real
    console.log("Nueva ubicación CFI:", cfi);
    if (book && userId) {
      // Por ahora actualizamos el store local si tuviéramos un campo lastLocation
      // useBookStore.getState().updateBookField(book.id, { lastLocation: cfi }, userId);
    }
  };

  if (isLoading || !book) {
    return (
      <Box
        bg="#1a1a1a"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="whiteAlpha.800" fontSize="lg">
          Cargando santuario...
        </Text>
      </Box>
    );
  }

  const {
    title,
    authors = [],
    progress = 0,
  } = book;

  return (
    <Box
      bg="#1a1a1a"
      minH="100vh"
      color="white"
      fontFamily="body"
      position="relative"
      overflow="hidden"
    >
      {/* Barra superior flotante */}
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        height="60px"
        bg="rgba(0,0,0,0.8)"
        backdropFilter="blur(10px)"
        zIndex={10}
        align="center"
        px={6}
        justify="space-between"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
      >
        <HStack spacing={4}>
          <Tooltip label="Volver a la biblioteca" hasArrow>
            <IconButton
              aria-label="Salir del santuario"
              icon={<ArrowBackIcon />}
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={handleExitSantuario}
              size="md"
            />
          </Tooltip>
          <VStack align="start" spacing={0}>
            <Heading size="xs" noOfLines={1} maxW="300px">
              {title}
            </Heading>
            <Text fontSize="xs" opacity={0.7} noOfLines={1}>
              {authors.join(', ')}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={3}>
          <Tooltip label={showTimer ? "Ocultar Temporizador" : "Ver Temporizador"} hasArrow>
            <IconButton
              aria-label="Toggle timer"
              icon={<SettingsIcon />}
              variant={showTimer ? "solid" : "ghost"}
              colorScheme={showTimer ? "santuario" : "whiteAlpha"}
              color="white"
              onClick={handleToggleTimer}
              size="md"
            />
          </Tooltip>
          <IconButton
            aria-label="Toggle fullscreen"
            icon={<CloseIcon />}
            variant="ghost"
            color="white"
            onClick={handleToggleFullscreen}
            size="md"
          />
        </HStack>
      </Flex>

      {/* Contenido Principal */}
      <Flex
        pt="60px"
        pb="80px"
        h="100vh"
        align="center"
        justify="center"
        px={4}
        position="relative"
      >
        {/* Lector de eBooks Interno */}
        <Box
          w="100%"
          maxW="1100px"
          h="calc(100vh - 160px)"
          position="relative"
          bg="white"
          borderRadius="lg"
          boxShadow="2xl"
          overflow="hidden"
        >
          <EbookReader
            title={title}
            savedLocation={book.lastLocation}
            onLocationChange={handleLocationChange}
          />
        </Box>

        {/* Panel lateral del Temporizador */}
        <Box
          position="fixed"
          right={showTimer ? "20px" : "-400px"}
          top="80px"
          transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          zIndex={5}
          maxW="350px"
          w="100%"
        >
          <PomodoroTimer
            onSessionComplete={() => {
              const audio = new Audio("/sounds/rain.mp3");
              audio.play().catch(console.error);
              toast({
                title: "¡Sesión completada!",
                status: "success",
                duration: 5000,
                isClosable: true,
              });
            }}
            onProgressUpdate={handleUpdateProgress}
          />
        </Box>
      </Flex>

      {/* Barra inferior de controles */}
      <Flex
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        height="70px"
        bg="rgba(0,0,0,0.85)"
        backdropFilter="blur(10px)"
        zIndex={10}
        align="center"
        px={8}
        justify="space-between"
        borderTop="1px solid"
        borderColor="whiteAlpha.200"
      >
        <HStack spacing={6} flex={1}>
          <Box w="200px">
            <Text fontSize="xs" mb={1} color="whiteAlpha.700">Progreso de lectura</Text>
            <Progress value={progress} size="xs" colorScheme="santuario" borderRadius="full" bg="whiteAlpha.200" />
          </Box>
          <Text fontSize="xs" color="whiteAlpha.600">
            {progress}% completado
          </Text>
        </HStack>

        <HStack spacing={4} flex={1} justify="center">
          <Text fontSize="sm" fontWeight="semibold" letterSpacing="widest" color="whiteAlpha.800">
            SANTUARIO LITERARIO
          </Text>
        </HStack>

        <Flex flex={1} justify="flex-end">
          <Tooltip label="Ver detalles del libro" hasArrow>
            <IconButton
              icon={<InfoIcon />}
              variant="ghost"
              color="white"
              size="md"
              _hover={{ color: "santuario.accent" }}
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};

export default DeepReadingPage;