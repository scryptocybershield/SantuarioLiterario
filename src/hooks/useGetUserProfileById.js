import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useUserProfileStore from "../store/userProfileStore";

const useGetUserProfileById = (uid) => {
	const [isLoading, setIsLoading] = useState(true);
	const showToast = useShowToast();
	const { userProfile, setUserProfile } = useUserProfileStore();

	useEffect(() => {
		const getUserProfile = async () => {
			if (!uid || uid === "undefined") {
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			try {
				const userRef = doc(db, "users", uid);
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					setUserProfile(userSnap.data());
				} else {
					setUserProfile(null);
				}
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setIsLoading(false);
			}
		};

		getUserProfile();
	}, [setUserProfile, uid, showToast]);

	return { isLoading, userProfile };
};

export default useGetUserProfileById;
