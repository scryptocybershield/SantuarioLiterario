import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserProfileStore from "../store/userProfileStore";
import useShowToast from "./useShowToast";
import { firestore } from "../firebase/firebase";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

// Función para limpiar objeto de usuario, extrayendo solo datos planos
const cleanUserObject = (user) => {
	if (!user) return null;
	return {
		uid: user.uid || "",
		email: user.email || "",
		username: user.username || "",
		fullName: user.fullName || "",
		bio: user.bio || "",
		profilePicURL: user.profilePicURL || "",
		followers: Array.isArray(user.followers) ? user.followers : [],
		following: Array.isArray(user.following) ? user.following : [],
		posts: Array.isArray(user.posts) ? user.posts : [],
		createdAt: user.createdAt || Date.now(),
	};
};

const useFollowUser = (userId) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setUser);
	const { userProfile, setUserProfile } = useUserProfileStore();
	const showToast = useShowToast();

	const handleFollowUser = async () => {
		setIsUpdating(true);
		try {
			const currentUserRef = doc(firestore, "users", authUser.uid);
			const userToFollowOrUnfollorRef = doc(firestore, "users", userId);
			await updateDoc(currentUserRef, {
				following: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
			});

			await updateDoc(userToFollowOrUnfollorRef, {
				followers: isFollowing ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
			});

			if (isFollowing) {
				// unfollow
				const cleanedAuthUser = cleanUserObject(authUser);
				const updatedAuthUser = {
					...cleanedAuthUser,
					following: cleanedAuthUser.following.filter((uid) => uid !== userId),
				};
				setAuthUser(updatedAuthUser);

				if (userProfile) {
					const cleanedUserProfile = cleanUserObject(userProfile);
					const updatedUserProfile = {
						...cleanedUserProfile,
						followers: cleanedUserProfile.followers.filter((uid) => uid !== authUser.uid),
					};
					setUserProfile(updatedUserProfile);
				}

				localStorage.setItem("user-info", JSON.stringify(updatedAuthUser));
				setIsFollowing(false);
			} else {
				// follow
				const cleanedAuthUser = cleanUserObject(authUser);
				const updatedAuthUser = {
					...cleanedAuthUser,
					following: [...cleanedAuthUser.following, userId],
				};
				setAuthUser(updatedAuthUser);

				if (userProfile) {
					const cleanedUserProfile = cleanUserObject(userProfile);
					const updatedUserProfile = {
						...cleanedUserProfile,
						followers: [...cleanedUserProfile.followers, authUser.uid],
					};
					setUserProfile(updatedUserProfile);
				}

				localStorage.setItem("user-info", JSON.stringify(updatedAuthUser));
				setIsFollowing(true);
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	useEffect(() => {
		if (authUser) {
			const isFollowing = authUser.following?.includes(userId) || false;
			setIsFollowing(isFollowing);
		}
	}, [authUser, userId]);

	return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
