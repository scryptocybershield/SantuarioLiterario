import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  Spinner,
  IconButton,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import BookSearchResult from "./BookSearchResult";
import useBookStore from "../../store/bookStore";
import useAuthStore from "../../store/authStore";

const BookSearch = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [localResults, setLocalResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const {
    searchResults,
    isLoading,
    searchError,
    searchBooks,
    clearSearchResults,
    addToLibrary,
    myLibrary,
  } = useBookStore();

  const { user } = useAuthStore();
  const userId = user?.uid;

  const toast = useToast();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          await searchBooks(searchQuery);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        clearSearchResults();
        setLocalResults([]);
      }
    }, 500),
    [searchBooks, clearSearchResults]
  );

  // Effect for debounced search
  useEffect(() => {
    if (query.trim().length > 0) {
      debouncedSearch(query);
      setShowResults(true);
    } else {
      clearSearchResults();
      setLocalResults([]);
      setShowResults(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch, clearSearchResults]);

  // Update local results when store results change
  useEffect(() => {
    if (searchResults.length > 0) {
      setLocalResults(searchResults);
    } else {
      setLocalResults([]);
    }
  }, [searchResults]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setQuery("");
    clearSearchResults();
    setLocalResults([]);
    setShowResults(false);
  };

  const handleAddToLibrary = async (book) => {
    if (!userId) {
      toast({
        title: "Debes iniciar sesión",
        description: "Inicia sesión para añadir libros a tu biblioteca",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if book is already in library (compare Google Books ID)
    const isAlreadyInLibrary = myLibrary.some((libBook) => libBook.bookId === book.id);
    if (isAlreadyInLibrary) {
      toast({
        title: "Libro ya en biblioteca",
        description: `"${book.title}" ya está en tu biblioteca`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addToLibrary(book, userId, 'want-to-read');
      toast({
        title: "Libro añadido",
        description: `"${book.title}" ha sido añadido a tu biblioteca`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding book to library:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el libro a tu biblioteca",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectBook = (book) => {
    handleAddToLibrary(book);
  };

  return (
    <Box position="relative" width="100%" maxW="600px" mx="auto">
      {/* Search Input */}
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="santuario.accent" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Buscar libros por título, autor o ISBN..."
          value={query}
          onChange={handleInputChange}
          borderRadius="full"
          borderColor="santuario.border"
          _hover={{ borderColor: "santuario.accent" }}
          _focus={{
            borderColor: "santuario.accent",
            boxShadow: "0 0 0 1px var(--color-accent)",
          }}
          bg="white"
          fontSize="md"
          fontFamily="body"
        />
        {(query.length > 0 || isSearching) && (
          <InputLeftElement right={0} pointerEvents="auto">
            {isSearching ? (
              <Spinner size="sm" color="santuario.accent" />
            ) : (
              <IconButton
                aria-label="Clear search"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
                color="santuario.charcoal"
                _hover={{ color: "santuario.accent" }}
              />
            )}
          </InputLeftElement>
        )}
      </InputGroup>

      {/* Search Results Dropdown */}
      {showResults && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          border="1px solid"
          borderColor="santuario.border"
          zIndex={1000}
          maxH="400px"
          overflowY="auto"
        >
          {/* Loading State */}
          {isLoading && (
            <Flex justify="center" align="center" p={6}>
              <Spinner color="santuario.accent" mr={3} />
              <Text color="santuario.charcoal">Buscando libros...</Text>
            </Flex>
          )}

          {/* Error State */}
          {searchError && !isLoading && (
            <Box p={4}>
              <Text color="red.500" fontSize="sm" textAlign="center">
                Error: {searchError}
              </Text>
            </Box>
          )}

          {/* No Results State */}
          {!isLoading && !searchError && localResults.length === 0 && query.length > 0 && (
            <VStack p={6} spacing={3}>
              <Text color="santuario.charcoal" fontSize="md" fontWeight="500">
                No se encontraron libros
              </Text>
              <Text color="santuario.charcoal" opacity={0.7} fontSize="sm" textAlign="center">
                Intenta con otro término de búsqueda o verifica la ortografía
              </Text>
            </VStack>
          )}

          {/* Results List */}
          {!isLoading && localResults.length > 0 && (
            <VStack spacing={0} align="stretch" maxH="350px" overflowY="auto">
              <Box p={3} borderBottom="1px solid" borderColor="santuario.border">
                <Text fontSize="sm" color="santuario.charcoal" opacity={0.7}>
                  {localResults.length} resultado{localResults.length !== 1 ? 's' : ''} encontrado{localResults.length !== 1 ? 's' : ''}
                </Text>
              </Box>
              {localResults.map((book) => (
                <BookSearchResult
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  isInLibrary={myLibrary.some((libBook) => libBook.bookId === book.id)}
                />
              ))}
            </VStack>
          )}

          {/* Search Tips */}
          {!isLoading && query.length > 0 && localResults.length > 0 && (
            <Box p={3} borderTop="1px solid" borderColor="santuario.border" bg="santuario.paper">
              <Text fontSize="xs" color="santuario.charcoal" opacity={0.6} textAlign="center">
                Presiona Enter para buscar • Haz clic en un libro para añadirlo a tu biblioteca
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Search Tips (when no query) */}
      {!showResults && query.length === 0 && (
        <Box mt={2} px={4}>
          <Text fontSize="xs" color="santuario.charcoal" opacity={0.6}>
            Sugerencias: "Cien años de soledad", "Gabriel García Márquez", "9788437604947"
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default BookSearch;