import { Flex, Image, Text } from "@chakra-ui/react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase/firebase";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GoogleAuth = ({ prefix }) => {
	const [signInWithGoogle, , , error] = useSignInWithGoogle(auth);
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const handleGoogleAuth = async () => {
		console.log("Starting Google authentication...");
		try {
			const newUser = await signInWithGoogle();
			console.log("Google auth result:", newUser);
			if (!newUser && error) {
				console.error("Google auth hook error:", error);
				showToast("Error", error.message, "error");
				return;
			}
			const userRef = doc(firestore, "users", newUser.user.uid);
			const userSnap = await getDoc(userRef);

			if (userSnap.exists()) {
				// login
				const userDoc = userSnap.data();
				localStorage.setItem("user-info", JSON.stringify(userDoc));
				loginUser(userDoc);
			} else {
				// signup
				const userDoc = {
					uid: newUser.user.uid,
					email: newUser.user.email,
					username: newUser.user.email.split("@")[0],
					fullName: newUser.user.displayName,
					bio: "",
					profilePicURL: newUser.user.photoURL,
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
			console.error("Google authentication error:", error);
			console.error("Error code:", error.code);
			console.error("Error message:", error.message);

			let message = error.message;
			if (error.code === 'auth/unauthorized-domain') {
				message = "Dominio no autorizado. Agrega este dominio a Firebase Console > Authentication > Settings > Authorized domains. Actualmente estás en: " + window.location.hostname;
			} else if (error.code === 'auth/popup-blocked') {
				message = "El popup de autenticación fue bloqueado. Permite popups para este sitio.";
			} else if (error.code === 'auth/popup-closed-by-user') {
				message = "Cerraste la ventana de autenticación. Intenta nuevamente.";
			} else if (error.code === 'auth/network-request-failed') {
				message = "Error de conexión. Verifica tu conexión a internet.";
			} else if (error.code === 'auth/operation-not-allowed') {
				message = "Autenticación con Google no habilitada. Actívala en Firebase Console > Authentication > Sign-in method.";
			}

			showToast("Error de Google Auth", message, "error");
		}
	};

	return (
		<Flex
			alignItems={"center"}
			justifyContent={"center"}
			cursor={"pointer"}
			onClick={handleGoogleAuth}
			border="1px solid"
			borderColor="santuario.border"
			borderRadius="md"
			p={3}
			w="full"
			_hover={{ bg: "santuario.paper", borderColor: "santuario.accent" }}
			transition="all 0.2s"
		>
			<Image src='/google.png' w={5} alt='Google logo' />
			<Text mx='2' color={"santuario.charcoal"} fontWeight="500">
				{prefix} con Google
			</Text>
		</Flex>
	);
};

export default GoogleAuth;
