import { Box, Flex, Text, Image, VStack, HStack, Badge } from "@chakra-ui/react";
import { BsStarFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const TopRatedBooks = ({ books, userId, isOwnProfile }) => {
  // Filtrar libros calificados y ordenar por calificación
  const ratedBooks = books
    .filter(book => book.publicRating > 0)
    .sort((a, b) => b.publicRating - a.publicRating)
    .slice(0, 5); // Top 5

  if (ratedBooks.length === 0) {
    return null;
  }

  return (
    <Box mt={6} p={4} bg="santuario.paper" borderRadius="lg" border="1px solid" borderColor="santuario.border">
      <Text fontSize="sm" fontWeight="600" mb={3} color="santuario.charcoal">
        {isOwnProfile ? "📖 Tus libros mejor calificados" : "📖 Libros mejor calificados"}
      </Text>

      <VStack spacing={3} align="stretch">
        {ratedBooks.map((book) => (
          <Link key={book.id} to={`/read/${book.id}`}>
            <Flex
              p={2}
              borderRadius="md"
              _hover={{ bg: "gray.50" }}
              transition="background-color 0.2s"
              align="center"
              gap={3}
            >
              <Box
                w="45px"
                h="65px"
                borderRadius="sm"
                overflow="hidden"
                flexShrink={0}
                border="1px solid"
                borderColor="santuario.border"
              >
                <Image
                  src={book.thumbnail || "https://via.placeholder.com/45x65?text=Portada"}
                  alt={book.title}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
              </Box>

              <Box flex="1" minW={0}>
                <Text fontSize="xs" fontWeight="600" noOfLines={1} color="santuario.charcoal">
                  {book.title}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {book.authors?.join(', ')}
                </Text>
              </Box>

              <HStack spacing={1}>
                <BsStarFill size={12} color="#F6AD55" />
                <Text fontSize="xs" fontWeight="bold" color="yellow.600">
                  {book.publicRating}.0
                </Text>
              </HStack>
            </Flex>
          </Link>
        ))}
      </VStack>

      {ratedBooks.length > 0 && (
        <Text fontSize="xs" color="gray.500" mt={3} textAlign="center">
          {isOwnProfile
            ? `Has calificado ${ratedBooks.length} libro${ratedBooks.length !== 1 ? 's' : ''}`
            : `${ratedBooks.length} calificación${ratedBooks.length !== 1 ? 'es' : ''}`}
        </Text>
      )}
    </Box>
  );
};

export default TopRatedBooks;