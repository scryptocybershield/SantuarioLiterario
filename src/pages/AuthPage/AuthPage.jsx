import { Container, Flex, VStack, Box, Text, Heading } from "@chakra-ui/react";
import AuthForm from "../../components/AuthForm/AuthForm";

const AuthPage = () => {
	return (
		<Flex
			minH={"100vh"}
			justifyContent={"center"}
			alignItems={"center"}
			bg="santuario.paper"
			px={4}
			fontFamily="body"
		>
			<Container maxW={"container.sm"} padding={0}>
				<VStack spacing={8} align={"stretch"}>
					{/* Encabezado */}
					<Box textAlign="center" mb={4}>
						<Heading
							as="h1"
							fontSize="4xl"
							fontWeight="700"
							fontFamily="heading"
							color="santuario.charcoal"
							mb={2}
						>
							Santuario Literario
						</Heading>
						<Text fontSize="lg" color="santuario.charcoal" opacity={0.7}>
							Tu espacio de introspección y lectura profunda
						</Text>
					</Box>

					{/* Formulario de autenticación */}
					<AuthForm />

					{/* Mensaje inspirador */}
					<Box textAlign="center" pt={4}>
						<Text fontSize="sm" color="santuario.charcoal" opacity={0.6} fontStyle="italic">
							"Un libro abierto es un cerebro que habla; cerrado, un amigo que espera; olvidado, un alma que perdona; destruido, un corazón que llora."
						</Text>
						<Text fontSize="xs" color="santuario.charcoal" opacity={0.5} mt={2}>
							Proverbio hindú
						</Text>
					</Box>
				</VStack>
			</Container>
		</Flex>
	);
};

export default AuthPage;
