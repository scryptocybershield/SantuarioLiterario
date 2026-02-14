import { Avatar, AvatarGroup, Button, Flex, Text, VStack, useDisclosure, Badge, HStack, Box } from "@chakra-ui/react";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import useBookStore from "../../store/bookStore";
import EditProfile from "./EditProfile";
import TopRatedBooks from "./TopRatedBooks";
import useFollowUser from "../../hooks/useFollowUser";
import { BsBook, BsClock, BsCheckCircle, BsStar } from "react-icons/bs";
import { useEffect } from "react";

const ProfileHeader = () => {
	const { userProfile } = useUserProfileStore();
	const authUser = useAuthStore((state) => state.user);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(userProfile?.uid);
	const visitingOwnProfileAndAuth = authUser && authUser.uid === userProfile?.uid;
	const visitingAnotherProfileAndAuth = authUser && authUser.uid !== userProfile?.uid;

	// Estadísticas de lectura
	const { myLibrary, loadLibraryFromFirestore, getReadingStats, getRatingStats } = useBookStore();
	const readingStats = getReadingStats();
	const ratingStats = getRatingStats();

	// Cargar biblioteca cuando se visita un perfil
	useEffect(() => {
		if (userProfile?.uid) {
			loadLibraryFromFirestore(userProfile.uid);
		}
	}, [userProfile?.uid, loadLibraryFromFirestore]);

	return (
		<Flex gap={{ base: 4, sm: 10 }} py={10} direction={{ base: "column", sm: "row" }}>
			<AvatarGroup size={{ base: "xl", md: "2xl" }} justifySelf={"center"} alignSelf={"flex-start"} mx={"auto"}>
				<Avatar src={userProfile?.profilePicURL} alt='Profile' />
			</AvatarGroup>

			<VStack alignItems={"start"} gap={2} mx={"auto"} flex={1}>
				<Flex
					gap={4}
					direction={{ base: "column", sm: "row" }}
					justifyContent={{ base: "center", sm: "flex-start" }}
					alignItems={"center"}
					w={"full"}
				>
					<Text fontSize={{ base: "sm", md: "lg" }}>{userProfile?.username}</Text>
					{visitingOwnProfileAndAuth && (
						<Flex gap={4} alignItems={"center"} justifyContent={"center"}>
							<Button
								bg={"white"}
								color={"black"}
								_hover={{ bg: "whiteAlpha.800" }}
								size={{ base: "xs", md: "sm" }}
								onClick={onOpen}
							>
								Edit Profile
							</Button>
						</Flex>
					)}
					{visitingAnotherProfileAndAuth && (
						<Flex gap={4} alignItems={"center"} justifyContent={"center"}>
							<Button
								bg={"blue.500"}
								color={"white"}
								_hover={{ bg: "blue.600" }}
								size={{ base: "xs", md: "sm" }}
								onClick={handleFollowUser}
								isLoading={isUpdating}
							>
								{isFollowing ? "Unfollow" : "Follow"}
							</Button>
						</Flex>
					)}
				</Flex>

				<Flex alignItems={"center"} gap={{ base: 2, sm: 4 }} wrap="wrap">
					<Text fontSize={{ base: "xs", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{userProfile?.posts?.length || 0}
						</Text>
						Posts
					</Text>
					<Text fontSize={{ base: "xs", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{userProfile?.followers?.length || 0}
						</Text>
						Followers
					</Text>
					<Text fontSize={{ base: "xs", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{userProfile?.following?.length || 0}
						</Text>
						Following
					</Text>

					{/* Estadísticas de lectura */}
					{readingStats.totalBooks > 0 && (
						<>
							<Text fontSize={{ base: "xs", md: "sm" }}>
								<Text as='span' fontWeight={"bold"} mr={1}>
									{readingStats.totalBooks}
								</Text>
								Libros
							</Text>
							<Text fontSize={{ base: "xs", md: "sm" }}>
								<Text as='span' fontWeight={"bold"} mr={1}>
									{readingStats.completed}
								</Text>
								Leídos
							</Text>
						</>
					)}
				</Flex>
				<Flex alignItems={"center"} gap={4}>
					<Text fontSize={"sm"} fontWeight={"bold"}>
						{userProfile?.fullName}
					</Text>
				</Flex>
				<Text fontSize={"sm"}>{userProfile?.bio}</Text>

				{/* Estadísticas detalladas de lectura */}
				{readingStats.totalBooks > 0 && (
					<>
						<Box mt={4} p={3} bg="santuario.paper" borderRadius="lg" border="1px solid" borderColor="santuario.border" width="100%">
							<Text fontSize="sm" fontWeight="600" mb={2} color="santuario.charcoal">
								📚 Estadísticas de lectura
							</Text>
							<Flex wrap="wrap" gap={3}>
								<Badge colorScheme="blue" fontSize="xs" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
									<BsBook size={12} />
									{readingStats.totalBooks} libros
								</Badge>
								<Badge colorScheme="green" fontSize="xs" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
									<BsClock size={12} />
									{readingStats.currentlyReading} leyendo
								</Badge>
								<Badge colorScheme="purple" fontSize="xs" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
									<BsCheckCircle size={12} />
									{readingStats.completed} leídos
								</Badge>
								{ratingStats.averageRating > 0 && (
									<Badge colorScheme="yellow" fontSize="xs" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
										<BsStar size={12} />
										⭐ {ratingStats.averageRating}/5
									</Badge>
								)}
							</Flex>
							{readingStats.pagesRead > 0 && (
								<Text fontSize="xs" color="gray.500" mt={2}>
									{readingStats.pagesRead.toLocaleString()} páginas leídas • {readingStats.completionRate}% completado
								</Text>
							)}
						</Box>

						{/* Libros mejor calificados */}
						<TopRatedBooks
							books={myLibrary}
							userId={userProfile?.uid}
							isOwnProfile={visitingOwnProfileAndAuth}
						/>
					</>
				)}
			</VStack>
			{isOpen && <EditProfile isOpen={isOpen} onClose={onClose} />}
		</Flex>
	);
};

export default ProfileHeader;
