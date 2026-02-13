import { Box, Container, VStack, Text, Heading, Divider } from "@chakra-ui/react";
import { BsJournal } from "react-icons/bs";

const JournalPage = () => {
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
						<BsJournal size={30} />
						Mi Diario de Lectura
					</Heading>
					<Text fontSize="md" color="santuario.charcoal" opacity={0.7}>
						Reflexiones privadas y notas personales sobre tus lecturas
					</Text>
					<Divider my={6} borderColor="santuario.border" />
				</Box>

				{/* Contenido placeholder */}
				<Box width="100%" textAlign="center" py={10}>
					<Text fontSize="lg" color="santuario.charcoal" opacity={0.6}>
						Próximamente: aquí podrás ver todas las notas privadas que hayas escrito en tus libros.
					</Text>
					<Text fontSize="sm" color="santuario.charcoal" opacity={0.5} mt={4}>
						Cada vez que agregues un libro a tu biblioteca y escribas notas, aparecerán en esta página.
					</Text>
				</Box>
			</VStack>
		</Container>
	);
};

export default JournalPage;