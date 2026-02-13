import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import DeepReadingPage from "./pages/DeepReadingPage/DeepReadingPage";
import JournalPage from "./pages/JournalPage/JournalPage";
import ProgressPage from "./pages/ProgressPage/ProgressPage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import useAuthStore from "./store/authStore";

import { Box, Spinner, Center } from "@chakra-ui/react";

function App() {
	const [authUser, loading] = useAuthState(auth);
	const setUser = useAuthStore((state) => state.setUser);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}
		});

		return () => unsubscribe();
	}, [setUser]);

	if (loading) {
		return (
			<Center height="100vh" bg="santuario.paper">
				<Spinner size="xl" color="santuario.accent" />
			</Center>
		);
	}

	return (
		<PageLayout>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/auth' />} />
				<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
				<Route path='/profile/:uid' element={<ProfilePage />} />
				<Route path='/read/:id' element={authUser ? <DeepReadingPage /> : <Navigate to='/auth' />} />
				<Route path='/journal' element={authUser ? <JournalPage /> : <Navigate to='/auth' />} />
				<Route path='/progress' element={authUser ? <ProgressPage /> : <Navigate to='/auth' />} />
			</Routes>
		</PageLayout>
	);
}

export default App;
