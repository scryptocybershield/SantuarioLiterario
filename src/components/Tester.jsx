import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Text,
    VStack,
    HStack,
    Badge,
    useToast,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Code,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import useAuthStore from '../store/authStore';
import useBookStore from '../store/bookStore';
import { db } from '../firebase/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

const Tester = () => {
    const { user } = useAuthStore();
    const { searchBooks: searchBooksFn } = useBookStore();
    const toast = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [googleBooksStatus, setGoogleBooksStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
    const [googleBooksError, setGoogleBooksError] = useState('');

    const [dbStatus, setDbStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
    const [dbError, setDbError] = useState('');

    // Check Environment Variables
    const envVars = {
        VITE_GOOGLE_BOOKS_API_KEY: import.meta.env.VITE_GOOGLE_BOOKS_API_KEY,
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    };

    const missingEnvVars = Object.entries(envVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    const handleGoogleBooksTest = async () => {
        if (!searchQuery.trim()) {
            toast({
                title: 'Error',
                description: 'Introduce un término de búsqueda',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setGoogleBooksStatus('loading');
        setGoogleBooksError('');

        try {
            await searchBooksFn(searchQuery);

            setTimeout(() => {
                const currentError = useBookStore.getState().searchError;
                if (currentError) {
                    setGoogleBooksStatus('error');
                    setGoogleBooksError(currentError);
                } else {
                    setGoogleBooksStatus('success');
                    toast({
                        title: 'Google Books OK',
                        status: 'success',
                        duration: 2000,
                    });
                }
            }, 100);

        } catch (error) {
            setGoogleBooksStatus('error');
            setGoogleBooksError(error.message || 'Error desconocido');
        }
    };

    const handleFirestoreTest = async () => {
        if (!user) {
            toast({
                title: 'Error de Identidad',
                description: 'Debes estar logueado para probar Firestore',
                status: 'error',
                duration: 3000,
            });
            return;
        };

        setDbStatus('loading');
        setDbError('');

        try {
            const docRef = await addDoc(collection(db, "readings"), {
                title: "TEST_CON_SEGURIDAD",
                userId: user.uid || user.id, // <--- INDISPENSABLE para cumplir la regla
                timestamp: new Date()
            });

            await deleteDoc(doc(db, "readings", docRef.id));

            setDbStatus("success");
            toast({
                title: 'Firestore OK',
                description: 'Escritura y borrado con seguridad completados',
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            console.error('Firestore Test Error:', error);
            setDbStatus("error");
            setDbError(error.message || 'Error de permisos o conexión');
        }
    };

    return (
        <Box
            bg="orange.50"
            p={6}
            borderRadius="xl"
            border="2px dashed"
            borderColor="orange.200"
            mb={8}
            shadow="sm"
        >
            <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                    <Heading size="md" color="orange.700">Panel de Diagnóstico Técnico</Heading>
                    <Badge colorScheme="orange" variant="outline">Herramienta de Desarrollo</Badge>
                </HStack>

                <Divider borderColor="orange.200" />

                {/* Env Vars Check */}
                {missingEnvVars.length > 0 && (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Variables de Entorno Faltantes</AlertTitle>
                            <AlertDescription>
                                <VStack align="start" mt={2} spacing={1}>
                                    {missingEnvVars.map(v => (
                                        <Code key={v} colorScheme="red">{v}</Code>
                                    ))}
                                </VStack>
                            </AlertDescription>
                        </Box>
                    </Alert>
                )}

                <Flex wrap="wrap" gap={6}>
                    {/* Auth Section */}
                    <Box flex="1" minW="250px" bg="white" p={4} borderRadius="md" border="1px" borderColor="gray.100">
                        <Heading size="xs" mb={3} textTransform="uppercase" color="gray.500">Auth Store</Heading>
                        <HStack>
                            <Text fontWeight="bold">Estado:</Text>
                            {user ? (
                                <Badge colorScheme="green"><CheckCircleIcon mr={1} /> Autenticado</Badge>
                            ) : (
                                <Badge colorScheme="red"><WarningIcon mr={1} /> No autenticado</Badge>
                            )}
                        </HStack>
                        {user && (
                            <Text fontSize="xs" mt={2} color="gray.600">
                                UID: <Code fontSize="xs">{user.uid || user.id}</Code>
                            </Text>
                        )}
                    </Box>

                    {/* Google Books Section */}
                    <Box flex="1" minW="250px" bg="white" p={4} borderRadius="md" border="1px" borderColor="gray.100">
                        <Heading size="xs" mb={3} textTransform="uppercase" color="gray.500">Google Books API</Heading>
                        <VStack align="stretch">
                            <HStack>
                                <Input
                                    size="sm"
                                    placeholder="Ej: El Quijote"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={handleGoogleBooksTest}
                                    isLoading={googleBooksStatus === 'loading'}
                                >
                                    Probar
                                </Button>
                            </HStack>
                            {googleBooksStatus === 'success' && (
                                <Badge colorScheme="green" alignSelf="start"><CheckCircleIcon mr={1} /> Datos recibidos</Badge>
                            )}
                            {googleBooksStatus === 'error' && (
                                <Text fontSize="xs" color="red.500">{googleBooksError}</Text>
                            )}
                        </VStack>
                    </Box>

                    {/* Firestore Section */}
                    <Box flex="1" minW="250px" bg="white" p={4} borderRadius="md" border="1px" borderColor="gray.100">
                        <Heading size="xs" mb={3} textTransform="uppercase" color="gray.500">Firestore (readings)</Heading>
                        <VStack align="start">
                            <Button
                                size="sm"
                                colorScheme="teal"
                                onClick={handleFirestoreTest}
                                isLoading={dbStatus === 'loading'}
                            >
                                Probar Escritura
                            </Button>
                            {dbStatus === 'success' && (
                                <Badge colorScheme="green"><CheckCircleIcon mr={1} /> Escritura OK</Badge>
                            )}
                            {dbStatus === 'error' && (
                                <Box>
                                    <Badge colorScheme="red"><WarningIcon mr={1} /> Error</Badge>
                                    <Text fontSize="xs" color="red.500" mt={1}>{dbError}</Text>
                                </Box>
                            )}
                        </VStack>
                    </Box>
                </Flex>
            </VStack>
        </Box>
    );
};

export default Tester;
