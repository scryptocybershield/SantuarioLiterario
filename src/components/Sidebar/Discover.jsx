import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
  VStack,
  Text,
  Avatar,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";
import { Link as RouterLink } from "react-router-dom";
import useSearchUser from "../../hooks/useSearchUser";
import { useRef, useState } from "react";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/authStore";
import useShowToast from "../../hooks/useShowToast";

const Discover = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchRef = useRef(null);
  const { user, isLoading, getUserProfile, setUser } = useSearchUser();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchRef.current) return;

    const username = searchRef.current.value.trim();

    if (!username) {
      // Si el campo está vacío, buscar todos los usuarios
      await searchAllUsers();
      return;
    }

    // Buscar usuario específico
    await getUserProfile(username);
  };

  const searchAllUsers = async () => {
    setIsSearchingAll(true);
    try {
      // Importar firestore dinámicamente para evitar problemas de importación circular
      const { firestore } = await import("../../firebase/firebase");
      const { collection, getDocs, limit, query } = await import("firebase/firestore");

      // Buscar todos los usuarios (límite de 20 para no sobrecargar)
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, limit(20));

      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Filtrar el usuario actual si está autenticado
        if (!authUser || userData.uid !== authUser.uid) {
          users.push(userData);
        }
      });

      setSearchResults(users);
      setUser(null); // Limpiar resultado de usuario específico
    } catch (error) {
      showToast("Error", "No se pudieron cargar los usuarios", "error");
      console.error("Error searching all users:", error);
    } finally {
      setIsSearchingAll(false);
    }
  };

  const UserResult = ({ user: userData }) => {
    const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(userData.uid);

    const onFollowUser = async () => {
      // Guardar el estado actual antes de la acción
      const wasFollowing = isFollowing;

      // Ejecutar la acción de seguir/dejar de seguir
      await handleFollowUser();

      // Actualizar estado local si es necesario (usando el estado INVERTIDO)
      if (user && user.uid === userData.uid) {
        setUser({
          ...user,
          followers: wasFollowing
            ? user.followers.filter((follower) => follower !== authUser?.uid)
            : [...(user.followers || []), authUser?.uid],
        });
      }
      // Actualizar también en searchResults si está presente
      setSearchResults(prevResults =>
        prevResults.map(u =>
          u.uid === userData.uid
            ? {
                ...u,
                followers: wasFollowing
                  ? u.followers?.filter(follower => follower !== authUser?.uid) || []
                  : [...(u.followers || []), authUser?.uid]
              }
            : u
        )
      );
    };

    // Verificar si el usuario actual está siguiendo a este usuario
    const userIsFollowing = authUser?.following?.includes(userData.uid) || false;
    const displayIsFollowing = isFollowing !== undefined ? isFollowing : userIsFollowing;

    return (
      <Flex justifyContent={"space-between"} alignItems={"center"} w={"full"} p={2} _hover={{ bg: "gray.50" }} borderRadius="md">
        <Flex alignItems={"center"} gap={3}>
          <RouterLink to={`/profile/${userData.uid}`} onClick={onClose}>
            <Avatar src={userData.profilePicURL} size={"md"} />
          </RouterLink>
          <VStack spacing={1} alignItems={"flex-start"}>
            <RouterLink to={`/profile/${userData.uid}`} onClick={onClose}>
              <Text fontSize={14} fontWeight={"bold"} _hover={{ color: "santuario.accent" }}>
                {userData.username}
              </Text>
            </RouterLink>
            <Text fontSize={12} color={"gray.500"}>
              {userData.fullName}
            </Text>
            <Text fontSize={11} color={"gray.400"}>
              {userData.followers?.length || 0} seguidores
            </Text>
          </VStack>
        </Flex>
        {authUser && authUser.uid !== userData.uid && (
          <Button
            size="sm"
            colorScheme={displayIsFollowing ? "gray" : "blue"}
            variant={displayIsFollowing ? "outline" : "solid"}
            onClick={onFollowUser}
            isLoading={isUpdating}
            fontSize={12}
          >
            {displayIsFollowing ? "Siguiendo" : "Seguir"}
          </Button>
        )}
      </Flex>
    );
  };

  return (
    <>
      <Tooltip
        hasArrow
        label={"Descubrir usuarios"}
        placement='right'
        ml={1}
        openDelay={500}
        display={{ base: "block", md: "none" }}
      >
        <Flex
          alignItems={"center"}
          gap={4}
          _hover={{ bg: "santuario.border", color: "santuario.accent" }}
          borderRadius={6}
          p={2}
          w={{ base: 10, md: "full" }}
          justifyContent={{ base: "center", md: "flex-start" }}
          onClick={onOpen}
          cursor="pointer"
          color="santuario.charcoal"
        >
          <BsSearch size={25} />
          <Box display={{ base: "none", md: "block" }} fontWeight="500">Descubrir</Box>
        </Flex>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInLeft' size="md">
        <ModalOverlay />
        <ModalContent bg={"white"} maxW={"500px"}>
          <ModalHeader color="santuario.charcoal">Descubrir usuarios</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSearchUser}>
              <FormControl>
                <FormLabel color="santuario.charcoal">Buscar por nombre de usuario</FormLabel>
                <Input
                  placeholder='Ej: maria_literaria'
                  ref={searchRef}
                  color="santuario.charcoal"
                  borderColor="santuario.border"
                  _focus={{ borderColor: "santuario.accent", boxShadow: "0 0 0 1px var(--chakra-colors-santuario-accent)" }}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Deja el campo vacío para ver sugerencias de usuarios
                </Text>
              </FormControl>

              <Flex w={"full"} justifyContent={"flex-end"} mt={4}>
                <Button
                  type='submit'
                  colorScheme="santuario"
                  isLoading={isLoading || isSearchingAll}
                  size="sm"
                >
                  Buscar
                </Button>
              </Flex>
            </form>

            {/* Resultados de búsqueda */}
            <VStack spacing={3} mt={6} align="stretch" maxH="400px" overflowY="auto">
              {user ? (
                // Resultado de usuario específico
                <UserResult user={user} />
              ) : searchResults.length > 0 ? (
                // Lista de usuarios sugeridos
                <>
                  <Text fontSize="sm" fontWeight="medium" color="santuario.charcoal">
                    Usuarios sugeridos:
                  </Text>
                  {searchResults.map((userData) => (
                    <UserResult key={userData.uid} user={userData} />
                  ))}
                </>
              ) : !isLoading && !isSearchingAll && (
                // Sin resultados
                <Text textAlign="center" color="gray.500" py={4}>
                  {searchRef.current?.value
                    ? "No se encontraron usuarios con ese nombre"
                    : "Busca usuarios por su nombre de usuario o deja el campo vacío para ver sugerencias"}
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Discover;