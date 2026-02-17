# Estrategias de Optimización y Performance para Goodreads

## 1. Optimización de Firestore

### 1.1. Denormalización Estratégica
```javascript
// En lugar de hacer joins costosos, cachear datos frecuentemente usados

// MAL: Necesita 2 lecturas
const review = await getReview(reviewId);
const user = await getUser(review.userId);

// BIEN: Datos cacheados en el documento
const review = {
  id: 'review123',
  userId: 'user456',
  username: 'johndoe',           // ← Cacheado
  userProfilePic: 'url.jpg',     // ← Cacheado
  bookTitle: 'El Quijote',       // ← Cacheado
  // ... otros campos
};
```

### 1.2. Contadores Cacheados
```javascript
// Evitar contar documentos en tiempo real

// MAL: Query costosa para contar
const query = db.collection('reviews').where('bookId', '==', bookId);
const snapshot = await query.get();
const count = snapshot.size;

// BIEN: Contador mantenido por Cloud Functions
const book = {
  id: 'book123',
  reviewsCount: 156,             // ← Mantenido automáticamente
  ratingsCount: 142,
  averageRating: 4.2,
  // ...
};
```

### 1.3. Sharding para Escalabilidad
```javascript
// Para colecciones que pueden crecer mucho (>10,000 documentos)

// Sharding automático de reseñas por libro
function getReviewShard(bookId, reviewId) {
  const shardCount = 10;
  const shardIndex = hash(reviewId) % shardCount;
  return `books/${bookId}/reviews_shard_${shardIndex}/${reviewId}`;
}

// Sharding de actividad por usuario
function getActivityShard(userId, timestamp) {
  const month = timestamp.getMonth() + 1; // 1-12
  return `users/${userId}/activity_${month}/${activityId}`;
}
```

### 1.4. Índices Compuestos Optimizados
```javascript
// Índices para queries comunes:

// 1. Feed de actividad ordenado
{
  fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: '_feedScore', order: 'DESCENDING' }
  ]
}

// 2. Búsqueda de libros por género y rating
{
  fields: [
    { fieldPath: 'categories', arrayConfig: 'CONTAINS' },
    { fieldPath: 'averageRating', order: 'DESCENDING' },
    { fieldPath: 'ratingsCount', order: 'DESCENDING' }
  ]
}

// 3. Reseñas recientes de un usuario
{
  fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

## 2. Optimización del Frontend (React)

### 2.1. Paginación Eficiente
```javascript
// Usar query cursors en lugar de offsets
const PAGE_SIZE = 20;

// Primera página
const firstPageQuery = query(
  collection(db, 'reviews'),
  where('bookId', '==', bookId),
  orderBy('createdAt', 'desc'),
  limit(PAGE_SIZE)
);

// Página siguiente (usando último documento)
const lastDoc = firstPageSnapshot.docs[firstPageSnapshot.docs.length - 1];
const nextPageQuery = query(
  collection(db, 'reviews'),
  where('bookId', '==', bookId),
  orderBy('createdAt', 'desc'),
  startAfter(lastDoc),
  limit(PAGE_SIZE)
);
```

### 2.2. Virtualización de Listas
```javascript
// Para feeds largos, usar virtualización
import { FixedSizeList as List } from 'react-window';

const FeedList = ({ activities }) => (
  <List
    height={600}
    itemCount={activities.length}
    itemSize={120}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <ActivityItem activity={activities[index]} />
      </div>
    )}
  </List>
);
```

### 2.3. Caché Local con IndexedDB
```javascript
// Cachear datos de libros y perfiles frecuentemente accedidos
class LocalCache {
  constructor() {
    this.db = new Dexie('GoodreadsCache');
    this.db.version(1).stores({
      books: 'id, title, authors, lastAccessed',
      users: 'id, username, lastAccessed',
      reviews: 'id, bookId, userId, createdAt'
    });
  }

  async getBook(bookId) {
    // Primero intentar cache local
    const cached = await this.db.books.get(bookId);
    if (cached && Date.now() - cached.lastAccessed < 24 * 60 * 60 * 1000) {
      return cached;
    }

    // Si no está en cache o es viejo, obtener de Firestore
    const book = await fetchBookFromFirestore(bookId);
    await this.db.books.put({
      ...book,
      lastAccessed: Date.now()
    });

    return book;
  }
}
```

### 2.4. Lazy Loading de Imágenes
```javascript
// Componente de imagen optimizada
const OptimizedImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="image-container">
      {!isLoaded && !error && (
        <div className="image-skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        style={{ display: isLoaded && !error ? 'block' : 'none' }}
        {...props}
      />
    </div>
  );
};
```

## 3. Optimización de Cloud Functions

### 3.1. Batch Operations
```javascript
// Usar batched writes para operaciones múltiples
async function updateMultipleCounters(updates) {
  const batch = admin.firestore().batch();

  updates.forEach(({ ref, field, value }) => {
    batch.update(ref, {
      [field]: admin.firestore.FieldValue.increment(value)
    });
  });

  await batch.commit();
}

// En lugar de múltiples updates individuales
await updateMultipleCounters([
  { ref: bookRef, field: 'reviewsCount', value: 1 },
  { ref: bookRef, field: 'ratingsCount', value: 1 },
  { ref: userRef, field: 'reviewsWritten', value: 1 }
]);
```

### 3.2. Incremental Updates
```javascript
// Usar FieldValue para updates incrementales
async function updateBookRating(bookId, newRating, oldRating = null) {
  const bookRef = admin.firestore().collection('books').doc(bookId);

  const updates = {
    ratingsCount: admin.firestore.FieldValue.increment(1),
    totalRating: admin.firestore.FieldValue.increment(newRating)
  };

  // Si es una actualización, ajustar rating anterior
  if (oldRating !== null) {
    updates.totalRating = admin.firestore.FieldValue.increment(newRating - oldRating);
    updates.ratingsCount = admin.firestore.FieldValue.increment(0); // No cambia el count
  }

  await bookRef.update(updates);

  // Recalcular promedio en Cloud Function separada
  await recalculateAverageRating(bookId);
}
```

### 3.3. Circuit Breakers para APIs Externas
```javascript
// Proteger contra fallos de Google Books API
class GoogleBooksAPI {
  constructor() {
    this.state = 'CLOSED'; // CLOSED, HALF_OPEN, OPEN
    this.failures = 0;
    this.lastFailure = null;
  }

  async searchBooks(query) {
    if (this.state === 'OPEN') {
      // Circuito abierto, usar cache
      return this.getFromCache(query);
    }

    try {
      const result = await axios.get(GOOGLE_BOOKS_API, { params: { q: query } });
      this.resetCircuit();
      return result.data;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordFailure() {
    this.failures++;
    if (this.failures >= 5) {
      this.state = 'OPEN';
      setTimeout(() => {
        this.state = 'HALF_OPEN';
      }, 60000); // Reintentar después de 1 minuto
    }
  }
}
```

## 4. Estrategias de Caché

### 4.1. Cache Multinivel
```
Nivel 1: Memory Cache (React State/Context) → < 1 minuto
Nivel 2: IndexedDB (Dexie) → < 24 horas
Nivel 3: Firestore Cache (offline persistence) → Siempre
Nivel 4: Firestore Server → Fuente de verdad
```

### 4.2. Cache por Tipo de Datos
```javascript
const CACHE_CONFIG = {
  books: {
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    maxSize: 1000
  },
  userProfiles: {
    ttl: 60 * 60 * 1000, // 1 hora
    maxSize: 100
  },
  reviews: {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 500
  },
  activity: {
    ttl: 2 * 60 * 1000, // 2 minutos
    maxSize: 200
  }
};
```

### 4.3. Prefetching Inteligente
```javascript
// Prefetch basado en patrones de uso
class PrefetchManager {
  constructor() {
    this.patterns = {
      'book-detail': ['reviews', 'similar-books', 'author-books'],
      'user-profile': ['user-reviews', 'user-shelves', 'user-activity'],
      'home-feed': ['trending-books', 'friend-activity', 'recommendations']
    };
  }

  async prefetch(context, userId) {
    const patterns = this.patterns[context] || [];

    for (const pattern of patterns) {
      switch (pattern) {
        case 'reviews':
          await this.prefetchBookReviews(context.bookId);
          break;
        case 'similar-books':
          await this.prefetchSimilarBooks(context.bookId);
          break;
        // ... otros casos
      }
    }
  }
}
```

## 5. Optimización de Red

### 5.1. Compresión de Payloads
```javascript
// Usar campos mínimos necesarios en queries
const minimalBookQuery = query(
  collection(db, 'books'),
  where('categories', 'array-contains', 'Ficción'),
  orderBy('averageRating', 'desc'),
  limit(10),
  // Seleccionar solo campos necesarios
  select(['id', 'title', 'authors', 'thumbnail', 'averageRating'])
);
```

### 5.2. Agrupación de Updates
```javascript
// En lugar de múltiples updates en tiempo real, agrupar
class UpdateBatcher {
  constructor() {
    this.updates = new Map();
    this.flushInterval = 2000; // 2 segundos
    this.startBatching();
  }

  batchUpdate(collection, docId, data) {
    const key = `${collection}/${docId}`;
    this.updates.set(key, { ...this.updates.get(key), ...data });
  }

  startBatching() {
    setInterval(() => {
      this.flushUpdates();
    }, this.flushInterval);
  }

  async flushUpdates() {
    if (this.updates.size === 0) return;

    const batch = db.batch();
    this.updates.forEach((data, path) => {
      const ref = db.doc(path);
      batch.update(ref, data);
    });

    await batch.commit();
    this.updates.clear();
  }
}
```

### 5.3. WebSockets para Updates en Tiempo Real
```javascript
// Usar Firestore real-time listeners selectivamente
const useRealtimeUpdates = (collection, queryConstraints, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collection), ...queryConstraints);

    // Solo suscribirse si es necesario
    if (options.realtime) {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(items);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Obtener datos una sola vez
      getDocs(q).then(snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(items);
        setLoading(false);
      });
    }
  }, [collection, ...queryConstraints]);

  return { data, loading };
};
```

## 6. Monitoreo y Alertas

### 6.1. Métricas Clave
```javascript
const PERFORMANCE_METRICS = {
  // Firestore
  firestoreReads: 'Número de lecturas por usuario/sesión',
  firestoreWrites: 'Número de escrituras por usuario/sesión',
  queryLatency: 'Latencia de queries comunes',
  cacheHitRate: 'Porcentaje de cache hits',

  // Frontend
  pageLoadTime: 'Tiempo de carga de página',
  componentRenderTime: 'Tiempo de render de componentes críticos',
  imageLoadTime: 'Tiempo de carga de imágenes',

  // Cloud Functions
  functionExecutionTime: 'Tiempo de ejecución de funciones',
  functionErrors: 'Errores por función',
  apiLatency: 'Latencia de APIs externas'
};
```

### 6.2. Alertas Automáticas
```yaml
alert_rules:
  - name: "High Firestore Reads"
    condition: "firestore_reads > 1000 per minute"
    action: "Send email to dev team"

  - name: "Slow Page Load"
    condition: "page_load_time > 3000ms for 5% of users"
    action: "Create Jira ticket"

  - name: "Cloud Function Timeout"
    condition: "function_timeout_count > 10 per hour"
    action: "Page on-call engineer"
```

## 7. Plan de Escalabilidad

### 7.1. Escalado Horizontal
- **< 1,000 usuarios**: Single Firestore instance
- **1,000 - 10,000 usuarios**: Sharding de colecciones grandes
- **10,000 - 100,000 usuarios**: Múltiples Cloud Functions instances
- **> 100,000 usuarios**: Microservicios especializados

### 7.2. Database Sharding Strategy
```javascript
// Sharding por región geográfica
function getShardByRegion(userId) {
  // Basado en primeros caracteres del userId
  const shardMap = {
    'a-m': 'us-central1',
    'n-z': 'europe-west1',
    '0-9': 'asia-northeast1'
  };

  const firstChar = userId.charAt(0).toLowerCase();
  for (const [range, region] of Object.entries(shardMap)) {
    const [start, end] = range.split('-');
    if (firstChar >= start && firstChar <= end) {
      return region;
    }
  }

  return 'us-central1'; // Default
}
```

### 7.3. Plan de Migración
1. **Fase 1**: Implementar denormalización y contadores
2. **Fase 2**: Agregar caching multinivel
3. **Fase 3**: Implementar sharding para colecciones críticas
4. **Fase 4**: Optimizar queries con índices compuestos
5. **Fase 5**: Monitoreo y ajuste continuo