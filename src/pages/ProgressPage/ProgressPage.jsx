import { Box, Container, VStack, Text, Heading, Divider, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react";
import { BsBarChart, BsBook, BsClock, BsStar, BsCheckCircle, BsBookmark, BsPauseCircle } from "react-icons/bs";
import useBookStore from "../../store/bookStore";
import useAuthStore from "../../store/authStore";
import { useEffect } from "react";

const ProgressPage = () => {
	const { myLibrary, loadLibraryFromFirestore, getReadingStats, getRatingStats } = useBookStore();
	const authUser = useAuthStore((state) => state.user);

	useEffect(() => {
		if (authUser?.uid) {
			loadLibraryFromFirestore(authUser.uid);
		}
	}, [authUser?.uid, loadLibraryFromFirestore]);

	const stats = getReadingStats();
	const ratingStats = getRatingStats();

	// Calcular género favorito
	const getFavoriteGenre = () => {
		if (myLibrary.length === 0) return { genre: "No hay datos", count: 0 };

		const genreCount = {};
		myLibrary.forEach(book => {
			book.categories?.forEach(category => {
				genreCount[category] = (genreCount[category] || 0) + 1;
			});
		});

		const favorite = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
		return favorite ? { genre: favorite[0], count: favorite[1] } : { genre: "Variado", count: 0 };
	};

	const favoriteGenre = getFavoriteGenre();
	const avgPagesPerBook = stats.totalBooks > 0 ? Math.round(stats.totalPages / stats.totalBooks) : 0;

	return (
		<Container maxW={"container.xl"}>
			<VStack spacing={8} py={10} align="start">
				{/* Header */}
				<Box width="100%">
					<Heading
						as="h1"
						fontSize="3xl"
						fontWeight="700"
						fontFamily="heading"
						mb={2}
						color="santuario.charcoal"
						display="flex"
						alignItems="center"
						gap={3}
					>
						<BsBarChart size={30} />
						Mi Progreso de Lectura
					</Heading>
					<Text fontSize="md" color="santuario.charcoal" opacity={0.7}>
						Estadísticas y métricas sobre tu viaje literario
					</Text>
					<Divider my={6} borderColor="santuario.border" />
				</Box>

				{/* Grid de estadísticas */}
				<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} width="100%">
					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsBook size={18} />
								Libros en total
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.totalBooks}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								{stats.currentlyReading} en curso, {stats.completed} terminados
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsClock size={18} />
								Páginas leídas
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.pagesRead.toLocaleString()}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								Promedio: {avgPagesPerBook} páginas por libro
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsStar size={18} />
								Valoración promedio
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{ratingStats.averageRating || "0.0"}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								{ratingStats.totalRated > 0 ? `Basado en ${ratingStats.totalRated} calificaciones` : "Sin calificaciones aún"}
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsCheckCircle size={18} />
								Tasa de completitud
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.completionRate}%</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								{stats.completed} de {stats.totalBooks} libros completados
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsBookmark size={18} />
								Por leer
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.totalBooks - stats.currentlyReading - stats.completed}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								Libros en tu lista de deseos
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsPauseCircle size={18} />
								Género favorito
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{favoriteGenre.genre}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								{favoriteGenre.count > 0 ? `${favoriteGenre.count} de ${stats.totalBooks} libros` : "Sin datos suficientes"}
							</StatHelpText>
						</Stat>
					</GridItem>
				</Grid>

				{/* Nota */}
				<Box width="100%" textAlign="center" py={6}>
					<Text fontSize="sm" color="santuario.charcoal" opacity={0.5} fontStyle="italic">
						Las estadísticas se actualizarán automáticamente a medida que agregues libros y actualices tu progreso.
					</Text>
				</Box>
			</VStack>
		</Container>
	);
};

export default ProgressPage;