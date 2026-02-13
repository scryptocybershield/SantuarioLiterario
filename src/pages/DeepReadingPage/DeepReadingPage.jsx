import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  useToast,
  Progress,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ArrowBackIcon, CloseIcon, SettingsIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBookStore from "../../store/bookStore";
import useAuthStore from "../../store/authStore";
import PomodoroTimer from "../../components/PomodoroTimer/PomodoroTimer";

const DeepReadingPage = () => {
  const { id } = useParams(); // firestoreId del libro
  const navigate = useNavigate();
  const toast = useToast();
  const { myLibrary, selectedBook, selectBook, isLoading } = useBookStore();
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
        // Si no está en la biblioteca local, intentar cargar desde Firestore
        // (por ahora, redirigir a la biblioteca)
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

  const handleUpdateProgress = (newProgress) => {
    // Actualizar progreso del libro
    if (book && userId) {
      // Implementar actualización de progreso
      console.log("Actualizar progreso a:", newProgress);
    }
  };

  if (isLoading || !book) {
    return (
      <Box
        bg="santuario.paper"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="santuario.charcoal" fontSize="lg">
          Cargando santuario...
        </Text>
      </Box>
    );
  }

  const {
    title,
    authors = [],
    thumbnail,
    image,
    description,
    progress = 0,
    pageCount = 0,
    currentPage = 0,
  } = book;

  return (
    <Box
      bg="santuario.paper"
      minH="100vh"
      color="santuario.charcoal"
      fontFamily="body"
      p={4}
    >
      {/* Barra superior minimalista */}
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor="santuario.border"
      >
        <Tooltip label="Volver a la biblioteca" hasArrow>
          <IconButton
            aria-label="Salir del santuario"
            icon={<ArrowBackIcon />}
            variant="ghost"
            color="santuario.charcoal"
            _hover={{ bg: "santuario.border" }}
            onClick={handleExitSantuario}
            size="lg"
          />
        </Tooltip>

        <Heading
          as="h1"
          fontSize={{ base: "xl", md: "2xl" }}
          fontFamily="heading"
          fontWeight="700"
          textAlign="center"
          flex="1"
          mx={4}
          noOfLines={1}
        >
          Santuario de lectura
        </Heading>

        <Flex gap={2}>
          <Tooltip label={showTimer ? "Ocultar temporizador" : "Mostrar temporizador"} hasArrow>
            <IconButton
              aria-label="Toggle timer"
              icon={<SettingsIcon />}
              variant="ghost"
              color="santuario.charcoal"
              _hover={{ bg: "santuario.border" }}
              onClick={handleToggleTimer}
              size="lg"
            />
          </Tooltip>

          <Tooltip label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"} hasArrow>
            <IconButton
              aria-label="Toggle fullscreen"
              icon={<CloseIcon />}
              variant="ghost"
              color="santuario.charcoal"
              _hover={{ bg: "santuario.border" }}
              onClick={handleToggleFullscreen}
              size="lg"
              transform={isFullscreen ? "rotate(45deg)" : "none"}
              transition="transform 0.3s ease"
            />
          </Tooltip>
        </Flex>
      </Flex>

      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={8}
          align="stretch"
          justify="center"
        >
          {/* Sección del libro */}
          <Box flex={{ base: "1", lg: "2" }}>
            <VStack spacing={8} align="center">
              {/* Portada del libro */}
              <Box
                maxW="400px"
                w="100%"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="xl"
                border="1px solid"
                borderColor="santuario.border"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.02)" }}
              >
                <Image
                  src={image || thumbnail || "https://via.placeholder.com/400x600?text=Portada+no+disponible"}
                  alt={`Portada de ${title}`}
                  objectFit="cover"
                  width="100%"
                  height="auto"
                  aspectRatio="2/3"
                  fallbackSrc="https://via.placeholder.com/400x600?text=Portada+no+disponible"
                />
              </Box>

              {/* Información del libro */}
              <VStack spacing={4} maxW="600px" w="100%" textAlign="center">
                <Heading
                  as="h2"
                  fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                  fontFamily="heading"
                  fontWeight="700"
                  lineHeight="1.2"
                  color="santuario.charcoal"
                >
                  {title}
                </Heading>

                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color="santuario.charcoal"
                  opacity={0.8}
                  fontStyle="italic"
                >
                  {authors.join(', ')}
                </Text>

                {description && (
                  <Text
                    fontSize="md"
                    color="santuario.charcoal"
                    opacity={0.7}
                    lineHeight="1.8"
                    mt={4}
                    maxH="200px"
                    overflowY="auto"
                    px={4}
                    py={3}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="santuario.border"
                  >
                    {description}
                  </Text>
                )}

                {/* Progreso de lectura */}
                <Box w="100%" maxW="400px" mt={6}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="600" color="santuario.charcoal">
                      Tu progreso
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="santuario.accent">
                      {progress}%
                    </Text>
                  </Flex>
                  <Progress
                    value={progress}
                    size="lg"
                    colorScheme="santuario"
                    borderRadius="full"
                    bg="santuario.border"
                  />
                  {pageCount > 0 && (
                    <Text fontSize="xs" color="santuario.charcoal" opacity={0.6} textAlign="center" mt={2}>
                      Página {currentPage} de {pageCount}
                    </Text>
                  )}
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Temporizador Pomodoro */}
          {showTimer && (
            <Box
              flex={{ base: "1", lg: "1" }}
              minW={{ base: "100%", lg: "350px" }}
              mt={{ base: 8, lg: 0 }}
            >
              <PomodoroTimer
                onSessionComplete={() => {
                  // Reproducir sonido de lluvia/bosque
                  const audio = new Audio("/sounds/rain.mp3");
                  audio.play().catch(console.error);

                  toast({
                    title: "¡Sesión completada!",
                    description: "Tómate un descanso de 5 minutos",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                  });
                }}
                onProgressUpdate={handleUpdateProgress}
              />
            </Box>
          )}
        </Flex>

        {/* Instrucciones minimalistas */}
        {!showTimer && (
          <VStack
            spacing={3}
            mt={12}
            p={6}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="santuario.border"
            maxW="400px"
            mx="auto"
            textAlign="center"
          >
            <Text fontSize="sm" color="santuario.charcoal" fontWeight="600">
              Modo Santuario activado
            </Text>
            <Text fontSize="xs" color="santuario.charcoal" opacity={0.7}>
              Enfócate en la lectura. El temporizador está oculto para minimizar distracciones.
            </Text>
            <Text fontSize="xs" color="santuario.accent" fontStyle="italic">
              "La lectura es a la mente lo que el ejercicio al cuerpo"
            </Text>
          </VStack>
        )}

        {/* Botón de acción principal */}
        <Flex justify="center" mt={12}>
          <Button
            size="lg"
            colorScheme="santuario"
            variant="outline"
            leftIcon={<ArrowBackIcon />}
            onClick={handleExitSantuario}
            borderRadius="full"
            px={8}
            py={6}
            fontSize="lg"
            _hover={{
              bg: "santuario.accent",
              color: "white",
              transform: "translateY(-2px)",
            }}
            transition="all 0.3s ease"
          >
            Volver al mundo exterior
          </Button>
        </Flex>
      </Container>

      {/* Efecto de sonido silencioso */}
      <audio id="rain-sound" src="/sounds/rain.mp3" preload="auto" />
      <audio id="forest-sound" src="/sounds/forest.mp3" preload="auto" />
    </Box>
  );
};

export default DeepReadingPage;