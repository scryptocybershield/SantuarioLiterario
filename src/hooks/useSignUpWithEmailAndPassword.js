import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";

const useSignUpWithEmailAndPassword = () => {
	const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const signup = async (inputs) => {
		if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		const usersRef = collection(firestore, "users");

		try {
			const q = query(usersRef, where("username", "==", inputs.username));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				showToast("Error", "Username already exists", "error");
				return;
			}
		} catch (firestoreError) {
			console.error("Firestore query error:", firestoreError);
			console.error("Error code:", firestoreError.code);
			console.error("Error message:", firestoreError.message);

			if (firestoreError.code && firestoreError.code.includes('permission-denied') || firestoreError.message.includes('Missing or insufficient permissions')) {
				showToast(
					"Permisos de Firestore",
					"Configura las reglas de seguridad en Firebase Console > Firestore > Rules. Regla temporal: allow read, write: if true;",
					"error"
				);
			} else {
				showToast("Error de Firestore", firestoreError.message, "error");
			}
			return;
		}

		try {
			const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
			if (!newUser && error) {
				showToast("Error", error.message, "error");
				return;
			}
			if (newUser) {
				const userDoc = {
					uid: newUser.user.uid,
					email: inputs.email,
					username: inputs.username,
					fullName: inputs.fullName,
					bio: "",
					profilePicURL: "",
					followers: [],
					following: [],
					posts: [],
					createdAt: Date.now(),
				};
				await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
				localStorage.setItem("user-info", JSON.stringify(userDoc));
				loginUser(userDoc);
			}
		} catch (error) {
			console.error("Firebase signup error:", error);
			console.error("Error code:", error.code);
			console.error("Error message:", error.message);

			let message = error.message || "Error de Registro: No se pudo crear la cuenta.";
			if (error.code === 'auth/network-request-failed' || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
				message = "Error de conexión: No se pudo conectar con el servidor de autenticación.";
			} else if (error.code === 'auth/email-already-in-use') {
				message = "Email ya registrado: Este correo electrónico ya está en uso.";
			} else if (error.code === 'auth/invalid-email') {
				message = "Email inválido: Por favor ingresa un email válido.";
			} else if (error.code === 'auth/weak-password') {
				message = "Contraseña débil: La contraseña debe tener al menos 6 caracteres.";
			} else if (error.code === 'auth/operation-not-allowed') {
				message = "Operación no permitida: El registro con email/contraseña no está habilitado. Verifica en Firebase Console que esté habilitado.";
			} else if (error.code === 'auth/too-many-requests') {
				message = "Demasiados intentos: Por favor espera unos minutos antes de intentar nuevamente.";
			} else if (error.code === 'auth/unauthorized-domain') {
				message = "Dominio no autorizado: Agrega este dominio a la lista de dominios autorizados en Firebase Console > Authentication > Settings > Authorized domains.";
			} else if (error.code && error.code.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
				message = "Permisos de Firestore denegados: Configura las reglas de seguridad en Firebase Console > Firestore > Rules. Usa temporalmente: allow read, write: if true;";
			}
			showToast("Error de registro", message, "error");
		}
	};

	return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;
