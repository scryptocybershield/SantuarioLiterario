import { Box, Flex, Text, VStack, Heading, Image } from "@chakra-ui/react";
import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import GoogleAuth from "./GoogleAuth";

const AuthForm = () => {
	const [isLogin, setIsLogin] = useState(true);

	return (
		<>
			<Box
				border={"1px solid"}
				borderColor={"santuario.border"}
				borderRadius="lg"
				padding={8}
				bg="white"
				boxShadow="md"
			>
				<VStack spacing={6}>
					<Image src="/logo.png" alt="Santuario Literario" boxSize="60px" borderRadius="full" />
					<Heading
						as="h2"
						fontSize="2xl"
						fontWeight="600"
						fontFamily="heading"
						color="santuario.charcoal"
						textAlign="center"
					>
						Santuario
					</Heading>

					{isLogin ? <Login /> : <Signup />}

					{/* ---------------- O -------------- */}
					<Flex alignItems={"center"} justifyContent={"center"} my={4} gap={1} w={"full"}>
						<Box flex={2} h={"1px"} bg={"santuario.border"} />
						<Text mx={2} fontSize="sm" color="santuario.charcoal" opacity={0.7}>
							O
						</Text>
						<Box flex={2} h={"1px"} bg={"santuario.border"} />
					</Flex>

					<GoogleAuth prefix={isLogin ? "Iniciar sesión" : "Registrarse"} />
				</VStack>
			</Box>

			<Box
				border={"1px solid"}
				borderColor={"santuario.border"}
				borderRadius="lg"
				padding={6}
				bg="white"
				boxShadow="md"
			>
				<Flex alignItems={"center"} justifyContent={"center"}>
					<Text mx={2} fontSize={14} color="santuario.charcoal">
						{isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
					</Text>
					<Text
						onClick={() => setIsLogin(!isLogin)}
						color={"santuario.accent"}
						cursor={"pointer"}
						fontWeight="600"
						_hover={{ textDecoration: "underline" }}
					>
						{isLogin ? "Regístrate" : "Inicia sesión"}
					</Text>
				</Flex>
			</Box>
		</>
	);
};

export default AuthForm;
