import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Input, InputGroup, InputRightElement, VStack, Text, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useSignUpWithEmailAndPassword from "../../hooks/useSignUpWithEmailAndPassword";
import useCheckUsername from "../../hooks/useCheckUsername";

const Signup = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const { loading, error, signup } = useSignUpWithEmailAndPassword();
	const { isAvailable, loading: usernameLoading, error: usernameError, checkAvailability, clearValidation } = useCheckUsername();

	// Efecto para limpiar validación cuando el componente se desmonta
	useEffect(() => {
		return () => {
			clearValidation();
		};
	}, [clearValidation]);

	// Determinar si el botón de registro debe estar deshabilitado
	const isSignupDisabled = loading || usernameLoading || isAvailable === false || usernameError || !inputs.email || !inputs.password || !inputs.username || !inputs.fullName;

	return (
		<VStack spacing={4} w="full">
			<Input
				placeholder='Correo electrónico'
				fontSize={14}
				type='email'
				size={"md"}
				value={inputs.email}
				onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
				borderColor="santuario.border"
				_focus={{ borderColor: "santuario.accent", boxShadow: "none" }}
				bg="white"
			/>
			<Box w="full">
				<Input
					placeholder='Nombre de usuario'
					fontSize={14}
					type='text'
					size={"md"}
					value={inputs.username}
					onChange={(e) => {
						const newUsername = e.target.value;
						setInputs({ ...inputs, username: newUsername });
						checkAvailability(newUsername);
					}}
					borderColor={
						usernameLoading ? "santuario.border" :
						isAvailable === true ? "green.500" :
						isAvailable === false ? "red.500" :
						"santuario.border"
					}
					_focus={{
						borderColor: usernameLoading ? "santuario.border" :
							isAvailable === true ? "green.500" :
							isAvailable === false ? "red.500" :
							"santuario.accent",
						boxShadow: "none"
					}}
					bg="white"
					isInvalid={isAvailable === false || usernameError}
				/>
				{usernameLoading && (
					<Text fontSize="xs" color="santuario.charcoal" mt={1} ml={1}>
						Verificando disponibilidad...
					</Text>
				)}
				{isAvailable === true && (
					<Text fontSize="xs" color="green.500" mt={1} ml={1}>
						✓ Nombre de usuario disponible
					</Text>
				)}
				{(isAvailable === false || usernameError) && (
					<Text fontSize="xs" color="red.500" mt={1} ml={1}>
						{usernameError || "Este nombre de usuario no está disponible"}
					</Text>
				)}
			</Box>
			<Input
				placeholder='Nombre completo'
				fontSize={14}
				type='text'
				size={"md"}
				value={inputs.fullName}
				onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
				borderColor="santuario.border"
				_focus={{ borderColor: "santuario.accent", boxShadow: "none" }}
				bg="white"
			/>
			<InputGroup>
				<Input
					placeholder='Contraseña'
					fontSize={14}
					type={showPassword ? "text" : "password"}
					value={inputs.password}
					size={"md"}
					onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
					borderColor="santuario.border"
					_focus={{ borderColor: "santuario.accent", boxShadow: "none" }}
					bg="white"
					pr="3.5rem"
				/>
				<InputRightElement h='full' mr={1}>
					<Button
						variant={"ghost"}
						size={"sm"}
						onClick={() => setShowPassword(!showPassword)}
						color="santuario.charcoal"
						opacity={0.7}
						_hover={{ bg: "transparent", color: "santuario.accent" }}
					>
						{showPassword ? <ViewIcon /> : <ViewOffIcon />}
					</Button>
				</InputRightElement>
			</InputGroup>

			{error && (
				<Alert status='error' fontSize={13} p={3} borderRadius="md">
					<AlertIcon fontSize={12} />
					{error.message}
				</Alert>
			)}

			<Button
				w={"full"}
				bg={isSignupDisabled ? 'gray.300' : 'santuario.accent'}
				color='white'
				size={"md"}
				fontSize={14}
				isLoading={loading}
				isDisabled={isSignupDisabled}
				onClick={() => {
					if (isSignupDisabled) return;
					signup(inputs);
				}}
				mt={2}
				fontWeight="600"
				_hover={isSignupDisabled ? {} : { bg: 'santuario.charcoal' }}
				_active={isSignupDisabled ? {} : { bg: 'santuario.charcoal' }}
				transition="all 0.2s"
			>
				Registrarse
			</Button>
		</VStack>
	);
};

export default Signup;
