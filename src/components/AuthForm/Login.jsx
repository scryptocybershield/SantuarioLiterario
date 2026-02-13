import { Alert, AlertIcon, Button, Input, VStack } from "@chakra-ui/react";
import { useState } from "react";
import useLogin from "../../hooks/useLogin";

const Login = () => {
	const [inputs, setInputs] = useState({
		email: "",
		password: "",
	});
	const { loading, error, login } = useLogin();

	const handleSubmit = (e) => {
		e.preventDefault();
		login(inputs);
	};

	return (
		<form onSubmit={handleSubmit} style={{ width: '100%' }}>
			<VStack spacing={4} w="full">
				<Input
					name="email"
					placeholder='Correo electrónico'
					fontSize={14}
					type='email'
					size={"md"}
					value={inputs.email}
					onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
					borderColor="santuario.border"
					_focus={{ borderColor: "santuario.accent", boxShadow: "none" }}
					bg="white"
					autoComplete="username"
				/>
				<Input
					name="password"
					placeholder='Contraseña'
					fontSize={14}
					size={"md"}
					type='password'
					value={inputs.password}
					onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
					borderColor="santuario.border"
					_focus={{ borderColor: "santuario.accent", boxShadow: "none" }}
					bg="white"
					autoComplete="current-password"
				/>
				{error && (
					<Alert status='error' fontSize={13} p={3} borderRadius="md">
						<AlertIcon fontSize={12} />
						{error.message}
					</Alert>
				)}
				<Button
					type="submit"
					w={"full"}
					bg='santuario.accent'
					color='white'
					size={"md"}
					fontSize={14}
					isLoading={loading}
					mt={2}
					fontWeight="600"
					_hover={{ bg: 'santuario.charcoal' }}
					_active={{ bg: 'santuario.charcoal' }}
				>
					Iniciar sesión
				</Button>
			</VStack>
		</form>
	);
};

export default Login;
