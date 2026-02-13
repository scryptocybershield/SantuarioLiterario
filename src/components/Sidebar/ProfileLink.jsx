import { Avatar, Box, Flex, Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProfileLink = () => {
	const authUser = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	const handleProfileClick = () => {
		if (authUser?.uid) {
			navigate(`/profile/${authUser.uid}`);
		} else {
			navigate("/auth");
		}
	};

	return (
		<Tooltip
			hasArrow
			label={"Perfil"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
		>
			<Flex
				display={"flex"}
				cursor={"pointer"}
				onClick={handleProfileClick}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "santuario.border", color: "santuario.accent" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
				color="santuario.charcoal"
			>
				<Avatar size={"sm"} src={authUser?.profilePicURL || ""} />
				<Box display={{ base: "none", md: "block" }}>Perfil</Box>
			</Flex>
		</Tooltip>
	);
};

export default ProfileLink;
