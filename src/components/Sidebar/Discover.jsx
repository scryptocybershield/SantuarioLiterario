import { Box, Link, Tooltip } from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";
import { Link as RouterLink } from "react-router-dom";

const Discover = () => {
  return (
    <Tooltip
      hasArrow
      label={"Descubrir libros"}
      placement='right'
      ml={1}
      openDelay={500}
      display={{ base: "block", md: "none" }}
    >
      <Link
        display={"flex"}
        to={"/"}
        as={RouterLink}
        alignItems={"center"}
        gap={4}
        _hover={{ bg: "santuario.border", color: "santuario.accent" }}
        borderRadius={6}
        p={2}
        w={{ base: 10, md: "full" }}
        justifyContent={{ base: "center", md: "flex-start" }}
        color="santuario.charcoal"
      >
        <BsSearch size={25} />
        <Box display={{ base: "none", md: "block" }} fontWeight="500">Descubrir</Box>
      </Link>
    </Tooltip>
  );
};

export default Discover;