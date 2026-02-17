# Plan de Cloud Functions para Goodreads

## Funciones Esenciales

### 1. **Funciones de Mantenimiento de Datos**

#### `updateBookStats` - Actualiza estadísticas de libros
**Trigger:** `onWrite` en `/reviews/{reviewId}`
```javascript
// Cuando se crea/actualiza/elimina una reseña:
// 1. Recalcula averageRating del libro
// 2. Actualiza ratingsCount
// 3. Actualiza reviewsCount
// 4. Actualiza shelvesCount basado en readingStatus
// 5. Actualiza trendingScore
```

#### `updateUserStats` - Actualiza estadísticas de usuario
**Trigger:** `onWrite` en múltiples colecciones
```javascript
// Triggers:
// - /reviews/{reviewId} (reviewsWritten, averageRating)
// - /shelves/{shelfId} (totalBooks, booksRead, etc.)
// - /reading_sessions/{sessionId} (pagesRead, streakDays)
// - /friendships/{friendshipId} (followersCount, followingCount)

// Actualiza:
// - Conteos de libros por estado
// - Páginas leídas
// - Rating promedio dado
// - Seguidores/siguiendo
// - Racha de días leyendo
```

#### `syncBookCache` - Sincroniza cache de libros con Google Books API
**Trigger:** `onCreate` en `/reviews/{reviewId}` y `/shelves/{shelfId}`
```javascript
// Cuando un libro es referenciado por primera vez:
// 1. Verifica si existe en /books/{bookId}
// 2. Si no existe, llama a Google Books API
// 3. Guarda datos en cache
// 4. Actualiza campos adicionales (categorías normalizadas, etc.)
```

### 2. **Funciones de Feed y Actividad**

#### `generateActivity` - Genera entradas en el feed de actividad
**Trigger:** `onWrite` en múltiples colecciones
```javascript
// Genera actividad para:
// - Nueva reseña → "review"
// - Libro agregado a estantería → "shelf_add"
// - Progreso de lectura actualizado → "reading_update"
// - Nuevo seguidor → "follow"
// - Like a reseña → "like"

// Características:
// - Respeta configuración de privacidad del usuario
// - Calcula _feedScore para ordenamiento
// - Crea copias denormalizadas en /users/{userId}/activity
```

#### `updateFeedScores` - Actualiza scores del feed periódicamente
**Schedule:** `every 1 hours`
```javascript
// Recalcula _feedScore para actividades antiguas:
// - Reduce score con el tiempo (decaimiento)
// - Aumenta score basado en interacciones (likes, comentarios)
// - Aplica factores de trending
```

### 3. **Funciones de Recomendaciones**

#### `calculateTrendingBooks` - Calcula libros trending
**Schedule:** `every 6 hours`
```javascript
// Calcula trendingScore basado en:
// - Nuevas reseñas en las últimas 24h
// - Likes y comentarios recientes
// - Libros agregados a estanterías
// - Actividad social general
// - Factor de decaimiento temporal
```

#### `generatePersonalizedRecommendations` - Recomendaciones personalizadas
**Trigger:** `onWrite` en `/users/{userId}` y `/reviews/{reviewId}`
```javascript
// Para cada usuario:
// 1. Analiza géneros favoritos (basado en reseñas y estanterías)
// 2. Encuentra usuarios similares (colaborative filtering)
// 3. Genera lista de libros recomendados
// 4. Guarda en /users/{userId}/recommendations
// 5. Actualiza cada 24h o cuando hay nueva actividad
```

### 4. **Funciones de Notificaciones**

#### `sendNotifications` - Envía notificaciones en tiempo real
**Trigger:** `onCreate` en múltiples colecciones
```javascript
// Tipos de notificaciones:
// - Nuevo seguidor → "follow"
// - Like a reseña → "like"
// - Comentario en reseña → "comment"
// - Mención en comentario → "mention"
// - Logros/insignias → "achievement"

// Implementación:
// 1. Crea documento en /notifications
// 2. Envía push notification (FCM)
// 3. Envía email para notificaciones importantes
```

#### `cleanupOldNotifications` - Limpia notificaciones antiguas
**Schedule:** `every 24 hours`
```javascript
// Elimina notificaciones:
// - Leídas y con más de 30 días
// - No leídas con más de 90 días
// - Archivadas con más de 7 días
```

### 5. **Funciones de Validación y Seguridad**

#### `validateUsername` - Valida y reserva username único
**Trigger:** `onCreate` en `/users/{userId}`
```javascript
// 1. Verifica formato válido (solo letras, números, guiones, puntos)
// 2. Verifica que no esté tomado en /usernames
// 3. Crea entrada en /usernames/{username}
// 4. Si falla, genera sugerencias alternativas
```

#### `cleanupUserData` - Limpia datos cuando usuario elimina cuenta
**Trigger:** `onDelete` en `/users/{userId}`
```javascript
// Cuando un usuario elimina su cuenta:
// 1. Anonimiza reseñas (opcional, según configuración)
// 2. Elimina estanterías privadas
// 3. Elimina sesiones de lectura
// 4. Actualiza contadores en libros afectados
// 5. Elimina relaciones de amistad
// 6. Limpia username reservation
```

### 6. **Funciones de Analytics y Reportes**

#### `generateDailyReports` - Reportes diarios
**Schedule:** `every day 00:00`
```javascript
// Genera reportes para admin:
// - Nuevos usuarios registrados
// - Reseñas escritas
// - Libros más populares
// - Actividad total
// - Problemas/errores detectados
```

#### `updateReadingStreaks` - Actualiza rachas de lectura
**Schedule:** `every day 01:00`
```javascript
// Para cada usuario activo:
// 1. Verifica si leyó ayer (basado en reading_sessions)
// 2. Actualiza streakDays
// 3. Otorga insignias por rachas (7, 30, 100 días)
// 4. Notifica logros alcanzados
```

## Estructura de Directorios

```
cloud-functions/
├── src/
│   ├── maintenance/
│   │   ├── updateBookStats.ts
│   │   ├── updateUserStats.ts
│   │   └── syncBookCache.ts
│   ├── activity/
│   │   ├── generateActivity.ts
│   │   └── updateFeedScores.ts
│   ├── recommendations/
│   │   ├── calculateTrendingBooks.ts
│   │   └── generatePersonalizedRecommendations.ts
│   ├── notifications/
│   │   ├── sendNotifications.ts
│   │   └── cleanupOldNotifications.ts
│   ├── validation/
│   │   ├── validateUsername.ts
│   │   └── cleanupUserData.ts
│   └── analytics/
│       ├── generateDailyReports.ts
│       └── updateReadingStreaks.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Configuración de Deployment

### `package.json` de Cloud Functions
```json
{
  "name": "goodreads-functions",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0",
    "axios": "^1.0.0",
    "cors": "^2.8.5",
    "googleapis": "^120.0.0"
  },
  "devDependencies": {
    "typescript": "^4.0.0",
    "@types/node": "^18.0.0",
    "firebase-functions-test": "^3.0.0"
  }
}
```

### Variables de Entorno Necesarias
```env
GOOGLE_BOOKS_API_KEY=tu_api_key_de_google_books
SENDGRID_API_KEY=para_notificaciones_por_email
FIREBASE_PROJECT_ID=tu_project_id
```

## Consideraciones de Performance

### 1. **Batch Operations**
```javascript
// Usar batched writes para operaciones múltiples
const batch = admin.firestore().batch();
// ... múltiples operaciones
await batch.commit();
```

### 2. **Incremental Updates**
```javascript
// Usar FieldValue.increment() para contadores
await docRef.update({
  ratingsCount: admin.firestore.FieldValue.increment(1),
  totalRating: admin.firestore.FieldValue.increment(newRating)
});
```

### 3. **Caching Estratégico**
- Cachear resultados de Google Books API por 7 días
- Cachear recomendaciones por usuario por 24 horas
- Usar Firestore cache para datos frecuentemente leídos

### 4. **Sharding para Escalabilidad**
```javascript
// Para libros con muchas reseñas (>1000), usar subcolecciones
const shardIndex = Math.floor(Math.random() * 10);
const shardRef = db.collection(`books/${bookId}/reviews_shard_${shardIndex}`);
```

## Plan de Implementación por Fases

### Fase 1 (Crítica)
1. `updateBookStats` y `updateUserStats` - Mantener datos consistentes
2. `validateUsername` - Seguridad y unicidad
3. `syncBookCache` - Integración con Google Books

### Fase 2 (Core Social)
1. `generateActivity` - Feed de actividad
2. `sendNotifications` - Notificaciones en tiempo real
3. `calculateTrendingBooks` - Descubrimiento

### Fase 3 (Avanzado)
1. `generatePersonalizedRecommendations` - Recomendaciones inteligentes
2. `updateReadingStreaks` - Gamificación
3. `generateDailyReports` - Analytics

## Monitoreo y Logging

### Cloud Functions Logging
```javascript
// Log estructurado para mejor análisis
functions.logger.log('Review created', {
  reviewId: context.params.reviewId,
  bookId: data.bookId,
  userId: data.userId,
  rating: data.rating,
  timestamp: new Date().toISOString()
});
```

### Métricas Clave a Monitorear
- Tiempo de ejecución de funciones
- Errores por función
- Uso de memoria/CPU
- Costos de Firestore reads/writes
- Latencia de notificaciones

## Backup y Recovery

### Estrategia de Backup
1. **Backup automático diario** de Firestore
2. **Exportación semanal** a Cloud Storage
3. **Point-in-time recovery** configurado

### Plan de Disaster Recovery
1. Funciones críticas con retry policies
2. Circuit breakers para llamadas a APIs externas
3. Fallback a datos cacheados cuando Google Books API falla
4. Alertas automáticas para errores persistentes