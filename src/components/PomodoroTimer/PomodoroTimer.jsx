import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Progress,
  useToast,
  Tooltip,
  Select,
} from "@chakra-ui/react";
import { BsPlay, BsPause, BsRepeat, BsVolumeUp, BsVolumeMute } from "react-icons/bs";
import { useEffect, useState, useRef } from "react";

const PomodoroTimer = ({ onSessionComplete, onProgressUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos en segundos
  const [sessionType, setSessionType] = useState('work'); // 'work' o 'break'
  const [workDuration, setWorkDuration] = useState(25); // minutos
  const [breakDuration, setBreakDuration] = useState(5); // minutos
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const toast = useToast();

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/rain.mp3");
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Efecto del temporizador
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Tiempo terminado
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);

    // Reproducir sonido si está habilitado
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    // Notificar sesión completada
    if (onSessionComplete) {
      onSessionComplete();
    }

    // Mostrar notificación
    const message = sessionType === 'work'
      ? `¡Tiempo de trabajo completado! Tómate un descanso de ${breakDuration} minutos.`
      : `¡Descanso completado! Listo para otra sesión de ${workDuration} minutos.`;

    toast({
      title: sessionType === 'work' ? "¡Sesión completada!" : "¡Descanso terminado!",
      description: message,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Cambiar tipo de sesión y reiniciar temporizador
    if (sessionType === 'work') {
      setCompletedSessions(prev => prev + 1);
      if (onProgressUpdate) {
        onProgressUpdate(Math.min(100, completedSessions * 25)); // Ejemplo: 25% por sesión
      }
      setSessionType('break');
      setTimeLeft(breakDuration * 60);
    } else {
      setSessionType('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionType('work');
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalSeconds = sessionType === 'work' ? workDuration * 60 : breakDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const handleWorkDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setWorkDuration(newDuration);
    if (sessionType === 'work' && !isActive) {
      setTimeLeft(newDuration * 60);
    }
  };

  const handleBreakDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setBreakDuration(newDuration);
    if (sessionType === 'break' && !isActive) {
      setTimeLeft(newDuration * 60);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const getSessionColor = () => {
    return sessionType === 'work' ? 'santuario.accent' : 'green.500';
  };

  const getSessionLabel = () => {
    return sessionType === 'work' ? 'Tiempo de lectura' : 'Descanso';
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={6}
      boxShadow="xl"
      border="1px solid"
      borderColor="santuario.border"
      maxW="400px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        {/* Encabezado */}
        <Box textAlign="center">
          <Heading
            as="h3"
            fontSize="2xl"
            fontFamily="heading"
            fontWeight="700"
            color="santuario.charcoal"
            mb={2}
          >
            Temporizador Pomodoro
          </Heading>
          <Text fontSize="sm" color="santuario.charcoal" opacity={0.7}>
            Enfoca tu lectura, descansa tu mente
          </Text>
        </Box>

        {/* Indicador de sesión */}
        <Box
          bg={getSessionColor()}
          color="white"
          py={3}
          px={4}
          borderRadius="xl"
          textAlign="center"
        >
          <Text fontSize="lg" fontWeight="bold">
            {getSessionLabel()}
          </Text>
          <Text fontSize="xs" opacity={0.9}>
            {sessionType === 'work'
              ? `Sesión ${completedSessions + 1} de lectura`
              : 'Descanso breve'}
          </Text>
        </Box>

        {/* Temporizador principal */}
        <Box textAlign="center">
          <Text
            fontSize="6xl"
            fontWeight="bold"
            fontFamily="mono"
            color="santuario.charcoal"
            letterSpacing="wide"
            lineHeight="1"
            mb={4}
          >
            {formatTime(timeLeft)}
          </Text>

          <Progress
            value={getProgressPercentage()}
            size="lg"
            colorScheme={sessionType === 'work' ? 'santuario' : 'green'}
            borderRadius="full"
            bg="santuario.border"
            mb={4}
          />

          <Text fontSize="sm" color="santuario.charcoal" opacity={0.7}>
            {sessionType === 'work'
              ? `${workDuration} minutos de lectura concentrada`
              : `${breakDuration} minutos de descanso`}
          </Text>
        </Box>

        {/* Controles */}
        <HStack justify="center" spacing={4}>
          <Tooltip label={isActive ? "Pausar" : "Iniciar"} hasArrow>
            <IconButton
              aria-label={isActive ? "Pausar" : "Iniciar"}
              icon={isActive ? <BsPause /> : <BsPlay />}
              size="lg"
              colorScheme={sessionType === 'work' ? 'santuario' : 'green'}
              variant="solid"
              onClick={toggleTimer}
              borderRadius="full"
              w="60px"
              h="60px"
              fontSize="xl"
            />
          </Tooltip>

          <Tooltip label="Reiniciar" hasArrow>
            <IconButton
              aria-label="Reiniciar"
              icon={<BsRepeat />}
              size="lg"
              colorScheme="gray"
              variant="outline"
              onClick={resetTimer}
              borderRadius="full"
              w="60px"
              h="60px"
              fontSize="xl"
            />
          </Tooltip>

          <Tooltip label={soundEnabled ? "Silenciar sonido" : "Activar sonido"} hasArrow>
            <IconButton
              aria-label="Toggle sound"
              icon={soundEnabled ? <BsVolumeUp /> : <BsVolumeMute />}
              size="lg"
              colorScheme="gray"
              variant="outline"
              onClick={toggleSound}
              borderRadius="full"
              w="60px"
              h="60px"
              fontSize="xl"
            />
          </Tooltip>
        </HStack>

        {/* Configuración de duraciones */}
        <Box
          bg="santuario.paper"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="santuario.border"
        >
          <Text fontSize="sm" fontWeight="600" color="santuario.charcoal" mb={3}>
            Configuración
          </Text>

          <Flex direction={{ base: "column", sm: "row" }} gap={4}>
            <Box flex="1">
              <Text fontSize="xs" color="santuario.charcoal" opacity={0.7} mb={1}>
                Duración lectura
              </Text>
              <Select
                size="sm"
                value={workDuration}
                onChange={handleWorkDurationChange}
                isDisabled={isActive}
                borderColor="santuario.border"
                _focus={{ borderColor: "santuario.accent" }}
              >
                <option value={15}>15 minutos</option>
                <option value={25}>25 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </Select>
            </Box>

            <Box flex="1">
              <Text fontSize="xs" color="santuario.charcoal" opacity={0.7} mb={1}>
                Duración descanso
              </Text>
              <Select
                size="sm"
                value={breakDuration}
                onChange={handleBreakDurationChange}
                isDisabled={isActive}
                borderColor="santuario.border"
                _focus={{ borderColor: "santuario.accent" }}
              >
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
              </Select>
            </Box>
          </Flex>
        </Box>

        {/* Estadísticas */}
        <Box
          bg="santuario.paper"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="santuario.border"
          textAlign="center"
        >
          <Text fontSize="sm" fontWeight="600" color="santuario.charcoal" mb={2}>
            Tu progreso hoy
          </Text>
          <Flex justify="space-around">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="santuario.accent">
                {completedSessions}
              </Text>
              <Text fontSize="xs" color="santuario.charcoal" opacity={0.7}>
                Sesiones
              </Text>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="santuario.accent">
                {completedSessions * workDuration}
              </Text>
              <Text fontSize="xs" color="santuario.charcoal" opacity={0.7}>
                Minutos
              </Text>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="santuario.accent">
                {Math.floor((completedSessions * workDuration) / 60)}
              </Text>
              <Text fontSize="xs" color="santuario.charcoal" opacity={0.7}>
                Horas
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Instrucciones */}
        <Box>
          <Text fontSize="xs" color="santuario.charcoal" opacity={0.7} textAlign="center">
            <strong>Pomodoro:</strong> 25min lectura → 5min descanso
          </Text>
          <Text fontSize="xs" color="santuario.charcoal" opacity={0.7} textAlign="center" mt={1}>
            Cada 4 sesiones, toma un descanso largo de 15-30 minutos
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default PomodoroTimer;