/**
 * Componente de carrusel para mostrar recomendaciones de libros
 * "Libros que podrían gustarte"
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Image,
  Button,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useToast,
  IconButton,
  Tooltip,
  Badge,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Divider,
  ButtonGroup,
  Center
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getBookRecommendations, getUserBasedRecommendations } from '../../services/semanticRecommender.js';
import useBookStore from '../../store/bookStore.js';

const RecommendationCarousel = ({
  sourceBook = null,
  userId = null,
  title = "Libros que podrían gustarte",
  maxRecommendations = 5,
  showSimilarityScore = false,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutos
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { selectBook } = useBookStore();

  // Cargar recomendaciones
  useEffect(() => {
    loadRecommendations();

    // Configurar auto-refresh si está habilitado
    let refreshTimer;
    if (autoRefresh) {
      refreshTimer = setInterval(() => {
        loadRecommendations();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [sourceBook, userId, autoRefresh]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let recs = [];

      if (sourceBook) {
        // Recomendaciones basadas en un libro específico
        recs = await getBookRecommendations(sourceBook, userId);
      } else if (userId) {
        // Recomendaciones basadas en historial del usuario
        recs = await getUserBasedRecommendations(userId);
      } else {
        // Sin fuente específica - mostrar mensaje
        setError('Se requiere un libro fuente o usuario para generar recomendaciones');
        setIsLoading(false);
        return;
      }

      setRecommendations(recs.slice(0, maxRecommendations));
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      setError('No se pudieron cargar las recomendaciones');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las recomendaciones',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book) => {
    // Seleccionar libro en el store
    selectBook(book.id);

    // Navegar a la página de detalles del libro
    navigate(`/book/${book.id}`);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === recommendations.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? recommendations.length - 1 : prevIndex - 1
    );
  };

  const handleViewAll = () => {
    // Navegar a una página de recomendaciones completa
    navigate('/recommendations', {
      state: {
        recommendations,
        sourceBook,
        userId
      }
    });
  };

  const handleRefresh = () => {
    loadRecommendations();
    toast({
      title: 'Recomendaciones actualizadas',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Renderizar esqueleto durante carga
  if (isLoading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
        <Skeleton height="30px" width="200px" mb={4} />
        <Flex gap={4} overflow="hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} flex="0 0 200px">
              <Card>
                <Skeleton height="150px" />
                <CardBody>
                  <SkeletonText mt="4" noOfLines={2} spacing="4" />
                </CardBody>
              </Card>
            </Box>
          ))}
        </Flex>
      </Box>
    );
  }

  // Renderizar error
  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={2}>{title}</Heading>
        <Text color="gray.500">{error}</Text>
        <Button mt={2} size="sm" onClick={loadRecommendations}>
          Reintentar
        </Button>
      </Box>
    );
  }

  // Renderizar sin recomendaciones
  if (recommendations.length === 0) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={2}>{title}</Heading>
        <Text color="gray.500">
          {sourceBook
            ? 'No se encontraron recomendaciones similares para este libro.'
            : 'Comienza a leer libros para recibir recomendaciones personalizadas.'}
        </Text>
      </Box>
    );
  }

  // Calcular libros visibles (carrusel de 3 elementos)
  const visibleCount = Math.min(3, recommendations.length);
  const visibleBooks = [];

  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % recommendations.length;
    visibleBooks.push(recommendations[index]);
  }

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      bg="white"
      position="relative"
    >
      {/* Encabezado */}
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="md" mb={1}>{title}</Heading>
          <Text fontSize="sm" color="gray.500">
            {recommendations.length} recomendaciones basadas en {
              sourceBook ? 'este libro' : 'tu historial de lectura'
            }
          </Text>
        </Box>

        <ButtonGroup size="sm" spacing={2}>
          <Button
            leftIcon={<ExternalLinkIcon />}
            onClick={handleViewAll}
            variant="outline"
          >
            Ver todas
          </Button>
          <Button
            onClick={handleRefresh}
            variant="ghost"
          >
            Actualizar
          </Button>
        </ButtonGroup>
      </Flex>

      <Divider mb={4} />

      {/* Controles del carrusel */}
      <Flex align="center" justify="space-between" mb={4}>
        <IconButton
          aria-label="Libro anterior"
          icon={<ChevronLeftIcon />}
          onClick={handlePrev}
          size="sm"
          isDisabled={recommendations.length <= 3}
        />

        <Flex gap={4} flex="1" justify="center" overflow="hidden">
          {visibleBooks.map((book, index) => (
            <Box
              key={book.id}
              flex={`0 0 ${100 / visibleCount}%`}
              px={2}
              cursor="pointer"
              onClick={() => handleBookClick(book)}
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
            >
              <Card
                height="100%"
                variant="outline"
                position="relative"
              >
                {/* Badge de similitud (opcional) */}
                {showSimilarityScore && book.similarityScore && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="green"
                    zIndex={1}
                  >
                    {Math.round(book.similarityScore * 100)}% match
                  </Badge>
                )}

                {/* Imagen del libro */}
                <Center height="150px" bg="gray.50" borderBottomWidth="1px">
                  {book.thumbnail || book.image ? (
                    <Image
                      src={book.thumbnail || book.image}
                      alt={book.title}
                      objectFit="contain"
                      maxH="140px"
                      maxW="100px"
                      fallbackSrc="https://via.placeholder.com/100x140?text=No+Image"
                    />
                  ) : (
                    <Box
                      width="100px"
                      height="140px"
                      bg="gray.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Sin imagen
                      </Text>
                    </Box>
                  )}
                </Center>

                <CardBody p={3}>
                  <Stack spacing={2}>
                    {/* Título */}
                    <Heading size="xs" noOfLines={2}>
                      {book.title}
                    </Heading>

                    {/* Autores */}
                    {book.authors && book.authors.length > 0 && (
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        {book.authors.join(', ')}
                      </Text>
                    )}

                    {/* Categorías */}
                    {book.categories && book.categories.length > 0 && (
                      <Flex wrap="wrap" gap={1}>
                        {book.categories.slice(0, 2).map((cat, idx) => (
                          <Badge key={idx} fontSize="xxs" colorScheme="blue">
                            {cat}
                          </Badge>
                        ))}
                        {book.categories.length > 2 && (
                          <Badge fontSize="xxs" variant="outline">
                            +{book.categories.length - 2}
                          </Badge>
                        )}
                      </Flex>
                    )}

                    {/* Puntuación personalizada (si existe) */}
                    {book.personalizationScore && book.personalizationScore > 1.0 && (
                      <Flex align="center" gap={1}>
                        <StarIcon color="yellow.400" w={3} h={3} />
                        <Text fontSize="xs" color="gray.600">
                          Personalizado para ti
                        </Text>
                      </Flex>
                    )}
                  </Stack>
                </CardBody>

                <CardFooter p={3} pt={0}>
                  <Button
                    size="xs"
                    width="full"
                    colorScheme="blue"
                    variant="outline"
                  >
                    Ver detalles
                  </Button>
                </CardFooter>
              </Card>
            </Box>
          ))}
        </Flex>

        <IconButton
          aria-label="Siguiente libro"
          icon={<ChevronRightIcon />}
          onClick={handleNext}
          size="sm"
          isDisabled={recommendations.length <= 3}
        />
      </Flex>

      {/* Indicadores de página */}
      {recommendations.length > 3 && (
        <Flex justify="center" gap={2} mt={2}>
          {Array.from({ length: Math.ceil(recommendations.length / 3) }).map((_, idx) => (
            <Box
              key={idx}
              w={2}
              h={2}
              borderRadius="full"
              bg={Math.floor(currentIndex / 3) === idx ? 'blue.500' : 'gray.300'}
              cursor="pointer"
              onClick={() => setCurrentIndex(idx * 3)}
            />
          ))}
        </Flex>
      )}

      {/* Información adicional */}
      <Box mt={4} pt={4} borderTopWidth="1px">
        <Text fontSize="sm" color="gray.600">
          <strong>Nota:</strong> Las recomendaciones se generan automáticamente usando análisis semántico
          del contenido de los libros. Se actualizan periódicamente según tu actividad de lectura.
        </Text>
      </Box>
    </Box>
  );
};

export default RecommendationCarousel;