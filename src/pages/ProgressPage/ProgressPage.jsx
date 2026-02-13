import { Box, Container, VStack, Text, Heading, Divider, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react";
import { BsBarChart, BsBook, BsClock, BsStar } from "react-icons/bs";

const ProgressPage = () => {
	// Datos de ejemplo - luego vendrán de Firestore
	const stats = {
		totalBooks: 12,
		booksReading: 3,
		booksFinished: 9,
		totalPages: 2850,
		avgRating: 4.2,
		readingStreak: 7,
	};

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
								{stats.booksReading} en curso, {stats.booksFinished} terminados
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsClock size={18} />
								Páginas leídas
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.totalPages.toLocaleString()}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								Promedio: {Math.round(stats.totalPages / stats.totalBooks)} páginas por libro
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel display="flex" alignItems="center" gap={2} color="santuario.charcoal">
								<BsStar size={18} />
								Valoración promedio
							</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.avgRating}</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								Basado en tus calificaciones personales
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel color="santuario.charcoal">Racha de lectura</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">{stats.readingStreak} días</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								¡Sigue así!
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel color="santuario.charcoal">Tiempo total de lectura</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">47h</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								Estimación basada en 1h por día
							</StatHelpText>
						</Stat>
					</GridItem>

					<GridItem>
						<Stat p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="santuario.border">
							<StatLabel color="santuario.charcoal">Género favorito</StatLabel>
							<StatNumber fontSize="3xl" color="santuario.charcoal">Ficción</StatNumber>
							<StatHelpText color="santuario.charcoal" opacity={0.7}>
								8 de 12 libros
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