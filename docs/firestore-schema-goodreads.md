# Esquema Firestore para Réplica de Goodreads

## Colecciones Principales

### 1. `books` (Libros - Cache de Google Books API)
```javascript
{
  id: string,                    // ID de Google Books (ej: "OL1234567M")
  title: string,                 // Título del libro
  subtitle: string,              // Subtítulo (opcional)
  authors: string[],             // Array de autores
  publisher: string,             // Editorial
  publishedDate: string,         // Fecha de publicación (YYYY-MM-DD)
  description: string,           // Descripción/sinopsis
  pageCount: number,             // Número de páginas
  categories: string[],          // Géneros/categorías
  thumbnail: string,             // URL thumbnail pequeño
  image: string,                 // URL imagen grande
  isbn: string,                  // ISBN (ISBN_13 preferido)
  language: string,              // Idioma (ej: "es", "en")
  averageRating: number,         // Rating promedio (calculado)
  ratingsCount: number,          // Número total de ratings
  reviewsCount: number,          // Número total de reseñas
  shelvesCount: {                // Conteo por estantería
    wantToRead: number,
    currentlyReading: number,
    read: number
  },
  trendingScore: number,         // Puntuación trending (calculada)
  lastUpdated: timestamp,        // Última actualización
  createdAt: timestamp           // Fecha de creación en cache
}
```

### 2. `reviews` (Reseñas de Usuarios)
```javascript
{
  id: string,                    // ID único de reseña
  bookId: string,                // ID del libro (Google Books)
  userId: string,                // ID del usuario autor
  username: string,              // Nombre de usuario (cache)
  userProfilePic: string,        // Foto de perfil (cache)

  // Contenido de la reseña
  rating: number,                // 1-5 estrellas
  title: string,                 // Título de la reseña
  content: string,               // Contenido/texto de la reseña
  spoilerWarning: boolean,       // Advertencia de spoiler
  tags: string[],                // Etiquetas (ej: ["divertido", "emocionante"])

  // Interacciones sociales
  likes: string[],               // Array de userIDs que dieron like
  likesCount: number,            // Conteo cacheado de likes
  commentsCount: number,         // Conteo cacheado de comentarios

  // Metadatos
  readingStatus: string,         // "read", "currently-reading", "want-to-read"
  progress: number,              // Progreso de lectura (0-100)
  isEdited: boolean,             // Si fue editada
  editedAt: timestamp,           // Fecha de edición

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,

  // Índices para búsqueda
  _search: string[],             // Array de términos para búsqueda
}
```

### 3. `shelves` (Estanterías de Usuarios)
```javascript
{
  id: string,                    // ID único de estantería
  userId: string,                // ID del usuario dueño
  name: string,                  // Nombre de la estantería
  description: string,           // Descripción
  isDefault: boolean,            // Si es estantería por defecto
  isPublic: boolean,             // Si es pública o privada
  color: string,                 // Color para UI (hex)
  icon: string,                  // Ícono (emoji o nombre)

  // Contenido
  bookIds: string[],             // Array de bookIds en esta estantería
  booksCount: number,            // Conteo cacheado

  // Metadatos
  order: number,                 // Orden de visualización
  createdAt: timestamp,
  updatedAt: timestamp
}

// Estanterías por defecto (automáticamente creadas):
// - "want-to-read" (Por leer)
// - "currently-reading" (Leyendo actualmente)
// - "read" (Leídos)
// - "favorites" (Favoritos)
```

### 4. `users` (Perfiles Extendidos)
```javascript
{
  id: string,                    // = auth.uid
  username: string,              // Nombre de usuario único
  email: string,                 // Email (desde auth)
  displayName: string,           // Nombre para mostrar
  bio: string,                   // Biografía
  profilePicURL: string,         // URL foto de perfil
  coverPicURL: string,           // URL foto de portada
  location: string,              // Ubicación
  website: string,               // Sitio web

  // Preferencias de lectura
  favoriteGenres: string[],      // Géneros favoritos
  favoriteAuthors: string[],     // Autores favoritos
  readingGoal: number,           // Meta anual de libros
  readingSpeed: string,          // "slow", "medium", "fast"

  // Estadísticas (actualizadas por Cloud Functions)
  stats: {
    totalBooks: number,          // Total de libros en biblioteca
    booksRead: number,           // Libros leídos
    booksReading: number,        // Leyendo actualmente
    booksToRead: number,         // Por leer
    totalPages: number,          // Páginas totales
    pagesRead: number,           // Páginas leídas
    averageRating: number,       // Rating promedio dado
    reviewsWritten: number,      // Reseñas escritas
    followersCount: number,      // Seguidores
    followingCount: number,      // Siguiendo
    streakDays: number,          // Racha de días leyendo
    lastActive: timestamp        // Última actividad
  },

  // Configuración de privacidad
  privacy: {
    profilePublic: boolean,      // Perfil público
    readingActivityPublic: boolean, // Actividad de lectura pública
    shelvesPublic: boolean,      // Estanterías públicas
    reviewsPublic: boolean,      // Reseñas públicas
    followersPublic: boolean     // Lista de seguidores pública
  },

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

### 5. `activity` (Feed de Actividad)
```javascript
{
  id: string,                    // ID único de actividad
  userId: string,                // ID del usuario que generó la actividad
  username: string,              // Nombre de usuario (cache)
  userProfilePic: string,        // Foto de perfil (cache)

  // Tipo de actividad
  type: string,                  // "review", "shelf_add", "reading_update", "follow", "like"
  action: string,                // Acción específica

  // Referencias
  targetType: string,            // "book", "review", "user", "shelf"
  targetId: string,              // ID del objetivo
  targetData: {                  // Datos cacheados del objetivo
    bookTitle?: string,
    bookAuthors?: string[],
    bookThumbnail?: string,
    reviewExcerpt?: string,
    shelfName?: string
  },

  // Contenido adicional
  content: string,               // Texto adicional (opcional)
  metadata: object,              // Metadatos específicos

  // Visibilidad
  isPublic: boolean,             // Si es visible públicamente

  // Timestamps
  createdAt: timestamp,

  // Índices para queries
  _feedScore: number             // Puntuación para ordenar feed
}
```

### 6. `friendships` (Relaciones de Amistad/Seguimiento)
```javascript
{
  id: string,                    // ID único de relación
  followerId: string,            // ID del seguidor
  followingId: string,           // ID del seguido
  status: string,                // "pending", "accepted", "blocked"

  // Metadatos
  createdAt: timestamp,
  updatedAt: timestamp,

  // Notificaciones
  notificationSent: boolean,     // Si se envió notificación
  notificationRead: boolean      // Si se leyó la notificación
}
```

### 7. `comments` (Comentarios en Reseñas)
```javascript
{
  id: string,                    // ID único de comentario
  reviewId: string,              // ID de la reseña
  userId: string,                // ID del usuario autor
  username: string,              // Nombre de usuario (cache)
  userProfilePic: string,        // Foto de perfil (cache)

  // Contenido
  content: string,               // Texto del comentario
  parentCommentId: string,       // ID del comentario padre (para respuestas)

  // Interacciones
  likes: string[],               // Array de userIDs que dieron like
  likesCount: number,            // Conteo cacheado

  // Metadatos
  isEdited: boolean,
  editedAt: timestamp,

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 8. `notifications` (Notificaciones)
```javascript
{
  id: string,                    // ID único de notificación
  userId: string,                // ID del usuario destinatario
  type: string,                  // "follow", "like", "comment", "mention", "system"
  title: string,                 // Título de la notificación
  message: string,               // Mensaje
  image: string,                 // Imagen (opcional)

  // Referencias
  sourceUserId: string,          // ID del usuario que generó la notificación
  sourceUsername: string,        // Nombre de usuario (cache)
  targetType: string,            // Tipo de objetivo
  targetId: string,              // ID del objetivo

  // Estado
  isRead: boolean,               // Si fue leída
  isArchived: boolean,           // Si fue archivada

  // Timestamps
  createdAt: timestamp,
  readAt: timestamp
}
```

### 9. `reading_sessions` (Sesiones de Lectura)
```javascript
{
  id: string,                    // ID único de sesión
  userId: string,                // ID del usuario
  bookId: string,                // ID del libro
  readingId: string,             // ID del documento en "readings"

  // Progreso
  startPage: number,             // Página inicial
  endPage: number,               // Página final
  pagesRead: number,             // Páginas leídas en esta sesión
  duration: number,              // Duración en minutos

  // Metadatos
  device: string,                // Dispositivo (web, mobile, etc.)
  location: string,              // Ubicación (opcional)
  notes: string,                 // Notas de la sesión

  // Timestamps
  startedAt: timestamp,
  endedAt: timestamp,
  createdAt: timestamp
}
```

## Subcolecciones (para escalabilidad)

### `books/{bookId}/reviews` (Reseñas por libro - Sharding)
```javascript
// Misma estructura que colección principal `reviews`
// Usada para sharding cuando un libro tiene muchas reseñas
```

### `users/{userId}/shelves` (Estanterías por usuario)
```javascript
// Misma estructura que colección principal `shelves`
// Organización lógica
```

### `users/{userId}/activity` (Actividad por usuario)
```javascript
// Misma estructura que colección principal `activity`
// Para queries más eficientes del feed personal
```

## Relaciones y Referencias

1. **Denormalización estratégica**: Cacheamos datos frecuentemente usados (username, profilePic, bookTitle, etc.)
2. **Contadores cacheados**: Mantenemos counts actualizados para evitar queries costosas
3. **Índices compuestos**: Para queries comunes (usuario + timestamp, libro + rating, etc.)
4. **Sharding automático**: Para colecciones que pueden crecer mucho (reviews por libro)

## Migración desde Estructura Actual

La estructura actual `readings` será migrada a:
- `books`: Cache de datos de libros
- `shelves`: Estanterías organizadas
- `reviews`: Reseñas públicas
- `reading_sessions`: Historial detallado de lectura