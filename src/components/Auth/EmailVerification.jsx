import { Box, Button, Text, VStack, Heading, Alert, AlertIcon, Spinner, useToast } from "@chakra-ui/react";
import { auth } from "../../firebase/firebase";
import { sendEmailVerification, reload, signOut } from "firebase/auth";
import { useState } from "react";

const EmailVerification = ({ user }) => {
	const [isSending, setIsSending] = useState(false);
	const [isReloading, setIsReloading] = useState(false);
	const toast = useToast();

	const handleResendVerification = async () => {
		setIsSending(true);
		try {
			await sendEmailVerification(user);
			toast({
				title: "Correo reenviado",
				description: "Hemos enviado un nuevo correo de verificación a " + user.email,
				status: "success",
				duration: 5000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Error reenviando correo de verificación:", error);
			toast({
				title: "Error",
				description: "No pudimos reenviar el correo. Intenta nuevamente más tarde.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setIsSending(false);
		}
	};

	const handleReloadUser = async () => {
		setIsReloading(true);
		try {
			await reload(user);
			// El usuario se recarga, pero necesitamos actualizar el estado en la app
			// Forzamos recarga de página para simplificar
			window.location.reload();
		} catch (error) {
			console.error("Error recargando usuario:", error);
			toast({
				title: "Error",
				description: "No pudimos verificar tu estado. Intenta recargar la página manualmente.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			setIsReloading(false);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			window.location.reload();
		} catch (error) {
			console.error('Error cerrando sesión:', error);
			toast({
				title: 'Error',
				description: 'No pudimos cerrar la sesión. Intenta nuevamente.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
	};

	return (
		<Box
			minHeight="100vh"
			bg="santuario.paper"
			display="flex"
			alignItems="center"
			justifyContent="center"
			p={4}
		>
			<VStack
				spacing={6}
				maxW="md"
				width="full"
				bg="white"
				p={8}
				borderRadius="lg"
				boxShadow="lg"
				textAlign="center"
			>
				<Heading size="lg" color="santuario.charcoal">
					📩 ¡Verifica tu correo electrónico!
				</Heading>

				<Alert status="info" borderRadius="md">
					<AlertIcon />
					Para acceder a Santuario Literario, necesitas verificar tu dirección de correo.
				</Alert>

				<Text fontSize="md" color="gray.700">
					Hemos enviado un enlace de verificación a:
				</Text>
				<Text fontSize="lg" fontWeight="bold" color="santuario.accent">
					{user.email}
				</Text>

				<Text fontSize="sm" color="gray.600">
					Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
				</Text>

				<VStack spacing={4} width="full" mt={4}>
					<Button
						colorScheme="blue"
						size="lg"
						width="full"
						onClick={handleResendVerification}
						isLoading={isSending}
						loadingText="Enviando..."
						leftIcon={isSending ? <Spinner size="sm" /> : null}
					>
						Reenviar correo de verificación
					</Button>

					<Button
						colorScheme="green"
						size="lg"
						width="full"
						onClick={handleReloadUser}
						isLoading={isReloading}
						loadingText="Verificando..."
						leftIcon={isReloading ? <Spinner size="sm" /> : null}
						variant="outline"
					>
						Ya he verificado mi cuenta
					</Button>

					<Button
						colorScheme="gray"
						size="md"
						width="full"
						onClick={handleSignOut}
						variant="ghost"
					>
						Cerrar sesión
					</Button>

					<Text fontSize="xs" color="gray.500" mt={4}>
						¿Problemas con la verificación? Asegúrate de que el correo esté correcto.
						Si necesitas ayuda, contacta con soporte.
					</Text>
				</VStack>
			</VStack>
		</Box>
	);
};

export default EmailVerification;