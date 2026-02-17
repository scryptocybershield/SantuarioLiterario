import { Box, Container, Flex, VStack, Text, Spinner, Center, Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import ReadingFeed from "../../components/ReadingFeed/ReadingFeed";
import BookSearch from "../../components/BookSearch/BookSearch";
import QuotePostsFeed from "../../components/QuoteShare/QuotePostsFeed";
import FeedPosts from "../../components/FeedPosts/FeedPosts";
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

				{/* Sistema de pestañas para navegación */}
				<Tabs variant="enclosed" width="100%" colorScheme="blue">
					<TabList>
						<Tab fontWeight="600">📚 Mi Biblioteca</Tab>
						<Tab fontWeight="600">✨ Feed Social</Tab>
						<Tab fontWeight="600">💬 Citas Compartidas</Tab>
					</TabList>

					<TabPanels>
						{/* Pestaña 1: Biblioteca personal */}
						<TabPanel px={0}>
							<ReadingFeed />
						</TabPanel>

						{/* Pestaña 2: Feed social Instagram-like */}
						<TabPanel px={0}>
							<FeedPosts />
						</TabPanel>

						{/* Pestaña 3: Citas compartidas */}
						<TabPanel px={0}>
							<QuotePostsFeed />
						</TabPanel>
					</TabPanels>
				</Tabs>
			</VStack>
		</Container>
	);
};

export default HomePage;
