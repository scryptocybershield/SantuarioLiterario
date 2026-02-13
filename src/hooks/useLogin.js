import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

const useLogin = () => {
	const showToast = useShowToast();
	const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
	const loginUser = useAuthStore((state) => state.login);

	const login = async (inputs) => {
		if (!inputs.email || !inputs.password) {
			return showToast("Error", "Please fill all the fields", "error");
		}
		try {
			const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);

			if (userCred) {
				const docRef = doc(firestore, "users", userCred.user.uid);
				const docSnap = await getDoc(docRef);
				localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
				loginUser(docSnap.data());
			}
		} catch (error) {
			console.error("Firebase login error:", error);
			console.error("Error code:", error.code);
			console.error("Error message:", error.message);

			let message = error.message || "Error de Seguridad: No se pudo validar la identidad.";
			// Mapping network failures to secure fallback messages
			if (error.code === 'auth/network-request-failed' || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
				message = "Error de conexión: No se pudo conectar con el servidor de autenticación.";
			} else if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
				message = "Credenciales incorrectas: Verifica tu email y contraseña.";
			} else if (error.code === 'auth/invalid-email') {
				message = "Email inválido: Por favor ingresa un email válido.";
			} else if (error.code === 'auth/too-many-requests') {
				message = "Demasiados intentos: Por favor espera unos minutos antes de intentar nuevamente.";
			} else if (error.code === 'auth/user-disabled') {
				message = "Cuenta deshabilitada: Contacta con soporte.";
			} else if (error.code === 'auth/unauthorized-domain') {
				message = "Dominio no autorizado: Agrega este dominio a la lista de dominios autorizados en Firebase Console > Authentication > Settings > Authorized domains.";
			} else if (error.code && error.code.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
				message = "Permisos de Firestore denegados: Configura las reglas de seguridad en Firebase Console > Firestore > Rules. Usa temporalmente: allow read, write: if true;";
			} else if (error.code === 'auth/operation-not-allowed') {
				message = "Autenticación con email/contraseña no habilitada. Actívala en Firebase Console > Authentication > Sign-in method.";
			}
			showToast("Error de autenticación", message, "error");
		}
	};

	return { loading, error, login };
};

export default useLogin;
