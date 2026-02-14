import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
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


		try {
			const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
			if (!newUser && error) {
				showToast("Error", error.message, "error");
				return;
			}
			if (newUser) {
				// 📧 Enviar verificación de correo electrónico inmediatamente después del registro
				try {
					await sendEmailVerification(newUser.user);
					showToast(
						"¡Verificación enviada!",
						"Hemos enviado un correo de verificación a " + inputs.email + ". Por favor, revisa tu bandeja de entrada.",
						"success"
					);
				} catch (emailError) {
					console.error("Error enviando correo de verificación:", emailError);
					showToast(
						"Advertencia",
						"Cuenta creada pero no pudimos enviar el correo de verificación. Puedes solicitarlo más tarde desde la configuración de tu cuenta.",
						"warning"
					);
				}

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
					emailVerified: false, // Inicialmente falso, se actualizará cuando el usuario verifique
				};

				// Crear documento del usuario en Firestore
				const batch = writeBatch(firestore);
				batch.set(doc(firestore, "users", newUser.user.uid), userDoc);
				await batch.commit();

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
				message = "Error de permisos en la base de datos. Contacta al administrador.";
			}
			showToast("Error de registro", message, "error");
		}
	};

	return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;
