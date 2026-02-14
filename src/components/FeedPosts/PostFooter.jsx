import { Box, Button, Flex, Input, InputGroup, InputRightElement, Text, useDisclosure } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { CommentLogo, NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import { timeAgo } from "../../utils/timeAgo";
import CommentsModal from "../Modals/CommentsModal";
import usePosts from "../../hooks/usePosts";

const PostFooter = ({ post, isProfilePage, creatorProfile }) => {
	const [comment, setComment] = useState("");
	const authUser = useAuthStore((state) => state.user);
	const commentRef = useRef(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { likePost, commentOnPost } = usePosts();

	// Estado local para likes
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(post.likes || 0);
	const [isLiking, setIsLiking] = useState(false);
	const [isCommenting, setIsCommenting] = useState(false);

	// Verificar si el usuario ya dio like al post
	useEffect(() => {
		const checkIfLiked = async () => {
			if (!authUser || !post.id) return;

			try {
				const { getDocs, collection, query, where } = await import("firebase/firestore");
				const { db } = await import("../../firebase/firebase");

				const likesCollection = collection(db, "post_likes");
				const likeQuery = query(
					likesCollection,
					where("postId", "==", post.id),
					where("userId", "==", authUser.uid)
				);
				const likeSnapshot = await getDocs(likeQuery);
				setIsLiked(!likeSnapshot.empty);
			} catch (error) {
				console.error("Error verificando like:", error);
			}
		};

		checkIfLiked();
	}, [authUser, post.id]);

	const handleLikePost = async () => {
		if (!authUser || isLiking) return;

		setIsLiking(true);
		try {
			const result = await likePost(post.id);
			setIsLiked(result.liked);
			setLikesCount(prev => result.liked ? prev + 1 : Math.max(0, prev - 1));
		} catch (error) {
			console.error("Error dando like:", error);
		} finally {
			setIsLiking(false);
		}
	};

	const handleSubmitComment = async () => {
		if (!authUser || !comment.trim() || isCommenting) return;

		setIsCommenting(true);
		try {
			await commentOnPost(post.id, comment);
			setComment("");
			// Enfocar de nuevo el input para seguir comentando
			if (commentRef.current) {
				commentRef.current.focus();
			}
		} catch (error) {
			console.error("Error comentando:", error);
			// Mostrar toast de error específico para no followers
			if (error.message.includes("Solo los followers pueden comentar")) {
				// Podríamos mostrar un toast aquí si quisiéramos
				console.log("Usuario no es follower, no puede comentar");
			}
		} finally {
			setIsCommenting(false);
		}
	};

	// Verificar si el usuario actual puede comentar (es follower o es el autor)
	const canComment = authUser && (authUser.uid === post.userId ||
		(authUser.following && authUser.following.includes(post.userId)));

	return (
		<Box mb={10} marginTop={"auto"}>
			<Flex alignItems={"center"} gap={4} w={"full"} pt={0} mb={2} mt={4}>
				<Box onClick={handleLikePost} cursor={"pointer"} fontSize={18}>
					{!isLiked ? <NotificationsLogo /> : <UnlikeLogo />}
				</Box>

				<Box cursor={"pointer"} fontSize={18} onClick={() => commentRef.current.focus()}>
					<CommentLogo />
				</Box>
			</Flex>
			<Text fontWeight={600} fontSize={"sm"}>
				{likesCount} {likesCount === 1 ? 'like' : 'likes'}
			</Text>

			{isProfilePage && (
				<Text fontSize='12' color={"gray"}>
					Posted {timeAgo(post.createdAt)}
				</Text>
			)}

			{!isProfilePage && (
				<>
					<Text fontSize='sm' fontWeight={700}>
						{creatorProfile?.username}{" "}
						<Text as='span' fontWeight={400}>
							{post.caption}
						</Text>
					</Text>
					{post.comments > 0 && (
						<Text fontSize='sm' color={"gray"} cursor={"pointer"} onClick={onOpen}>
							View all {post.comments} comments
						</Text>
					)}
					{/* COMMENTS MODAL ONLY IN THE HOME PAGE */}
					{isOpen ? <CommentsModal isOpen={isOpen} onClose={onClose} post={post} /> : null}
				</>
			)}

			{authUser ? (
				canComment ? (
					<Flex alignItems={"center"} gap={2} justifyContent={"space-between"} w={"full"}>
						<InputGroup>
							<Input
								variant={"flushed"}
								placeholder={"Add a comment..."}
								fontSize={14}
								onChange={(e) => setComment(e.target.value)}
								value={comment}
								ref={commentRef}
							/>
							<InputRightElement>
								<Button
									fontSize={14}
									color={"blue.500"}
									fontWeight={600}
									cursor={"pointer"}
									_hover={{ color: "white" }}
									bg={"transparent"}
									onClick={handleSubmitComment}
									isLoading={isCommenting}
									isDisabled={!comment.trim()}
								>
									Post
								</Button>
							</InputRightElement>
						</InputGroup>
					</Flex>
				) : (
					<Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
						💡 Follow {creatorProfile?.username || "this user"} to comment on their posts
					</Text>
				)
			) : (
				<Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
					🔒 Log in to comment on posts
				</Text>
			)}
		</Box>
	);
};

export default PostFooter;
