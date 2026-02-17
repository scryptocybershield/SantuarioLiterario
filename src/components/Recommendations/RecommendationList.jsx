/**
 * Componente de lista simple para mostrar recomendaciones de libros
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
  SkeletonText,
  useToast,
  Badge,
  Card,
  CardBody,
  Stack,
  Divider,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import { StarIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getBookRecommendations, getUserBasedRecommendations } from '../../services/semanticRecommender.js';
import useBookStore from '../../store/bookStore.js';

const RecommendationList = ({
  sourceBook = null,
  userId = null,
  title = "Recomendaciones para ti",
  maxRecommendations = 3,
  compact = false,
  showHeader = true,
  onBookSelect = null
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { selectBook } = useBookStore();

  useEffect(() => {
    loadRecommendations();
  }, [sourceBook, userId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let recs = [];

      if (sourceBook) {
        recs = await getBookRecommendations(sourceBook, userId);
      } else if (userId) {
        recs = await getUserBasedRecommendations(userId);
      } else {
        setError('Se requiere un libro fuente o usuario');
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

    // Llamar callback personalizado si existe
    if (onBookSelect) {
      onBookSelect(book);
    } else {
      // Navegar por defecto
      navigate(`/book/${book.id}`);
    }
  };

  const handleViewMore = () => {
    navigate('/recommendations', {
      state: {
        recommendations,
        sourceBook,
        userId
      }
    });
  };

  // Renderizar esqueleto
  if (isLoading) {
    return (
      <Box>
        {showHeader && <Skeleton height="30px" width="200px" mb={4} />}
        <SimpleGrid columns={compact ? 1 : 3} spacing={4}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton height="120px" mb={2} />
                <SkeletonText mt="4" noOfLines={2} spacing="4" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  // Renderizar error
  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
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
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text color="gray.500">
          {sourceBook
            ? 'No se encontraron recomendaciones similares.'
            : 'Comienza a leer para recibir recomendaciones.'}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Encabezado */}
      {showHeader && (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">{title}</Heading>
            {recommendations.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ChevronRightIcon />}
                onClick={handleViewMore}
              >
                Ver más
              </Button>
            )}
          </Flex>
          <Divider mb={4} />
        </>
      )}

      {/* Lista de recomendaciones */}
      <SimpleGrid columns={compact ? 1 : { base: 1, md: 2, lg: 3 }} spacing={4}>
        {recommendations.map((book) => (
          <Card
            key={book.id}
            cursor="pointer"
            onClick={() => handleBookClick(book)}
            transition="all 0.2s"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
              borderColor: 'blue.200'
            }}
            variant="outline"
          >
            <CardBody>
              <Stack spacing={3}>
                {/* Imagen y título en línea para modo compacto */}
                <Flex gap={3} align={compact ? "flex-start" : "center"}>
                  {/* Imagen del libro */}
                  <Box flexShrink={0}>
                    {book.thumbnail || book.image ? (
                      <Image
                        src={book.thumbnail || book.image}
                        alt={book.title}
                        objectFit="cover"
                        width={compact ? "60px" : "80px"}
                        height={compact ? "90px" : "120px"}
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/80x120?text=No+Image"
                      />
                    ) : (
                      <Box
                        width={compact ? "60px" : "80px"}
                        height={compact ? "90px" : "120px"}
                        bg="gray.100"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Sin imagen
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* Información del libro */}
                  <Box flex="1">
                    <Heading size="sm" noOfLines={2} mb={1}>
                      {book.title}
                    </Heading>

                    {book.authors && book.authors.length > 0 && (
                      <Text fontSize="xs" color="gray.600" noOfLines={1} mb={2}>
                        {book.authors.join(', ')}
                      </Text>
                    )}

                    {/* Score de similitud */}
                    {book.similarityScore && (
                      <Flex align="center" gap={1} mb={2}>
                        <StarIcon color="yellow.400" w={3} h={3} />
                        <Text fontSize="xs" color="gray.600">
                          {Math.round(book.similarityScore * 100)}% de coincidencia
                        </Text>
                      </Flex>
                    )}
                  </Box>
                </Flex>

                {/* Categorías (solo en modo no compacto) */}
                {!compact && book.categories && book.categories.length > 0 && (
                  <Flex wrap="wrap" gap={1}>
                    {book.categories.slice(0, 3).map((cat, idx) => (
                      <Badge key={idx} fontSize="xxs" colorScheme="blue" variant="subtle">
                        {cat}
                      </Badge>
                    ))}
                  </Flex>
                )}

                {/* Descripción corta (solo en modo no compacto) */}
                {!compact && book.description && (
                  <Text fontSize="xs" color="gray.600" noOfLines={2}>
                    {book.description.substring(0, 100)}...
                  </Text>
                )}

                {/* Botón de acción */}
                <Button
                  size="xs"
                  width="full"
                  colorScheme="blue"
                  variant="outline"
                  mt={2}
                >
                  Ver libro
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Pie de página informativo */}
      {showHeader && recommendations.length > 0 && (
        <Box mt={4} pt={4} borderTopWidth="1px">
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Las recomendaciones se generan usando análisis semántico del contenido.
            {sourceBook && ' Basado en: ' + sourceBook.title}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default RecommendationList;