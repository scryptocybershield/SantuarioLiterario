import { Box, Container, Flex, Grid, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import ReadingCard from "./ReadingCard";
import useBookStore from "../../store/bookStore";
import useAuthStore from "../../store/authStore";

const ReadingFeed = () => {
  const { myLibrary, isLoading, loadLibraryFromFirestore, getFilteredLibrary } = useBookStore();
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (authUser?.uid) {
      loadLibraryFromFirestore(authUser.uid);
    }
  }, [authUser?.uid, loadLibraryFromFirestore]);

  const filteredLibrary = getFilteredLibrary();

  if (isLoading && myLibrary.length === 0) {
    return (
      <Container maxW={"container.xl"} py={10} px={4}>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={6}
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <Box
              key={idx}
              border="1px solid"
              borderColor="santuario.border"
              borderRadius="lg"
              overflow="hidden"
              bg="white"
              p={4}
            >
              <VStack align="stretch" spacing={4}>
                <Skeleton height="200px" borderRadius="md" />
                <Box>
                  <Skeleton height="20px" width="80%" mb={2} />
                  <Skeleton height="16px" width="60%" />
                </Box>
                <Flex justify="space-between" align="center">
                  <SkeletonCircle size="8" />
                  <Skeleton height="20px" width="40px" />
                </Flex>
              </VStack>
            </Box>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!isLoading && filteredLibrary.length === 0) {
    return (
      <Container maxW={"container.md"} py={20} px={4}>
        <VStack spacing={6} textAlign="center">
          <Box fontSize="6xl" color="santuario.accent" opacity={0.3}>
            📚
          </Box>
          <Text fontSize="2xl" fontWeight="700" fontFamily="heading" color="santuario.charcoal">
            Tu santuario literario está esperando
          </Text>
          <Text fontSize="md" color="santuario.charcoal" opacity={0.7} maxW="400px">
            Añade tu primer libro para comenzar tu viaje de lectura.
            Busca títulos, autores o géneros que te inspiren.
          </Text>
          <Text fontSize="sm" color="santuario.accent" fontStyle="italic">
            "Un libro abierto es un cerebro que habla; cerrado, un amigo que espera"
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW={"container.xl"} py={10} px={4}>
      {filteredLibrary.length > 0 && (
        <Box mb={8}>
          <Text fontSize="2xl" fontWeight="700" fontFamily="heading" mb={2}>
            Tu Biblioteca
          </Text>
          <Text fontSize="sm" color="santuario.charcoal" opacity={0.7}>
            {filteredLibrary.length} libro{filteredLibrary.length !== 1 ? 's' : ''} en tu colección
          </Text>
        </Box>
      )}

      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
      >
        {filteredLibrary.map((book) => (
          <ReadingCard key={book.id} book={book} />
        ))}
      </Grid>
    </Container>
  );
};

export default ReadingFeed;