import { Container, Flex, Link, Skeleton, SkeletonCircle, Text, VStack, Grid, Box } from "@chakra-ui/react";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import ProfilePosts from "../../components/Profile/ProfilePosts";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import { useParams, Navigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useEffect, useState } from "react";
import useUserProfileStore from "../../store/userProfileStore";
import useBookStore from "../../store/bookStore";
import ReadingCard from "../../components/ReadingFeed/ReadingCard";

const ProfilePage = () => {
	const { uid } = useParams();
	const { isLoading, userProfile } = useGetUserProfileById(uid);
	const authUser = useAuthStore((state) => state.user);
	const { setUserProfile } = useUserProfileStore();
	const { myLibrary, loadLibraryFromFirestore } = useBookStore();
	const [activeTab, setActiveTab] = useState("posts");

	useEffect(() => {
		if (!isLoading && !userProfile && authUser && authUser.uid === uid) {
			// Fallback: If no Firestore profile but it's the current user, use Auth data
			setUserProfile({
				uid: authUser.uid,
				username: authUser.username || authUser.displayName || "usuario",
				fullName: authUser.fullName || authUser.displayName || "",
				bio: authUser.bio || "",
				profilePicURL: authUser.profilePicURL || authUser.photoURL || "",
				posts: [],
				followers: [],
				following: [],
			});
		}
	}, [isLoading, userProfile, authUser, uid, setUserProfile]);

	// Cargar biblioteca cuando se visita un perfil
	useEffect(() => {
		if (uid) {
			loadLibraryFromFirestore(uid);
		}
	}, [uid, loadLibraryFromFirestore]);

	if (uid === "undefined") return <Navigate to='/' />;

	const userNotFound = !isLoading && !userProfile && (!authUser || authUser.uid !== uid);
	if (userNotFound) return <UserNotFound />;

	return (
		<Container maxW='container.lg' py={5}>
			<Flex py={10} px={4} pl={{ base: 4, md: 10 }} w={"full"} mx={"auto"} flexDirection={"column"}>
				{!isLoading && userProfile && <ProfileHeader />}
				{isLoading && <ProfileHeaderSkeleton />}
			</Flex>
			<Flex
				px={{ base: 2, sm: 4 }}
				maxW={"full"}
				mx={"auto"}
				borderTop={"1px solid"}
				borderColor={"whiteAlpha.300"}
				direction={"column"}
			>
				<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{/* Contenido según pestaña activa */}
				{activeTab === "posts" && <ProfilePosts />}

				{activeTab === "library" && (
					<Box py={6}>
						{myLibrary.length === 0 ? (
							<VStack spacing={6} textAlign="center" py={10}>
								<Box fontSize="6xl" color="santuario.accent" opacity={0.3}>
									📚
								</Box>
								<Text fontSize="lg" fontWeight="600" color="santuario.charcoal">
									{userProfile?.uid === authUser?.uid
										? "Tu biblioteca está vacía"
										: `${userProfile?.username} no tiene libros en su biblioteca`}
								</Text>
								<Text fontSize="sm" color="santuario.charcoal" opacity={0.7} maxW="400px">
									{userProfile?.uid === authUser?.uid
										? "Busca y añade libros para comenzar tu viaje de lectura."
										: "Visita más tarde para ver sus lecturas."}
								</Text>
							</VStack>
						) : (
							<>
								<Text fontSize="lg" fontWeight="600" mb={4} color="santuario.charcoal">
									{userProfile?.uid === authUser?.uid
										? "Tu Biblioteca"
										: `Biblioteca de ${userProfile?.username}`}
									<Text as="span" fontSize="sm" color="gray.500" ml={2}>
										({myLibrary.length} libro{myLibrary.length !== 1 ? 's' : ''})
									</Text>
								</Text>
								<Grid
									templateColumns={{
										base: "repeat(1, 1fr)",
										md: "repeat(2, 1fr)",
										lg: "repeat(3, 1fr)",
									}}
									gap={4}
								>
									{myLibrary.map((book) => (
										<ReadingCard key={book.id} book={book} />
									))}
								</Grid>
							</>
						)}
					</Box>
				)}

				{activeTab === "saved" && (
					<Box py={10} textAlign="center">
						<Text fontSize="lg" fontWeight="600" color="santuario.charcoal" mb={2}>
							Posts guardados
						</Text>
						<Text fontSize="sm" color="gray.500">
							Próximamente...
						</Text>
					</Box>
				)}

				{activeTab === "likes" && (
					<Box py={10} textAlign="center">
						<Text fontSize="lg" fontWeight="600" color="santuario.charcoal" mb={2}>
							Posts que te gustan
						</Text>
						<Text fontSize="sm" color="gray.500">
							Próximamente...
						</Text>
					</Box>
				)}
			</Flex>
		</Container>
	);
};

export default ProfilePage;

// skeleton for profile header
const ProfileHeaderSkeleton = () => {
	return (
		<Flex
			gap={{ base: 4, sm: 10 }}
			py={10}
			direction={{ base: "column", sm: "row" }}
			justifyContent={"center"}
			alignItems={"center"}
		>
			<SkeletonCircle size='24' />

			<VStack alignItems={{ base: "center", sm: "flex-start" }} gap={2} mx={"auto"} flex={1}>
				<Skeleton height='12px' width='150px' />
				<Skeleton height='12px' width='100px' />
			</VStack>
		</Flex>
	);
};

const UserNotFound = () => {
	return (
		<Flex flexDir='column' textAlign={"center"} mx={"auto"}>
			<Text fontSize={"2xl"}>User Not Found</Text>
			<Link as={RouterLink} to={"/"} color={"blue.500"} w={"max-content"} mx={"auto"}>
				Go home
			</Link>
		</Flex>
	);
};
