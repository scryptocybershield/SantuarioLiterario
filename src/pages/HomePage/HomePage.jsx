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
		<Container maxW={"container.xl"} px={{ base: 4, md: 6, lg: 8 }}>
			<VStack spacing={6} py={8} align="stretch">
				{/* Header con búsqueda - Alineado con el grid */}
				<Box width="100%">
					<Text fontSize="2xl" fontWeight="700" fontFamily="heading" mb={1} color="santuario.charcoal">
						Santuario Literario
					</Text>
					<Text fontSize="sm" color="santuario.charcoal" opacity={0.7} mb={4}>
						Tu espacio de introspección y lectura profunda
					</Text>
					<Box width="100%" maxW="600px">
						<BookSearch />
					</Box>
				</Box>

				{/* Sistema de pestañas para navegación - SIEMPRE VISIBLES */}
				<Tabs variant="enclosed" width="100%" colorScheme="blue">
					<TabList borderBottom="2px solid" borderColor="gray.200">
						<Tab
							fontWeight="600"
							_selected={{ color: "blue.600", borderBottom: "2px solid", borderColor: "blue.600" }}
							py={3}
							px={4}
						>
							📚 Mi Biblioteca
						</Tab>
						<Tab
							fontWeight="600"
							_selected={{ color: "blue.600", borderBottom: "2px solid", borderColor: "blue.600" }}
							py={3}
							px={4}
						>
							✨ Feed Social
						</Tab>
						<Tab
							fontWeight="600"
							_selected={{ color: "blue.600", borderBottom: "2px solid", borderColor: "blue.600" }}
							py={3}
							px={4}
						>
							💬 Citas Compartidas
						</Tab>
					</TabList>

					<TabPanels pt={4}>
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
