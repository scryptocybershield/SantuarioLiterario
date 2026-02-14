import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetUserPosts = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { posts, setPosts } = usePostStore();
	const showToast = useShowToast();
	const userProfile = useUserProfileStore((state) => state.userProfile);

	useEffect(() => {
		const getPosts = async () => {
			if (!userProfile) return;
			setIsLoading(true);
			setPosts([]);

			try {
				// Buscar posts por createdBy (para posts antiguos) O por userId (para citas nuevas)
				const q = query(
					collection(firestore, "posts"),
					where("createdBy", "==", userProfile.uid)
				);
				const querySnapshot = await getDocs(q);

				const posts = [];
				querySnapshot.forEach((doc) => {
					posts.push({ ...doc.data(), id: doc.id });
				});

				// También buscar posts por userId (para citas compartidas)
				const q2 = query(
					collection(firestore, "posts"),
					where("userId", "==", userProfile.uid)
				);
				const querySnapshot2 = await getDocs(q2);

				querySnapshot2.forEach((doc) => {
					// Evitar duplicados si un post tiene ambos campos
					if (!posts.some(p => p.id === doc.id)) {
						posts.push({ ...doc.data(), id: doc.id });
					}
				});

				// Ordenar por fecha de creación (más reciente primero)
				posts.sort((a, b) => {
					const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
					const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
					return dateB - dateA;
				});

				setPosts(posts);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setIsLoading(false);
			}
		};

		getPosts();
	}, [setPosts, userProfile, showToast]);

	return { isLoading, posts };
};

export default useGetUserPosts;
