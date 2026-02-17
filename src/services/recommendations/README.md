# Sistema de Recomendaciones Semánticas - Santuario Literario

## 📋 Resumen

Motor de recomendaciones semánticas para libros basado en análisis de texto (TF-IDF + Cosine Similarity) con personalización por usuario. Diseñado específicamente para el proyecto Santuario Literario.

## 🎯 Objetivo

Proporcionar recomendaciones inteligentes de libros basadas en:
- **Contenido semántico**: Análisis de títulos, descripciones y categorías
- **Historial de usuario**: Personalización basada en libros leídos
- **Temática Santuario**: Enfoque en literatura clásica, filosofía y espiritualidad

## 🏗️ Arquitectura

```
src/services/
├── semanticRecommender.js      # Motor principal (TF-IDF + Cosine Similarity)
├── santuarioDataset.js         # Dataset temático de prueba (15 libros)
├── recommendationService.js    # API unificada con métricas
├── recommendationTester.js     # Suite de pruebas y validación
└── recommendations/           # Documentación y ejemplos
```

## 🚀 Características Principales

### 1. **Motor Semántico**
- **TF-IDF (Term Frequency-Inverse Document Frequency)**: Extracción de características
- **Cosine Similarity**: Cálculo de similitud entre vectores
- **Stop Words en español**: Filtrado de palabras vacías
- **Cache de resultados**: Mejora de performance

### 2. **Personalización**
- Recomendaciones basadas en historial de lectura
- Preferencias por categorías y autores
- Ajuste dinámico de puntuaciones

### 3. **Dataset Santuario**
- 15 libros temáticos (historia, filosofía, literatura clásica)
- Categorías específicas para el proyecto
- Datos estructurados para pruebas

### 4. **UI Components**
- `RecommendationCarousel`: Carrusel interactivo
- `RecommendationList`: Lista compacta
- `useRecommendations`: Hook personalizado

## 📊 Algoritmo de Recomendación

### Paso 1: Preprocesamiento
```javascript
1. Tokenización del texto
2. Filtrado de stop words
3. Normalización (minúsculas, acentos)
```

### Paso 2: Extracción de Características
```javascript
1. Cálculo de TF (Frecuencia de Términos)
2. Cálculo de IDF (Frecuencia Inversa de Documentos)
3. Creación de vectores TF-IDF
```

### Paso 3: Cálculo de Similitud
```javascript
1. Cosine Similarity entre vectores
2. Umbral mínimo: 0.1
3. Ordenamiento descendente
```

### Paso 4: Personalización
```javascript
1. Análisis de historial del usuario
2. Ajuste de puntuaciones por preferencias
3. Filtrado por categorías excluidas
```

## 🛠️ Uso Rápido

### Instalación
```javascript
// Los servicios ya están integrados en el proyecto
// No se requieren dependencias adicionales
```

### Ejemplo Básico
```javascript
import { getBookRecommendations } from './services/semanticRecommender.js';

const book = {
  id: "book123",
  title: "Historia Romana",
  categories: ["Historia", "Clásicos"],
  description: "Historia completa de la antigua Roma..."
};

const recommendations = await getBookRecommendations(book, "user123");
```

### Componente UI
```jsx
import { RecommendationCarousel } from './components/Recommendations';

<RecommendationCarousel
  sourceBook={selectedBook}
  userId={user.uid}
  title="Libros similares"
  maxRecommendations={5}
  autoRefresh={true}
/>
```

### Hook Personalizado
```javascript
import useRecommendations from './hooks/useRecommendations';

const {
  recommendations,
  isLoading,
  error,
  loadRecommendations
} = useRecommendations({
  sourceBook: selectedBook,
  autoLoad: true,
  maxRecommendations: 5
});
```

## 🧪 Testing

### Suite de Pruebas
```javascript
import { runAllTests } from './services/recommendationTester.js';

// Ejecutar todos los tests
const results = await runAllTests();
```

### Test Principal
```
"Historia Romana" → "Vida en la antigua Grecia"
✅ Validación de lógica semántica básica
```

### Métricas de Performance
```javascript
import { testPerformance } from './services/recommendationTester.js';

const performanceResults = await testPerformance();
// Resultado: ~50ms por consulta en dataset local
```

## 📈 Métricas del Servicio

### API de Métricas
```javascript
import recommendationService from './services/recommendationService.js';

const metrics = recommendationService.getServiceMetrics();
// {
//   totalRequests: 150,
//   successfulRequests: 145,
//   failedRequests: 5,
//   cacheHits: 89,
//   averageResponseTime: 52.3,
//   successRate: 96.67,
//   uptime: "2d 5h 30m"
// }
```

### Sistema de Logging
```javascript
// Log automático de cada request
[RecommendationService] SUCCESS: {
  sourceBook: "Historia Romana",
  userId: "user123",
  recommendations: 5,
  responseTime: 48
}
```

## 🎨 Integración con UI Existente

### 1. **Página de Inicio**
```jsx
// En HomePage.jsx
{user && (
  <RecommendationCarousel
    userId={user.uid}
    title="Libros que podrían gustarte"
    maxRecommendations={5}
  />
)}
```

### 2. **Página de Detalles de Libro**
```jsx
// En BookDetailsPage.jsx
<RecommendationCarousel
  sourceBook={selectedBook}
  userId={user?.uid}
  title={`Similar a "${selectedBook.title}"`}
  showSimilarityScore={true}
/>
```

### 3. **Widget Independiente**
```jsx
// En cualquier componente
<RecommendationList
  userId={user.uid}
  maxRecommendations={3}
  compact={true}
/>
```

## 🔧 Configuración

### Parámetros del Servicio
```javascript
const options = {
  maxRecommendations: 5,           // Máximo de resultados
  minSimilarityScore: 0.1,         // Umbral mínimo
  excludeCategories: [],           // Categorías a excluir
  refreshInterval: 300000,         // Auto-refresh (5 minutos)
  useCache: true                   // Habilitar cache
};
```

### Personalización
```javascript
// Ajustar stop words para español
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una',
  'de', 'del', 'al', 'a', 'en', 'y', 'o'
  // ... agregar según necesidad
]);
```

## 🚨 Casos de Borde

### 1. **Libro sin categorías**
```javascript
// El sistema usa título y descripción como fallback
```

### 2. **Usuario sin historial**
```javascript
// Recomendaciones basadas solo en libro actual
```

### 3. **Cache expirado**
```javascript
// Auto-refresh cada 30 minutos
// Limpieza manual disponible
```

### 4. **Error de API**
```javascript
// Fallback a dataset Santuario
// Log de error con reintento automático
```

## 📚 Dataset Santuario

### Estructura
```javascript
{
  id: "santuario_001",
  title: "Historia Romana",
  authors: ["Tito Livio", "Salustio"],
  description: "Historia completa de la antigua Roma...",
  categories: ["Historia", "Antigua Roma", "Clásicos"],
  similarityKeywords: ["roma", "historia", "antigua", "imperio"]
}
```

### Categorías Principales
1. **Historia** (4 libros): Historia antigua y civilizaciones
2. **Filosofía** (6 libros): Obras filosóficas clásicas
3. **Literatura** (6 libros): Clásicos literarios
4. **Espiritualidad** (4 libros): Crecimiento espiritual
5. **Clásicos** (8 libros): Obras fundamentales

## 🔍 Debugging

### Herramientas de Desarrollo
```javascript
// 1. Ver logs del servicio
console.log('[RecommendationService]', recommendationService.getServiceMetrics());

// 2. Ejecutar tests
npm test -- recommendationTester.js

// 3. Inspeccionar cache
localStorage.getItem('recommendationCache');

// 4. Limpiar cache
recommendationService.clearCache();
```

### Common Issues
1. **"No se encontraron recomendaciones"**
   - Verificar que el libro tenga categorías
   - Comprobar conexión a internet (para Google Books API)
   - Revisar umbral de similitud (default: 0.1)

2. **"Error de personalización"**
   - Verificar que el usuario esté autenticado
   - Comprobar historial en Firestore
   - Revisar permisos de lectura

3. **"Performance lenta"**
   - Limpiar cache
   - Reducir número de recomendaciones
   - Usar dataset Santuario para pruebas

## 🔮 Roadmap

### Fase 1 (Completada) ✅
- [x] Motor semántico básico (TF-IDF + Cosine)
- [x] Dataset Santuario (15 libros)
- [x] Componentes UI básicos
- [x] Suite de pruebas

### Fase 2 (Próxima)
- [ ] Integración con Google Books API real
- [ ] Machine Learning básico (clustering)
- [ ] Sistema de feedback (like/dislike)
- [ ] Dashboard de métricas avanzadas

### Fase 3 (Futuro)
- [ ] Deep Learning (embeddings)
- [ ] Recomendaciones colaborativas
- [ ] A/B testing framework
- [ ] Exportación de datos

## 📄 Licencia

Sistema desarrollado específicamente para Santuario Literario.
Basado en algoritmos estándar de procesamiento de lenguaje natural.

## 👥 Contribución

1. **Reportar bugs**: Issues en el repositorio
2. **Sugerir features**: Pull requests bien documentados
3. **Mejorar dataset**: Agregar libros temáticos relevantes
4. **Optimizar algoritmos**: Propuestas de mejora de performance

## 📞 Soporte

- **Documentación**: Este archivo README
- **Ejemplos**: `/src/examples/recommendationsIntegrationExample.jsx`
- **Tests**: `/src/services/recommendationTester.js`
- **Issues**: Repositorio del proyecto

---

**Nota**: Este sistema está diseñado para ser funcional, no académicamente perfecto.
Prioriza simplicidad, mantenibilidad e integración con el stack existente de Santuario Literario.