import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firestore, storage } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useUserProfileStore from "../store/userProfileStore";

const useEditProfile = () => {
	const [isUpdating, setIsUpdating] = useState(false);

	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setUser);
	const setUserProfile = useUserProfileStore((state) => state.setUserProfile);

	const showToast = useShowToast();

	const editProfile = async (inputs, selectedFile) => {
		if (isUpdating || !authUser) return;
		setIsUpdating(true);

		const storageRef = ref(storage, `profilePics/${authUser.uid}`);
		const userDocRef = doc(firestore, "users", authUser.uid);

		let URL = "";
		try {
			if (selectedFile) {
				await uploadString(storageRef, selectedFile, "data_url");
				URL = await getDownloadURL(ref(storage, `profilePics/${authUser.uid}`));
			}

			// Crear objeto limpio con solo datos planos para Firestore
			const updatedUser = {
				uid: authUser.uid,
				email: authUser.email || "",
				username: inputs.username || authUser.username || "",
				fullName: inputs.fullName || authUser.fullName || "",
				bio: inputs.bio || authUser.bio || "",
				profilePicURL: URL || authUser.profilePicURL || "",
				followers: authUser.followers || [],
				following: authUser.following || [],
				posts: authUser.posts || [],
				createdAt: authUser.createdAt || Date.now(),
			};

			// Actualizar solo los campos necesarios en Firestore
			await updateDoc(userDocRef, {
				fullName: updatedUser.fullName,
				username: updatedUser.username,
				bio: updatedUser.bio,
				profilePicURL: updatedUser.profilePicURL,
			});
			localStorage.setItem("user-info", JSON.stringify(updatedUser));
			setAuthUser(updatedUser);
			setUserProfile(updatedUser);
			showToast("Success", "Profile updated successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { editProfile, isUpdating };
};

export default useEditProfile;
