import { Box, Container, Flex, VStack, Text, Spinner, Center } from "@chakra-ui/react";
import ReadingFeed from "../../components/ReadingFeed/ReadingFeed";
import BookSearch from "../../components/BookSearch/BookSearch";
import useAuthStore from "../../store/authStore";

const HomePage = () => {
	const user = useAuthStore((state) => state.user);

	if (!user) {
		return (
			<Center height="100vh">
				<Spinner size="xl" color="santuario.accent" />
			</Center>
		);
	}

	return (
		<Container maxW={"container.xl"}>
			{/* <Tester /> */}
			<VStack spacing={8} py={10}>
				{/* Header con búsqueda */}
				<Box width="100%" textAlign="center">
					<Text fontSize="3xl" fontWeight="700" fontFamily="heading" mb={2} color="santuario.charcoal">
						Santuario Literario
					</Text>
					<Text fontSize="md" color="santuario.charcoal" opacity={0.7} mb={6}>
						Tu espacio de introspección y lectura profunda
					</Text>
					<Box maxW="600px" mx="auto">
						<BookSearch />
					</Box>
				</Box>

				{/* Biblioteca personal */}
				<Box width="100%">
					<ReadingFeed />
				</Box>
			</VStack>
		</Container>
	);
};

export default HomePage;
