import { Box, Link, Tooltip } from "@chakra-ui/react";
import { BsJournal } from "react-icons/bs";
import { Link as RouterLink } from "react-router-dom";

const Journal = () => {
  return (
    <Tooltip
      hasArrow
      label={"Mi diario de lectura"}
      placement='right'
      ml={1}
      openDelay={500}
      display={{ base: "block", md: "none" }}
    >
      <Link
        display={"flex"}
        to={"/journal"}
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
        <BsJournal size={25} />
        <Box display={{ base: "none", md: "block" }} fontWeight="500">Mi Diario</Box>
      </Link>
    </Tooltip>
  );
};

export default Journal;