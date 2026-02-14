import { Box, Flex, Text } from "@chakra-ui/react";
import { BsBookmark, BsGrid3X3, BsSuitHeart, BsBook } from "react-icons/bs";

const ProfileTabs = ({ activeTab = "posts", onTabChange }) => {
	const tabs = [
		{ id: "posts", label: "Posts", icon: <BsGrid3X3 /> },
		{ id: "library", label: "Biblioteca", icon: <BsBook /> },
		{ id: "saved", label: "Saved", icon: <BsBookmark /> },
		{ id: "likes", label: "Likes", icon: <BsSuitHeart /> },
	];

	return (
		<Flex
			w={"full"}
			justifyContent={"center"}
			gap={{ base: 4, sm: 10 }}
			textTransform={"uppercase"}
			fontWeight={"bold"}
		>
			{tabs.map((tab) => (
				<Flex
					key={tab.id}
					borderTop={activeTab === tab.id ? "2px solid" : "none"}
					borderTopColor={activeTab === tab.id ? "santuario.accent" : "transparent"}
					alignItems={"center"}
					p='3'
					gap={1}
					cursor={"pointer"}
					onClick={() => onTabChange && onTabChange(tab.id)}
					color={activeTab === tab.id ? "santuario.accent" : "gray.500"}
					_hover={{
						color: activeTab === tab.id ? "santuario.accent" : "santuario.charcoal",
					}}
					transition="all 0.2s"
				>
					<Box fontSize={20}>
						{tab.icon}
					</Box>
					<Text fontSize={12} display={{ base: "none", sm: "block" }}>
						{tab.label}
					</Text>
				</Flex>
			))}
		</Flex>
	);
};

export default ProfileTabs;
