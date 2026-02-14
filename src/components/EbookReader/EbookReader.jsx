import { useState, useRef, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import {
    Box,
    Flex,
    Button,
    VStack,
    Text,
    useColorModeValue,
    Input,
    IconButton,
    Tooltip,
    Spinner,
    Heading
} from '@chakra-ui/react';
import { AttachmentIcon, ChevronLeftIcon, ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';

const EbookReader = ({ title, onLocationChange, savedLocation }) => {
    const [localFile, setLocalFile] = useState(null);
    const [location, setLocation] = useState(savedLocation || null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const renditionRef = useRef(null);

    // Cargar archivo local si el usuario lo selecciona
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setLocalFile(event.target.result);
                    setIsLoaded(false);
                    setError(null);
                };
                reader.readAsArrayBuffer(file);
            } else {
                setError('Por favor, selecciona un archivo .epub válido');
            }
        }
    };

    const locationChanged = (epubcifi) => {
        setLocation(epubcifi);
        if (onLocationChange) {
            onLocationChange(epubcifi);
        }
    };

    const handleReset = () => {
        setLocalFile(null);
        setIsLoaded(false);
        setError(null);
    };

    const bg = "#1a1a1a";
    const readerBg = "white";

    return (
        <Box w="100%" h="100%" position="relative" bg={bg} borderRadius="lg" overflow="hidden">
            {!localFile ? (
                <Flex direction="column" align="center" justify="center" h="100%" p={10} textAlign="center">
                    <VStack spacing={6}>
                        <Box p={8} borderRadius="full" bg="whiteAlpha.100" border="2px dashed" borderColor="whiteAlpha.300">
                            <AttachmentIcon fontSize="4xl" color="santuario.accent" />
                        </Box>
                        <VStack spacing={2}>
                            <Heading size="md" color="white">Sube tu libro para empezar</Heading>
                            <Text color="whiteAlpha.700" fontSize="sm">
                                Selecciona tu archivo .epub local para leer "{title}" en el Santuario.
                            </Text>
                        </VStack>

                        <Button
                            leftIcon={<AttachmentIcon />}
                            colorScheme="santuario"
                            onClick={() => fileInputRef.current.click()}
                            size="lg"
                            borderRadius="full"
                            px={8}
                        >
                            Seleccionar archivo ePub
                        </Button>
                        <Input
                            type="file"
                            accept=".epub"
                            ref={fileInputRef}
                            display="none"
                            onChange={handleFileChange}
                        />
                        {error && <Text color="red.400" fontSize="xs">{error}</Text>}
                    </VStack>
                </Flex>
            ) : (
                <Box h="100%" position="relative">
                    <ReactReader
                        url={localFile}
                        location={location}
                        locationChanged={locationChanged}
                        getRendition={(rendition) => {
                            renditionRef.current = rendition;
                            setIsLoaded(true);

                            // Aplicar estilos personalizados al ePub
                            rendition.themes.default({
                                'body': {
                                    'font-family': 'Georgia, serif !important',
                                    'font-size': '18px !important',
                                    'line-height': '1.6 !important',
                                    'color': '#333 !important',
                                    'background-color': 'transparent !important'
                                },
                                'p': {
                                    'margin-bottom': '1em !important'
                                }
                            });
                        }}
                        title={title}
                        swipeable
                    />

                    {/* Botón para cambiar de libro / resetear */}
                    <Box position="absolute" top={4} right={4} zIndex={100}>
                        <Tooltip label="Cambiar archivo" hasArrow>
                            <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                color="blackAlpha.300"
                                _hover={{ color: "red.500", bg: "blackAlpha.100" }}
                                onClick={handleReset}
                                aria-label="Cambiar archivo"
                            />
                        </Tooltip>
                    </Box>

                    {!isLoaded && (
                        <Flex position="absolute" top={0} left={0} right={0} bottom={0} align="center" justify="center" bg="white" zIndex={10}>
                            <Spinner size="xl" color="santuario.accent" />
                        </Flex>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default EbookReader;
