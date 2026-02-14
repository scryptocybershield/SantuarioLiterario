import {
	Avatar,
	Button,
	Divider,
	Flex,
	GridItem,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Text,
	VStack,
	useDisclosure,
	Box,
	Badge,
	Icon,
	Textarea,
} from "@chakra-ui/react";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BsChatQuote, BsBook } from "react-icons/bs";
import Comment from "../Comment/Comment";
import PostFooter from "../FeedPosts/PostFooter";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import useShowToast from "../../hooks/useShowToast";
import { useState } from "react";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "../../firebase/firebase";
import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";
import usePostStore from "../../store/postStore";
import Caption from "../Comment/Caption";
import usePosts from "../../hooks/usePosts";

const ProfilePost = ({ post }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedText, setEditedText] = useState(post.text || post.caption || "");
	const deletePost = usePostStore((state) => state.deletePost);
	const decrementPostsCount = useUserProfileStore((state) => state.deletePost);
	const { updatePost } = usePosts();

	// Determinar el tipo de post
	const isQuotePost = post.type === "quote_post" || post.contentType === "quote";
	const isImagePost = post.imageURL && !isQuotePost;

	const handleDeletePost = async () => {
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		if (isDeleting) return;

		try {
			// Solo eliminar imagen si es un post de imagen
			if (post.imageURL) {
				const imageRef = ref(storage, `posts/${post.id}`);
				await deleteObject(imageRef);
			}

			// Eliminar el documento del post
			await deleteDoc(doc(firestore, "posts", post.id));

			// Actualizar el array de posts del usuario si existe
			if (authUser?.uid) {
				const userRef = doc(firestore, "users", authUser.uid);
				await updateDoc(userRef, {
					posts: arrayRemove(post.id),
				});
			}

			deletePost(post.id);
			decrementPostsCount(post.id);
			showToast("Success", "Post deleted successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleEditPost = async () => {
		if (!editedText.trim()) {
			showToast("Error", "El texto no puede estar vacío", "error");
			return;
		}

		try {
			// Determinar qué campo actualizar según el tipo de post
			const updates = isQuotePost
				? { text: editedText.trim() }
				: { caption: editedText.trim() };

			await updatePost(post.id, updates);
			showToast("Éxito", "Post actualizado correctamente", "success");
			setIsEditing(false);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	const handleCancelEdit = () => {
		setEditedText(post.text || post.caption || "");
		setIsEditing(false);
	};

	return (
		<>
			{isImagePost ? (
				// Renderizado para posts de imagen
				<GridItem
					cursor={"pointer"}
					borderRadius={4}
					overflow={"hidden"}
					border={"1px solid"}
					borderColor={"whiteAlpha.300"}
					position={"relative"}
					aspectRatio={1 / 1}
					onClick={onOpen}
				>
					<Flex
						opacity={0}
						_hover={{ opacity: 1 }}
						position={"absolute"}
						top={0}
						left={0}
						right={0}
						bottom={0}
						bg={"blackAlpha.700"}
						transition={"all 0.3s ease"}
						zIndex={1}
						justifyContent={"center"}
					>
						<Flex alignItems={"center"} justifyContent={"center"} gap={50}>
							<Flex>
								<AiFillHeart size={20} />
								<Text fontWeight={"bold"} ml={2}>
									{post.likes?.length || post.likes || 0}
								</Text>
							</Flex>

							<Flex>
								<FaComment size={20} />
								<Text fontWeight={"bold"} ml={2}>
									{post.comments?.length || post.comments || 0}
								</Text>
							</Flex>
						</Flex>
					</Flex>

					<Image src={post.imageURL} alt='profile post' w={"100%"} h={"100%"} objectFit={"cover"} />
				</GridItem>
			) : isQuotePost ? (
				// Renderizado para posts de citas
				<GridItem
					cursor={"pointer"}
					borderRadius={8}
					overflow={"hidden"}
					border={"1px solid"}
					borderColor={"santuario.border"}
					position={"relative"}
					aspectRatio={1 / 1}
					onClick={onOpen}
					bg={"santuario.paper"}
					p={4}
					display={"flex"}
					flexDirection={"column"}
					justifyContent={"space-between"}
					_hover={{
						borderColor: "santuario.accent",
						transform: "translateY(-2px)",
						boxShadow: "md",
					}}
					transition="all 0.2s ease"
				>
					<Flex
						opacity={0}
						_hover={{ opacity: 1 }}
						position={"absolute"}
						top={0}
						left={0}
						right={0}
						bottom={0}
						bg={"blackAlpha.700"}
						transition={"all 0.3s ease"}
						zIndex={1}
						justifyContent={"center"}
						alignItems={"center"}
					>
						<Flex alignItems={"center"} justifyContent={"center"} gap={50}>
							<Flex>
								<AiFillHeart size={20} color="white" />
								<Text fontWeight={"bold"} ml={2} color="white">
									{post.likes || 0}
								</Text>
							</Flex>

							<Flex>
								<FaComment size={20} color="white" />
								<Text fontWeight={"bold"} ml={2} color="white">
									{post.comments || 0}
								</Text>
							</Flex>
						</Flex>
					</Flex>

					{/* Contenido de la cita */}
					<Box flex={1} overflow="hidden">
						<Flex align="center" mb={2}>
							<Icon as={BsChatQuote} color="santuario.accent" mr={2} />
							<Badge colorScheme="santuario" variant="subtle" fontSize="xs">
								Cita
							</Badge>
						</Flex>
						<Text
							fontSize="sm"
							color="santuario.charcoal"
							fontStyle="italic"
							noOfLines={5}
							lineHeight="tall"
						>
							"{post.text || post.caption || ''}"
						</Text>
					</Box>

					{/* Información del libro */}
					{post.bookTitle && (
						<Box mt={3} pt={3} borderTop="1px solid" borderColor="santuario.border">
							<Flex align="center">
								<Icon as={BsBook} color="santuario.charcoal" opacity={0.7} mr={2} boxSize="12px" />
								<Text fontSize="xs" color="santuario.charcoal" opacity={0.8} noOfLines={1}>
									{post.bookTitle}
								</Text>
							</Flex>
						</Box>
					)}
				</GridItem>
			) : (
				// Renderizado por defecto para otros tipos de posts
				<GridItem
					cursor={"pointer"}
					borderRadius={4}
					overflow={"hidden"}
					border={"1px solid"}
					borderColor={"whiteAlpha.300"}
					position={"relative"}
					aspectRatio={1 / 1}
					onClick={onOpen}
					bg="gray.100"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<Text fontSize="sm" color="gray.500">
						Post
					</Text>
				</GridItem>
			)}

			{/* Modal para ver el post completo */}
			<Modal isOpen={isOpen} onClose={onClose} isCentered={true} size={{ base: "3xl", md: "5xl" }}>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody bg={isQuotePost ? "santuario.cream" : "black"} pb={5}>
						<Flex
							gap='4'
							w={{ base: "90%", sm: "70%", md: "full" }}
							mx={"auto"}
							maxH={"90vh"}
							minH={"50vh"}
						>
							{isImagePost ? (
								<Flex
									borderRadius={4}
									overflow={"hidden"}
									border={"1px solid"}
									borderColor={"whiteAlpha.300"}
									flex={1.5}
									justifyContent={"center"}
									alignItems={"center"}
								>
									<Image src={post.imageURL} alt='profile post' />
								</Flex>
							) : isQuotePost ? (
								<Flex
									borderRadius={4}
									overflow={"hidden"}
									border={"1px solid"}
									borderColor={"santuario.border"}
									flex={1.5}
									justifyContent={"center"}
									alignItems={"center"}
									bg="white"
									p={8}
									flexDirection="column"
								>
									<Box textAlign="center" mb={6}>
										<Icon as={BsChatQuote} color="santuario.accent" fontSize="4xl" mb={3} />
										<Badge colorScheme="santuario" variant="subtle" fontSize="sm" mb={2}>
											Cita compartida
										</Badge>
										{post.bookTitle && (
											<Text fontSize="sm" color="santuario.charcoal" opacity={0.8} mb={1}>
												Del libro: <strong>"{post.bookTitle}"</strong>
											</Text>
										)}
									</Box>
									<Box
										p={6}
										bg="santuario.paper"
										borderRadius="md"
										border="1px solid"
										borderColor="santuario.border"
										maxW="600px"
									>
										<Text
											fontSize="lg"
											color="santuario.charcoal"
											fontStyle="italic"
											lineHeight="tall"
											textAlign="center"
										>
											"{post.text || post.caption || ''}"
										</Text>
									</Box>
								</Flex>
							) : (
								<Flex
									borderRadius={4}
									overflow={"hidden"}
									border={"1px solid"}
									borderColor={"whiteAlpha.300"}
									flex={1.5}
									justifyContent={"center"}
									alignItems={"center"}
									bg="gray.100"
								>
									<Text fontSize="md" color="gray.500">
										Contenido del post
									</Text>
								</Flex>
							)}

							<Flex flex={1} flexDir={"column"} px={10} display={{ base: "none", md: "flex" }}>
								<Flex alignItems={"center"} justifyContent={"space-between"}>
									<Flex alignItems={"center"} gap={4}>
										<Avatar src={userProfile.profilePicURL} size={"sm"} name={userProfile.username} />
										<Text fontWeight={"bold"} fontSize={12} color={isQuotePost ? "santuario.charcoal" : "white"}>
											{userProfile.username}
										</Text>
									</Flex>

									{authUser?.uid === userProfile.uid && (
										<Flex gap={2}>
											{!isEditing && (
												<Button
													size={"sm"}
													bg={"transparent"}
													_hover={{ bg: "whiteAlpha.300", color: "blue.500" }}
													borderRadius={4}
													p={1}
													onClick={() => setIsEditing(true)}
													isDisabled={isDeleting}
												>
													<Text fontSize="xs">Editar</Text>
												</Button>
											)}
											<Button
												size={"sm"}
												bg={"transparent"}
												_hover={{ bg: "whiteAlpha.300", color: "red.600" }}
												borderRadius={4}
												p={1}
												onClick={handleDeletePost}
												isLoading={isDeleting}
												isDisabled={isEditing}
											>
												<MdDelete size={20} cursor='pointer' />
											</Button>
										</Flex>
									)}
								</Flex>
								<Divider my={4} bg={isQuotePost ? "santuario.border" : "gray.500"} />

								<VStack w='full' alignItems={"start"} maxH={"350px"} overflowY={"auto"}>
									{/* CAPTION o TEXTO - Modo edición o visualización */}
									{isEditing ? (
										<Box w="full" p={3} bg={isQuotePost ? "santuario.paper" : "gray.800"} borderRadius="md">
											<Textarea
												value={editedText}
												onChange={(e) => setEditedText(e.target.value)}
												placeholder={isQuotePost ? "Escribe tu cita aquí..." : "Escribe tu caption aquí..."}
												size="sm"
												minHeight="100px"
												resize="vertical"
												bg="white"
												color="black"
												_focus={{ borderColor: "blue.500" }}
											/>
											<Flex justify="space-between" mt={3}>
												<Button
													size="xs"
													colorScheme="gray"
													onClick={handleCancelEdit}
													variant="outline"
												>
													Cancelar
												</Button>
												<Button
													size="xs"
													colorScheme="blue"
													onClick={handleEditPost}
													isDisabled={!editedText.trim() || editedText === (post.text || post.caption || "")}
												>
													Guardar
												</Button>
											</Flex>
										</Box>
									) : (
										(post.caption || post.text) && (
											<Box w="full" p={3} bg={isQuotePost ? "santuario.paper" : "transparent"} borderRadius="md">
												<Text fontSize="sm" color={isQuotePost ? "santuario.charcoal" : "white"}>
													{post.caption || post.text}
												</Text>
											</Box>
										)
									)}
									{/* COMMENTS */}
									{post.comments && post.comments.map((comment) => (
										<Comment key={comment.id} comment={comment} />
									))}
								</VStack>
								<Divider my={4} bg={isQuotePost ? "santuario.border" : "gray.800"} />

								<PostFooter isProfilePage={true} post={post} />
							</Flex>
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ProfilePost;
