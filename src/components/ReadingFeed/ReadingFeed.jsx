import { Box, Container, Flex, Grid, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import ReadingCard from "./ReadingCard";
import LibraryFilters from "./LibraryFilters";
import EmptyState from "./EmptyState";
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
  const hasBooks = filteredLibrary.length > 0;

  return (
    <Container maxW={"container.xl"} py={6} px={4}>
      {/* Filtros y estadísticas - SIEMPRE VISIBLES */}
      <LibraryFilters />

      {/* Estado de carga */}
      {isLoading && myLibrary.length === 0 && (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={6}
          mt={8}
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
      )}

      {/* Grid de libros o estado vacío */}
      {!isLoading && (
        <>
          {hasBooks ? (
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              }}
              gap={6}
              mt={8}
            >
              {filteredLibrary.map((book) => (
                <ReadingCard key={book.id} book={book} />
              ))}
            </Grid>
          ) : (
            <EmptyState />
          )}
        </>
      )}
    </Container>
  );
};

export default ReadingFeed;