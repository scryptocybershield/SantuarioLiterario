import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const EmptyState = () => {
  return (
    <VStack
      spacing={6}
      textAlign="center"
      py={12}
      px={4}
      mt={8}
      border="1px dashed"
      borderColor="santuario.border"
      borderRadius="lg"
      bg="santuario.paper"
    >
      <Box fontSize="5xl" color="santuario.accent" opacity={0.4}>
        📚
      </Box>

      <VStack spacing={2}>
        <Text fontSize="xl" fontWeight="700" fontFamily="heading" color="santuario.charcoal">
          Tu santuario literario está esperando
        </Text>
        <Text fontSize="md" color="santuario.charcoal" opacity={0.7} maxW="400px">
          Añade tu primer libro para comenzar tu viaje de lectura.
          Busca títulos, autores o géneros que te inspiren.
        </Text>
      </VStack>

      <Button
        leftIcon={<SearchIcon />}
        colorScheme="blue"
        variant="solid"
        size="md"
        mt={2}
        onClick={() => {
          // Scroll al buscador superior
          document.querySelector('input[type="search"]')?.focus();
        }}
      >
        Buscar libros
      </Button>

      <Text fontSize="sm" color="santuario.accent" fontStyle="italic" mt={4}>
        "Un libro abierto es un cerebro que habla; cerrado, un amigo que espera"
      </Text>
    </VStack>
  );
};

export default EmptyState;