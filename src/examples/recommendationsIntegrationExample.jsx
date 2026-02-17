/**
 * Ejemplo de integración del sistema de recomendaciones
 * en Santuario Literario
 */

import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Button,
  Flex,
  Divider
} from '@chakra-ui/react';

// Importar componentes de recomendaciones
import { RecommendationCarousel, RecommendationList } from '../components/Recommendations';
import useRecommendations from '../hooks/useRecommendations';
import useAuthStore from '../store/authStore';
import useBookStore from '../store/bookStore';

/**
 * Ejemplo 1: Integración básica en página de inicio
 */
export const HomePageWithRecommendations = () => {
  const { user } = useAuthStore();
  const { selectedBook } = useBookStore();

  // Hook para recomendaciones basadas en usuario
  const userRecommendations = useRecommendations({
    autoLoad: true,
    maxRecommendations: 5,
    refreshInterval: 300000 // 5 minutos
  });

  // Hook para recomendaciones basadas en libro seleccionado
  const bookRecommendations = useRecommendations({
    sourceBook: selectedBook,
    autoLoad: !!selectedBook,
    maxRecommendations: 3
  });

  return (
    <Container maxW="container.xl">
      <VStack spacing={8} py={10}>
        {/* Encabezado */}
        <Box width="100%" textAlign="center">
          <Heading size="2xl" mb={2} color="santuario.charcoal">
            Santuario Literario
          </Heading>
          <Text fontSize="lg" color="santuario.charcoal" opacity={0.7}>
            Tu espacio de introspección y lectura profunda
          </Text>
        </Box>

        {/* Recomendaciones para el usuario */}
        {user && userRecommendations.hasRecommendations && (
          <Box width="100%">
            <RecommendationCarousel
              userId={user.uid}
              title="Libros que podrían gustarte"
              maxRecommendations={5}
              autoRefresh={true}
            />
          </Box>
        )}

        {/* Sistema de pestañas */}
        <Tabs variant="enclosed" width="100%" colorScheme="blue">
          <TabList>
            <Tab fontWeight="600">📚 Mi Biblioteca</Tab>
            <Tab fontWeight="600">✨ Recomendaciones</Tab>
            <Tab fontWeight="600">💬 Citas Compartidas</Tab>
          </TabList>

          <TabPanels>
            {/* Pestaña 1: Biblioteca personal */}
            <TabPanel px={0}>
              <VStack spacing={6}>
                <Text>Tu biblioteca personal aparecerá aquí...</Text>

                {/* Recomendaciones basadas en libro seleccionado */}
                {selectedBook && bookRecommendations.hasRecommendations && (
                  <Box width="100%" mt={6}>
                    <Heading size="md" mb={4}>
                      Libros similares a "{selectedBook.title}"
                    </Heading>
                    <RecommendationList
                      sourceBook={selectedBook}
                      maxRecommendations={3}
                      compact={true}
                    />
                  </Box>
                )}
              </VStack>
            </TabPanel>

            {/* Pestaña 2: Recomendaciones */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg">Recomendaciones Personalizadas</Heading>

                {user ? (
                  <>
                    {/* Recomendaciones basadas en historial */}
                    <Box>
                      <Heading size="md" mb={4}>Basado en tu historial de lectura</Heading>
                      <RecommendationList
                        userId={user.uid}
                        maxRecommendations={6}
                        showHeader={false}
                      />
                    </Box>

                    <Divider />

                    {/* Recomendaciones por categorías de interés */}
                    <Box>
                      <Heading size="md" mb={4}>Explora por categorías</Heading>
                      <Text color="gray.600" mb={4}>
                        Descubre libros en tus géneros favoritos
                      </Text>
                      {/* Aquí irían filtros por categoría */}
                      <Button colorScheme="blue" variant="outline" size="sm">
                        Ver todas las categorías
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Inicia sesión para ver recomendaciones</AlertTitle>
                      <AlertDescription>
                        Las recomendaciones personalizadas requieren que estés autenticado.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Pestaña 3: Citas compartidas */}
            <TabPanel px={0}>
              <Text>Las citas compartidas aparecerán aquí...</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

/**
 * Ejemplo 2: Integración en página de detalles de libro
 */
export const BookDetailsPageWithRecommendations = ({ bookId }) => {
  const { selectedBook } = useBookStore();
  const { user } = useAuthStore();

  // Recomendaciones específicas para este libro
  const recommendations = useRecommendations({
    sourceBook: selectedBook,
    autoLoad: !!selectedBook,
    maxRecommendations: 5
  });

  if (!selectedBook) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Cargando libro...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Información del libro */}
        <Box>
          <Heading size="2xl" mb={2}>{selectedBook.title}</Heading>
          <Text fontSize="lg" color="gray.600" mb={4}>
            {selectedBook.authors?.join(', ')}
          </Text>
          <Text>{selectedBook.description}</Text>
        </Box>

        {/* Recomendaciones similares */}
        <Box>
          <Heading size="lg" mb={6}>Libros similares</Heading>

          {recommendations.isLoading ? (
            <Text>Cargando recomendaciones...</Text>
          ) : recommendations.hasRecommendations ? (
            <RecommendationCarousel
              sourceBook={selectedBook}
              userId={user?.uid}
              title={`Similar a "${selectedBook.title}"`}
              maxRecommendations={5}
              showSimilarityScore={true}
            />
          ) : (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>
                No se encontraron recomendaciones similares para este libro.
              </AlertDescription>
            </Alert>
          )}
        </Box>

        {/* Recomendaciones personalizadas adicionales */}
        {user && (
          <Box>
            <Heading size="lg" mb={6}>Recomendaciones para ti</Heading>
            <RecommendationList
              userId={user.uid}
              maxRecommendations={3}
              compact={true}
            />
          </Box>
        )}
      </VStack>
    </Container>
  );
};

/**
 * Ejemplo 3: Componente independiente de recomendaciones
 */
export const StandaloneRecommendationsWidget = () => {
  const { user } = useAuthStore();

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
      <Heading size="md" mb={4}>Descubre nuevos libros</Heading>

      {user ? (
        <VStack spacing={4} align="stretch">
          <Text color="gray.600">
            Basado en tu actividad de lectura reciente
          </Text>

          <RecommendationList
            userId={user.uid}
            maxRecommendations={3}
            compact={true}
            showHeader={false}
          />

          <Button
            colorScheme="blue"
            variant="outline"
            size="sm"
            alignSelf="flex-start"
          >
            Ver más recomendaciones
          </Button>
        </VStack>
      ) : (
        <Alert status="info" size="sm">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Inicia sesión para recomendaciones</AlertTitle>
            <AlertDescription fontSize="xs">
              Personaliza tu experiencia de lectura
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

/**
 * Ejemplo 4: Panel de administración de recomendaciones
 */
export const RecommendationsAdminPanel = () => {
  const handleRunTests = async () => {
    try {
      const { runTests } = await import('../services/recommendationTester.js');
      const results = await runTests();
      console.log('Resultados de tests:', results);
      alert('Tests completados. Revisa la consola para resultados.');
    } catch (error) {
      console.error('Error ejecutando tests:', error);
      alert('Error ejecutando tests: ' + error.message);
    }
  };

  const handleClearCache = () => {
    const { clearRecommendationCache } = require('../services/semanticRecommender.js');
    clearRecommendationCache();
    alert('Cache de recomendaciones limpiado');
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg">
      <Heading size="lg" mb={6}>Panel de Administración - Recomendaciones</Heading>

      <VStack spacing={4} align="stretch">
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Sistema de Recomendaciones Semánticas</AlertTitle>
            <AlertDescription>
              Motor basado en TF-IDF y similitud coseno con personalización por usuario.
            </AlertDescription>
          </Box>
        </Alert>

        <Box>
          <Heading size="md" mb={2}>Acciones</Heading>
          <Flex gap={3}>
            <Button colorScheme="blue" onClick={handleRunTests}>
              Ejecutar Tests
            </Button>
            <Button colorScheme="orange" onClick={handleClearCache}>
              Limpiar Cache
            </Button>
            <Button colorScheme="green" variant="outline">
              Ver Métricas
            </Button>
          </Flex>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Información del Sistema</Heading>
          <Code display="block" p={3} borderRadius="md" bg="gray.50">
            {JSON.stringify({
              version: '1.0.0',
              engine: 'Semantic Recommender',
              dataset: 'Santuario (15 libros temáticos)',
              features: ['TF-IDF', 'Cosine Similarity', 'Personalización', 'Cache']
            }, null, 2)}
          </Code>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Ejemplos de Uso</Heading>
          <VStack align="stretch" spacing={2}>
            <Code p={2} borderRadius="md" bg="gray.50">
              {'import { RecommendationCarousel } from "./components/Recommendations";'}
            </Code>
            <Code p={2} borderRadius="md" bg="gray.50">
              {'<RecommendationCarousel userId="user123" maxRecommendations={5} />'}
            </Code>
            <Code p={2} borderRadius="md" bg="gray.50">
              {'import useRecommendations from "./hooks/useRecommendations";'}
            </Code>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

/**
 * Exportar todos los ejemplos
 */
export default {
  HomePageWithRecommendations,
  BookDetailsPageWithRecommendations,
  StandaloneRecommendationsWidget,
  RecommendationsAdminPanel
};