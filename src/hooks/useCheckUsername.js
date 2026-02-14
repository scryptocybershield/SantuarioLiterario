import { useState, useCallback, useEffect, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";

/**
 * Custom hook para verificar disponibilidad de nombre de usuario usando Cloud Function
 * con debounce de 300ms para optimizar llamadas a la API y mantener buena UX.
 *
 * @returns {Object} - Objeto con estado de disponibilidad, carga, error y función para verificar
 */
const useCheckUsername = () => {
	const [isAvailable, setIsAvailable] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const timeoutRef = useRef(null);

	/**
	 * Limpia el timeout actual para evitar llamadas innecesarias
	 */
	const clearTimeoutRef = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	/**
	 * Función para verificar disponibilidad de nombre de usuario con debounce
	 * @param {string} username - Nombre de usuario a verificar
	 */
	const checkAvailability = useCallback((username) => {
		// Limpiar timeout anterior
		clearTimeoutRef();

		// Validación básica de seguridad: longitud, caracteres permitidos
		if (!username || username.trim().length === 0) {
			setIsAvailable(null);
			setError(null);
			setLoading(false);
			return;
		}

		// Sanitizar input: solo letras, números, guiones bajos y puntos
		const sanitizedUsername = username.trim();
		const usernameRegex = /^[a-zA-Z0-9._]+$/;

		if (!usernameRegex.test(sanitizedUsername)) {
			setError("Nombre de usuario inválido. Solo se permiten letras, números, puntos y guiones bajos.");
			setIsAvailable(false);
			setLoading(false);
			return;
		}

		// Validar longitud
		if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
			setError("El nombre de usuario debe tener entre 3 y 30 caracteres.");
			setIsAvailable(false);
			setLoading(false);
			return;
		}

		// Limpiar estado anterior
		setError(null);
		setLoading(true);

		// Configurar debounce de 300ms para mejor UX (balance entre respuesta y optimización)
		timeoutRef.current = setTimeout(async () => {
			try {
				const checkUsernameAvailability = httpsCallable(functions, "checkUsernameAvailability");
				const result = await checkUsernameAvailability({ username: sanitizedUsername });

				setIsAvailable(result.data.available);
				if (!result.data.available) {
					setError("Este nombre de usuario ya está en uso.");
				}
			} catch (err) {
				console.error("Error validando nombre de usuario:", err);
				setError("No se pudo verificar la disponibilidad. Inténtalo de nuevo.");
				setIsAvailable(null);
			} finally {
				setLoading(false);
			}
		}, 300);
	}, [clearTimeoutRef]);

	/**
	 * Limpiar timeout al desmontar el componente
	 */
	useEffect(() => {
		return () => {
			clearTimeoutRef();
		};
	}, [clearTimeoutRef]);

	return {
		isAvailable,	// boolean | null: true=disponible, false=no disponible, null=sin verificar
		loading,		// boolean: si está en proceso de verificación
		error,			// string | null: mensaje de error si hay problema
		checkAvailability, // función para iniciar verificación (con debounce incorporado)
		clearValidation: () => {
			clearTimeoutRef();
			setIsAvailable(null);
			setError(null);
			setLoading(false);
		}
	};
};

export default useCheckUsername;