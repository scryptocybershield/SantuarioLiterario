import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Progress,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronDownIcon, EditIcon, TimeIcon, CheckIcon, SettingsIcon } from "@chakra-ui/icons";
import { BsBook, BsBookmark, BsJournal } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import useBookStore from "../../store/bookStore";
import useAuthStore from "../../store/authStore";

const ReadingCard = ({ book }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    updateReadingStatus,
    updateReadingProgress,
    addPrivateNote,
    removeFromLibrary,
  } = useBookStore();

  const { user } = useAuthStore();
  const userId = user?.uid;

  const {
    id, // firestoreId
    title,
    authors = [],
    thumbnail,
    progress = 0,
    readingStatus,
    currentPage = 0,
    pageCount = 0,
    categories = [],
  } = book;

  const getStatusColor = (status) => {
    switch (status) {
      case 'reading': return 'green.500';
      case 'completed': return 'blue.500';
      case 'paused': return 'orange.500';
      case 'pending': return 'gray.500';
      default: return 'gray.500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reading': return 'Leyendo';
      case 'completed': return 'Completado';
      case 'paused': return 'En pausa';
      case 'pending': return 'Por leer';
      default: return 'Por leer';
    }
  };

  const handleContinueReading = () => {
    if (readingStatus === 'pending') {
      if (!userId) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para realizar esta acción",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      updateReadingStatus(id, 'reading', userId);
      toast({
        title: "¡Comenzando lectura!",
        description: `Has empezado a leer "${title}"`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      navigate(`/read/${id}`);
    }
  };

  const handleAddNote = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const noteContent = prompt("Añade una nota sobre este libro:");
    if (noteContent && noteContent.trim()) {
      addPrivateNote(id, noteContent.trim(), userId, currentPage);
      toast({
        title: "Nota añadida",
        description: "Tu nota se ha guardado en tu diario privado",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProgress = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const newProgress = prompt(`Progreso actual: ${progress}%\nIntroduce el nuevo porcentaje (0-100):`, progress);
    if (newProgress !== null) {
      const parsedProgress = parseInt(newProgress);
      if (!isNaN(parsedProgress) && parsedProgress >= 0 && parsedProgress <= 100) {
        const newCurrentPage = Math.floor((parsedProgress / 100) * pageCount);
        updateReadingProgress(id, parsedProgress, newCurrentPage, userId);
        toast({
          title: "Progreso actualizado",
          description: `Ahora has leído el ${parsedProgress}% de "${title}"`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    updateReadingStatus(id, newStatus, userId);
    toast({
      title: "Estado actualizado",
      description: `"${title}" ahora está marcado como ${getStatusText(newStatus).toLowerCase()}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRemoveBook = async () => {
    console.log("Component: handleRemoveBook triggered for", title, "ID:", id, "userId:", userId);
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${title}" de tu biblioteca?`)) {
      try {
        console.log("Component: Calling removeFromLibrary for", id);
        await removeFromLibrary(id, userId);
        toast({
          title: "Libro eliminado",
          description: `"${title}" ha sido eliminado de tu biblioteca`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Component: Error deleting book:", error);
        toast({
          title: "Error al eliminar",
          description: error.message || "Ocurrió un error inesperado al eliminar el libro",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box
      border="1px solid"
      borderColor="santuario.border"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
        borderColor: "santuario.accent",
      }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative" height="220px" overflow="hidden" m={4} mb={0} borderRadius="md" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 5px 0 15px -3px rgba(0, 0, 0, 0.2)">
        <Image src={thumbnail || "https://via.placeholder.com/300x400?text=Portada+no+disponible"} alt={`Portada de ${title}`} objectFit="cover" width="100%" height="100%" fallbackSrc="https://via.placeholder.com/300x400?text=Portada+no+disponible" />
        <Badge position="absolute" top={2} left={2} bg={getStatusColor(readingStatus)} color="white" fontSize="xs" px={2} py={1} borderRadius="md" fontWeight="bold">
          {getStatusText(readingStatus)}
        </Badge>
        <Box position="absolute" bottom={0} left={0} right={0} bg="blackAlpha.700" px={3} py={2}>
          <Flex justify="space-between" align="center">
            <Text fontSize="xs" color="white" fontWeight="bold">Progreso</Text>
            <Text fontSize="xs" color="white" fontWeight="bold">{progress}%</Text>
          </Flex>
          <Progress value={progress} size="xs" colorScheme={progress === 100 ? "green" : "blue"} borderRadius="full" mt={1} />
        </Box>
      </Box>

      <Box p={4} flex="1" display="flex" flexDirection="column">
        <Heading as="h3" fontSize="lg" fontWeight="700" mb={2} noOfLines={2} color="santuario.charcoal">{title}</Heading>
        <Text fontSize="sm" color="santuario.charcoal" opacity={0.8} mb={3} noOfLines={1}>{authors.join(', ')}</Text>
        <Flex mt="auto" justify="space-between" align="center">
          <Tooltip label="Continuar leyendo" hasArrow>
            <IconButton aria-label="Continuar leyendo" icon={<BsBook />} size="sm" colorScheme="santuario" variant="outline" onClick={handleContinueReading} isDisabled={!userId} />
          </Tooltip>
          <Tooltip label="Añadir nota" hasArrow>
            <IconButton aria-label="Añadir nota" icon={<BsJournal />} size="sm" colorScheme="santuario" variant="outline" onClick={handleAddNote} isDisabled={!userId} />
          </Tooltip>
          <Tooltip label="Actualizar progreso" hasArrow>
            <IconButton aria-label="Actualizar progreso" icon={<EditIcon />} size="sm" colorScheme="santuario" variant="outline" onClick={handleUpdateProgress} isDisabled={!userId} />
          </Tooltip>
          <Menu>
            <MenuButton as={IconButton} aria-label="Opciones" icon={<ChevronDownIcon />} size="sm" variant="outline" colorScheme="santuario" isDisabled={!userId} />
            <MenuList>
              <MenuItem icon={<TimeIcon />} onClick={() => handleStatusChange('reading')}>Marcar como leyendo</MenuItem>
              <MenuItem icon={<CheckIcon />} onClick={() => handleStatusChange('completed')}>Marcar como completado</MenuItem>
              <MenuItem icon={<SettingsIcon />} onClick={() => handleStatusChange('paused')}>Pausar lectura</MenuItem>
              <MenuItem icon={<BsBookmark />} onClick={() => handleStatusChange('pending')}>Mover a por leer</MenuItem>
              <MenuItem color="red.500" onClick={handleRemoveBook}>Eliminar de la biblioteca</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Box>
    </Box>
  );
};

export default ReadingCard;