import { Flex, Button, Badge, Text, HStack, Box } from "@chakra-ui/react";
import { BsBook, BsBookmark, BsClock, BsCheckCircle, BsPauseCircle } from "react-icons/bs";
import useBookStore from "../../store/bookStore";

const LibraryFilters = () => {
  const { libraryFilter, setLibraryFilter, getReadingStats, getRatingStats } = useBookStore();

  const stats = getReadingStats();
  const ratingStats = getRatingStats();

  const filters = [
    { id: 'all', label: 'Todos', icon: <BsBook />, count: stats.totalBooks },
    { id: 'want-to-read', label: 'Por leer', icon: <BsBookmark />, count: stats.totalBooks - stats.currentlyReading - stats.completed },
    { id: 'currently-reading', label: 'Leyendo', icon: <BsClock />, count: stats.currentlyReading },
    { id: 'read', label: 'Leídos', icon: <BsCheckCircle />, count: stats.completed },
    { id: 'on-hold', label: 'En pausa', icon: <BsPauseCircle />, count: stats.totalBooks - (stats.totalBooks - stats.currentlyReading - stats.completed) - stats.currentlyReading - stats.completed },
  ];

  const getFilterColor = (filterId) => {
    switch (filterId) {
      case 'want-to-read': return 'gray';
      case 'currently-reading': return 'green';
      case 'read': return 'blue';
      case 'on-hold': return 'orange';
      default: return 'santuario';
    }
  };

  return (
    <Box mb={8}>
      {/* Filtros principales */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={4}
        mb={6}
      >
        <Box>
          <Text fontSize="2xl" fontWeight="700" fontFamily="heading" mb={1}>
            Tu Biblioteca
          </Text>
          <Text fontSize="sm" color="santuario.charcoal" opacity={0.7}>
            {stats.totalBooks} libro{stats.totalBooks !== 1 ? 's' : ''} • {stats.pagesRead.toLocaleString()} páginas leídas
            {ratingStats.averageRating > 0 && ` • ⭐ ${ratingStats.averageRating}/5`}
          </Text>
        </Box>

        {/* Estadísticas rápidas */}
        <HStack spacing={3}>
          <Badge colorScheme="green" fontSize="xs" px={3} py={1} borderRadius="full">
            {stats.currentlyReading} leyendo
          </Badge>
          <Badge colorScheme="blue" fontSize="xs" px={3} py={1} borderRadius="full">
            {stats.completed} leídos
          </Badge>
          {ratingStats.averageRating > 0 && (
            <Badge colorScheme="yellow" fontSize="xs" px={3} py={1} borderRadius="full">
              ⭐ {ratingStats.averageRating}
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* Barra de filtros */}
      <Flex
        wrap="wrap"
        gap={2}
        p={3}
        bg="santuario.paper"
        borderRadius="lg"
        border="1px solid"
        borderColor="santuario.border"
      >
        {filters.map((filter) => (
          <Button
            key={filter.id}
            leftIcon={filter.icon}
            size="sm"
            colorScheme={libraryFilter === filter.id ? getFilterColor(filter.id) : 'gray'}
            variant={libraryFilter === filter.id ? 'solid' : 'outline'}
            onClick={() => setLibraryFilter(filter.id)}
            borderRadius="full"
            px={4}
          >
            {filter.label}
            {filter.count > 0 && (
              <Badge
                ml={2}
                colorScheme={libraryFilter === filter.id ? 'white' : getFilterColor(filter.id)}
                variant={libraryFilter === filter.id ? 'outline' : 'subtle'}
                fontSize="xs"
                borderRadius="full"
                px={2}
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </Flex>

      {/* Progreso general */}
      {stats.totalBooks > 0 && (
        <Box mt={4} p={3} bg="santuario.paper" borderRadius="lg" border="1px solid" borderColor="santuario.border">
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" fontWeight="500" color="santuario.charcoal">
              Progreso general de lectura
            </Text>
            <Text fontSize="sm" fontWeight="600" color="santuario.accent">
              {stats.completionRate}% completado
            </Text>
          </Flex>
          <Box
            h={2}
            bg="gray.100"
            borderRadius="full"
            overflow="hidden"
            position="relative"
          >
            <Box
              h="100%"
              bg="santuario.accent"
              borderRadius="full"
              width={`${stats.completionRate}%`}
              transition="width 0.3s ease"
            />
          </Box>
          <Flex justify="space-between" mt={2}>
            <Text fontSize="xs" color="gray.500">
              {stats.pagesRead.toLocaleString()} de {stats.totalPages.toLocaleString()} páginas
            </Text>
            <Text fontSize="xs" color="gray.500">
              {stats.readingProgress}% del total
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default LibraryFilters;