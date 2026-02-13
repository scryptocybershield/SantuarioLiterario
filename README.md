# 📚 Santuario Literario

**Tu espacio de introspección y lectura profunda**
Una red social minimalista para lectores, inspirada en Instagram pero transformada en un santuario literario.

![Santuario Literario Preview](https://via.placeholder.com/800x400/2C2C2C/FDFBF7?text=Santuario+Literario+Preview)

## 🎯 ¿Qué es Santuario Literario?

Santuario Literario es una transformación radical de un clon de Instagram en una plataforma minimalista para lectores. Mantiene la esencia de una red social pero redirige toda la atención hacia la introspección literaria, eliminando el ruido visual y funcional de las redes sociales convencionales.

### ✨ Características Principales

#### 📖 **Biblioteca Personal Inteligente**
- **Búsqueda en tiempo real** con Google Books API
- **Metadatos completos**: portadas, autores, descripciones, páginas
- **Seguimiento de progreso**: porcentaje de lectura, notas privadas
- **Organización automática**: por estado (leyendo, terminados, pendientes)

#### 🧘 **Modo Deep Reading**
- **Experiencia inmersiva**: oculta navegación, enfoca en el texto
- **Temporizador Pomodoro**: 25 minutos de lectura, 5 de descanso
- **Sonidos ambientales**: lluvia/bosque para concentración
- **Estadísticas de sesión**: minutos concentrados, sesiones completadas

#### 👥 **Red Social Literaria**
- **Perfiles de lectores**: biblioteca personal, géneros favoritos, estadísticas
- **Seguimiento mutuo**: inspiración literaria sin ruido social
- **Diario privado**: reflexiones personales sobre lecturas
- **Dashboard de progreso**: métricas visuales de tu viaje lector

#### 🎨 **Diseño Minimalista**
- **Paleta literaria**: papel (#FDFBF7) y carbón (#2C2C2C)
- **Tipografía serif**: Playfair Display (títulos) y Lora (cuerpo)
- **Navegación intuitiva**: iconos literarios claros y significativos
- **Responsive design**: experiencia optimizada en móvil y escritorio

## 🛠️ Tecnologías

### Frontend
- **React 18** con Vite para desarrollo ultrarrápido
- **Chakra UI** para componentes accesibles y consistentes
- **Zustand** para gestión de estado global minimalista
- **React Router 6** para navegación cliente

### Backend & Servicios
- **Firebase Firestore** para persistencia en tiempo real
- **Firebase Authentication** con Email/Password y Google OAuth
- **Google Books API** para catálogo literario mundial
- **Firebase Storage** para imágenes de perfil

### Herramientas de Desarrollo
- **ESLint & Prettier** para código consistente
- **React Icons** para iconografía coherente
- **Axios** para peticiones HTTP
- **Lodash debounce** para búsqueda optimizada

## 🚀 Comenzando

### Prerrequisitos
- Node.js 16+ y npm/yarn/pnpm
- Cuenta en [Firebase Console](https://console.firebase.google.com/)
- API Key de [Google Books API](https://developers.google.com/books)

### Instalación Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/scryptocybershield/SantuarioLiterario.git
   cd SantuarioLiterario
   ```

2. **Instala dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configura variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus credenciales:
   ```env
   VITE_GOOGLE_BOOKS_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_API_KEY=tu_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

4. **Configura Firebase Console**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita **Authentication** → **Sign-in method**: Email/Password y Google
   - Crea **Firestore Database** con reglas iniciales:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true; // Temporal para desarrollo
         }
       }
     }
     ```
   - Añade dominios autorizados en **Authentication → Settings → Authorized domains**

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
santuario-literario/
├── public/                    # Assets estáticos
│   └── sounds/               # Sonidos ambientales Pomodoro
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── AuthForm/         # Formularios de autenticación
│   │   ├── BookSearch/       # Búsqueda de libros
│   │   ├── PomodoroTimer/    # Temporizador de lectura
│   │   ├── ReadingFeed/      # Feed de biblioteca personal
│   │   └── Sidebar/          # Navegación literaria
│   ├── hooks/                # Custom hooks
│   ├── Layouts/              # Layouts de página
│   ├── pages/                # Páginas de la aplicación
│   │   ├── AuthPage/         # Autenticación
│   │   ├── DeepReadingPage/  # Modo lectura profunda
│   │   ├── HomePage/         # Biblioteca principal
│   │   ├── JournalPage/      # Diario personal
│   │   ├── ProgressPage/     # Dashboard de progreso
│   │   └── ProfilePage/      # Perfil de usuario
│   ├── services/             # Servicios externos (Google Books API)
│   ├── store/                # Zustand stores
│   ├── firebase/             # Configuración Firebase
│   ├── App.jsx               # Router principal
│   └── main.jsx              # Punto de entrada
├── .env.example              # Variables de entorno ejemplo
├── .gitignore                # Archivos excluidos de git
├── package.json              # Dependencias y scripts
└── vite.config.js           # Configuración Vite
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta ESLint
- `npm run format` - Formatea código con Prettier

## 🌐 Despliegue

### Firebase Hosting (Recomendado)
```bash
# Instala Firebase CLI
npm install -g firebase-tools

# Inicia sesión
firebase login

# Inicializa proyecto
firebase init
# Selecciona: Hosting, Firestore, Authentication

# Despliega
firebase deploy
```

### Otras Opciones
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Configuración manual necesaria

## 🧪 Testing

```bash
# Pruebas unitarias (configuración pendiente)
npm test

# Pruebas de extremo a extremo (configuración pendiente)
npm run test:e2e
```

## 🤝 Contribuir

1. **Haz fork del repositorio**
2. **Crea una rama** (`git checkout -b feature/nueva-funcionalidad`)
3. **Realiza tus cambios** (`git commit -m 'Añade alguna funcionalidad'`)
4. **Push a la rama** (`git push origin feature/nueva-funcionalidad`)
5. **Abre un Pull Request**

### Guía de Estilo
- **Código**: Sigue ESLint/Prettier configurado
- **Commits**: Usa [Conventional Commits](https://www.conventionalcommits.org/)
- **Documentación**: Actualiza README para cambios significativos

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## 🙏 Agradecimientos

- **Instagram Clone Tutorial** por [Burak Orkmez](https://github.com/burakorkmez/instagram-clone) - Base del proyecto
- **Google Books API** - Catálogo literario mundial
- **Firebase** - Infraestructura backend
- **Chakra UI** - Sistema de diseño accesible
- **React Community** - Ecosistema invaluable

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/scryptocybershield/SantuarioLiterario/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/scryptocybershield/SantuarioLiterario/discussions)

---

**Santuario Literario** - Transformando scroll en lectura, likes en reflexiones, followers en comunidad literaria.
