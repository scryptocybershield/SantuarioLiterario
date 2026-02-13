import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validar variables de entorno críticas
const requiredEnvVars = [
	'VITE_FIREBASE_API_KEY',
	'VITE_FIREBASE_AUTH_DOMAIN',
	'VITE_FIREBASE_PROJECT_ID',
	'VITE_FIREBASE_STORAGE_BUCKET',
	'VITE_FIREBASE_MESSAGING_SENDER_ID',
	'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
	if (!import.meta.env[envVar]) {
		console.error(`FATAL: Missing environment variable: ${envVar}`);
	}
}

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app;
let auth;
let db;
let storage;

try {
	console.log("Initializing Firebase with config:", { ...firebaseConfig, apiKey: '***' });
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	db = getFirestore(app);
	storage = getStorage(app);
	console.log("Firebase initialized successfully");
} catch (error) {
	console.error("CRITICAL: Firebase Initialization Failure", error);
	console.error("Firebase config used:", { ...firebaseConfig, apiKey: '***' });
	// Re-throw error in development to make it visible
	if (import.meta.env.DEV) {
		throw new Error(`Firebase initialization failed: ${error.message}`);
	}
}

export { app, auth, db, db as firestore, storage };
