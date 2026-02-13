import { Box, Flex, Image, Text, Button, Badge, Tooltip } from "@chakra-ui/react";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { BsBook } from "react-icons/bs";

const BookSearchResult = ({ book, onSelect, isInLibrary }) => {
  const { title, authors = [], thumbnail, publisher, publishedDate, pageCount, categories = [] } = book;

  const handleClick = () => {
    onSelect(book);
  };

  return (
    <Box
      p={4}
      borderBottom="1px solid"
      borderColor="santuario.border"
      _hover={{
        bg: "santuario.paper",
        cursor: "pointer",
      }}
      _last={{
        borderBottom: "none",
      }}
      onClick={handleClick}
      transition="background-color 0.2s ease"
    >
      <Flex gap={4} align="start">
        {/* Book Cover */}
        <Box
          minW="60px"
          w="60px"
          h="90px"
          borderRadius="md"
          overflow="hidden"
          flexShrink={0}
          border="1px solid"
          borderColor="santuario.border"
          bg="gray.50"
        >
          <Image
            src={thumbnail || "https://via.placeholder.com/60x90?text=No+portada"}
            alt={`Portada de ${title}`}
            objectFit="cover"
            width="100%"
            height="100%"
            fallbackSrc="https://via.placeholder.com/60x90?text=No+portada"
          />
        </Box>

        {/* Book Info */}
        <Box flex="1" minW={0}>
          <Flex justify="space-between" align="start" mb={1}>
            <Text
              fontSize="md"
              fontWeight="600"
              fontFamily="heading"
              color="santuario.charcoal"
              noOfLines={2}
            >
              {title}
            </Text>
            {isInLibrary ? (
              <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="md">
                <CheckIcon mr={1} /> En biblioteca
              </Badge>
            ) : (
              <Tooltip label="Añadir a mi biblioteca" hasArrow>
                <Button
                  size="sm"
                  leftIcon={<AddIcon />}
                  colorScheme="santuario"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  Añadir
                </Button>
              </Tooltip>
            )}
          </Flex>

          <Text fontSize="sm" color="santuario.charcoal" opacity={0.8} mb={2} noOfLines={1}>
            {authors.join(', ')}
          </Text>

          {/* Metadata */}
          <Flex wrap="wrap" gap={2} mb={2}>
            {publisher && (
              <Badge variant="subtle" colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">
                {publisher}
              </Badge>
            )}
            {publishedDate && (
              <Badge variant="subtle" colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">
                {publishedDate.substring(0, 4)}
              </Badge>
            )}
            {pageCount > 0 && (
              <Badge variant="subtle" colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">
                {pageCount} págs.
              </Badge>
            )}
          </Flex>

          {/* Categories */}
          {categories.length > 0 && (
            <Flex wrap="wrap" gap={1}>
              {categories.slice(0, 2).map((category, idx) => (
                <Badge
                  key={idx}
                  variant="subtle"
                  colorScheme="blue"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {category}
                </Badge>
              ))}
              {categories.length > 2 && (
                <Badge
                  variant="subtle"
                  colorScheme="gray"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  +{categories.length - 2}
                </Badge>
              )}
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default BookSearchResult;