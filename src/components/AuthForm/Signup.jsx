import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { useState } from "react";
import useSignUpWithEmailAndPassword from "../../hooks/useSignUpWithEmailAndPassword";

const Signup = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const { loading, error, signup } = useSignUpWithEmailAndPassword();

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
			<Input
				placeholder='Nombre de usuario'
				fontSize={14}
				type='text'
				size={"md"}
				value={inputs.username}
				onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
				borderColor="santuario.border"
				_focus={{ borderColor: "santuario.accent", boxShadow: "none" }}
				bg="white"
			/>
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
				bg='santuario.accent'
				color='white'
				size={"md"}
				fontSize={14}
				isLoading={loading}
				onClick={() => signup(inputs)}
				mt={2}
				fontWeight="600"
				_hover={{ bg: 'santuario.charcoal' }}
				_active={{ bg: 'santuario.charcoal' }}
			>
				Registrarse
			</Button>
		</VStack>
	);
};

export default Signup;
