import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { BrowserRouter } from "react-router-dom";

const styles = {
	global: (props) => ({
		body: {
			bg: "#FDFBF7",
			color: "#2C2C2C",
			fontFamily: "'Lora', 'Times New Roman', serif",
			lineHeight: "1.6",
		},
		"h1, h2, h3, h4, h5, h6": {
			fontFamily: "'Playfair Display', 'Times New Roman', serif",
			fontWeight: "700",
			letterSpacing: "-0.02em",
		},
		"a": {
			color: "#8B7355",
			textDecoration: "none",
			transition: "color 0.2s ease",
			_hover: {
				color: "#2C2C2C",
				textDecoration: "underline",
			},
		},
	}),
};

const colors = {
	santuario: {
		paper: "#FDFBF7",
		charcoal: "#2C2C2C",
		accent: "#8B7355",
		border: "#E8E2D8",
	},
};

const fonts = {
	heading: "'Playfair Display', 'Times New Roman', serif",
	body: "'Lora', 'Times New Roman', serif",
};

const config = {
	initialColorMode: "light",
	useSystemColorMode: false,
};

// 3. extend the theme
const theme = extendTheme({ config, styles, colors, fonts });

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</BrowserRouter>
	</React.StrictMode>
);
