/**
 * Dataset de prueba temático "Santuario" para el motor de recomendaciones
 * Libros relacionados con historia, literatura clásica, filosofía y espiritualidad
 */

export const santuarioDataset = [
  {
    id: "santuario_001",
    title: "Historia Romana",
    authors: ["Tito Livio", "Salustio"],
    description: "Completa historia de la antigua Roma desde su fundación hasta la caída del Imperio. Analiza las instituciones políticas, las guerras y la sociedad romana.",
    categories: ["Historia", "Antigua Roma", "Clásicos", "Cultura"],
    publisher: "Editorial Clásica",
    publishedDate: "2020-01-01",
    pageCount: 450,
    thumbnail: "https://via.placeholder.com/128x192/4A5568/FFFFFF?text=Historia+Romana",
    similarityKeywords: ["roma", "historia", "antigua", "imperio", "cultura", "clásico"]
  },
  {
    id: "santuario_002",
    title: "Vida en la Antigua Grecia",
    authors: ["Plutarco", "Heródoto"],
    description: "Exploración detallada de la vida cotidiana, la filosofía, el arte y la política en la antigua Grecia. Incluye análisis de la democracia ateniense.",
    categories: ["Historia", "Antigua Grecia", "Filosofía", "Cultura"],
    publisher: "Editorial Helénica",
    publishedDate: "2019-05-15",
    pageCount: 380,
    thumbnail: "https://via.placeholder.com/128x192/2D3748/FFFFFF?text=Grecia+Antigua",
    similarityKeywords: ["grecia", "antigua", "filosofía", "democracia", "cultura", "historia"]
  },
  {
    id: "santuario_003",
    title: "Meditaciones",
    authors: ["Marco Aurelio"],
    description: "Reflexiones personales del emperador filósofo sobre la vida, la muerte, la virtud y el estoicismo. Guía práctica para la vida interior.",
    categories: ["Filosofía", "Estoicismo", "Autoayuda", "Clásicos"],
    publisher: "Editorial Filosófica",
    publishedDate: "2018-03-20",
    pageCount: 220,
    thumbnail: "https://via.placeholder.com/128x192/2C5282/FFFFFF?text=Meditaciones",
    similarityKeywords: ["filosofía", "estoicismo", "reflexión", "virtud", "autoayuda", "clásico"]
  },
  {
    id: "santuario_004",
    title: "El Arte de la Guerra",
    authors: ["Sun Tzu"],
    description: "Tratado militar clásico que explora estrategias, tácticas y filosofía de combate aplicables a diversos aspectos de la vida.",
    categories: ["Filosofía", "Estrategia", "Clásicos", "Liderazgo"],
    publisher: "Editorial Estratégica",
    publishedDate: "2021-07-10",
    pageCount: 180,
    thumbnail: "https://via.placeholder.com/128x192/744210/FFFFFF?text=Arte+Guerra",
    similarityKeywords: ["estrategia", "guerra", "liderazgo", "filosofía", "táctica", "clásico"]
  },
  {
    id: "santuario_005",
    title: "La República",
    authors: ["Platón"],
    description: "Diálogo filosófico que explora la naturaleza de la justicia, el Estado ideal y el papel del filósofo en la sociedad.",
    categories: ["Filosofía", "Política", "Clásicos", "Ética"],
    publisher: "Editorial Académica",
    publishedDate: "2017-11-30",
    pageCount: 350,
    thumbnail: "https://via.placeholder.com/128x192/553C9A/FFFFFF?text=La+República",
    similarityKeywords: ["filosofía", "política", "justicia", "platón", "clásico", "ética"]
  },
  {
    id: "santuario_006",
    title: "Historia de las Civilizaciones",
    authors: ["Arnold Toynbee"],
    description: "Estudio comparativo de las civilizaciones humanas a lo largo de la historia, analizando sus patrones de crecimiento y decadencia.",
    categories: ["Historia", "Civilizaciones", "Antropología", "Cultura"],
    publisher: "Editorial Histórica",
    publishedDate: "2022-02-14",
    pageCount: 520,
    thumbnail: "https://via.placeholder.com/128x192/975A16/FFFFFF?text=Civilizaciones",
    similarityKeywords: ["historia", "civilizaciones", "cultura", "antropología", "comparativa", "sociedad"]
  },
  {
    id: "santuario_007",
    title: "El Camino del Guerrero Pacífico",
    authors: ["Dan Millman"],
    description: "Relato autobiográfico que combina elementos de novela, filosofía y autoayuda para explorar el camino hacia la paz interior.",
    categories: ["Autoayuda", "Filosofía", "Espiritualidad", "Crecimiento Personal"],
    publisher: "Editorial Transformación",
    publishedDate: "2019-09-05",
    pageCount: 280,
    thumbnail: "https://via.placeholder.com/128x192/2F855A/FFFFFF?text=Guerrero+Pacífico",
    similarityKeywords: ["autoayuda", "espiritualidad", "crecimiento", "filosofía", "paz", "transformación"]
  },
  {
    id: "santuario_008",
    title: "Los Miserables",
    authors: ["Victor Hugo"],
    description: "Novela épica que explora temas de justicia, redención y amor en el contexto de la Francia del siglo XIX.",
    categories: ["Literatura", "Clásicos", "Novela", "Histórica"],
    publisher: "Editorial Literaria",
    publishedDate: "2016-12-01",
    pageCount: 1200,
    thumbnail: "https://via.placeholder.com/128x192/702459/FFFFFF?text=Miserables",
    similarityKeywords: ["literatura", "clásico", "novela", "histórica", "justicia", "redención"]
  },
  {
    id: "santuario_009",
    title: "El Principito",
    authors: ["Antoine de Saint-Exupéry"],
    description: "Fábula filosófica que explora temas de amor, amistad, responsabilidad y la esencia de lo humano.",
    categories: ["Literatura", "Filosofía", "Infantil", "Clásicos"],
    publisher: "Editorial Universal",
    publishedDate: "2020-04-23",
    pageCount: 96,
    thumbnail: "https://via.placeholder.com/128x192/D69E2E/FFFFFF?text=Principito",
    similarityKeywords: ["literatura", "filosofía", "fábula", "clásico", "amor", "amistad"]
  },
  {
    id: "santuario_010",
    title: "Siddhartha",
    authors: ["Hermann Hesse"],
    description: "Novela espiritual que sigue el viaje de autodescubrimiento de un hombre en la India antigua, explorando el budismo y la búsqueda de significado.",
    categories: ["Literatura", "Espiritualidad", "Filosofía", "Clásicos"],
    publisher: "Editorial Oriental",
    publishedDate: "2018-08-15",
    pageCount: 160,
    thumbnail: "https://via.placeholder.com/128x192/38A169/FFFFFF?text=Siddhartha",
    similarityKeywords: ["literatura", "espiritualidad", "budismo", "autodescubrimiento", "filosofía", "clásico"]
  },
  {
    id: "santuario_011",
    title: "El Nombre de la Rosa",
    authors: ["Umberto Eco"],
    description: "Novela histórica y filosófica que combina misterio, teología y semiótica en un monasterio medieval.",
    categories: ["Literatura", "Histórica", "Filosofía", "Misterio"],
    publisher: "Editorial Medieval",
    publishedDate: "2021-10-31",
    pageCount: 500,
    thumbnail: "https://via.placeholder.com/128x192/4C51BF/FFFFFF?text=Nombre+Rosa",
    similarityKeywords: ["literatura", "histórica", "filosofía", "medieval", "misterio", "teología"]
  },
  {
    id: "santuario_012",
    title: "Así Habló Zaratustra",
    authors: ["Friedrich Nietzsche"],
    description: "Obra filosófica que presenta las ideas centrales de Nietzsche sobre el superhombre, la muerte de Dios y la voluntad de poder.",
    categories: ["Filosofía", "Clásicos", "Existencialismo", "Literatura"],
    publisher: "Editorial Nihilista",
    publishedDate: "2017-06-20",
    pageCount: 320,
    thumbnail: "https://via.placeholder.com/128x192/9C4221/FFFFFF?text=Zaratustra",
    similarityKeywords: ["filosofía", "nietzsche", "existencialismo", "clásico", "superhombre", "literatura"]
  },
  {
    id: "santuario_013",
    title: "El Alquimista",
    authors: ["Paulo Coelho"],
    description: "Fábula espiritual sobre un pastor andaluz que viaja a Egipto en busca de un tesoro, descubriendo su leyenda personal.",
    categories: ["Literatura", "Espiritualidad", "Autoayuda", "Fábula"],
    publisher: "Editorial Mística",
    publishedDate: "2019-02-28",
    pageCount: 208,
    thumbnail: "https://via.placeholder.com/128x192/B7791F/FFFFFF?text=Alquimista",
    similarityKeywords: ["literatura", "espiritualidad", "fábula", "autoayuda", "viaje", "descubrimiento"]
  },
  {
    id: "santuario_014",
    title: "Historia del Arte",
    authors: ["E.H. Gombrich"],
    description: "Introducción accesible a la historia del arte occidental, desde la prehistoria hasta el siglo XX.",
    categories: ["Arte", "Historia", "Cultura", "Educación"],
    publisher: "Editorial Artística",
    publishedDate: "2020-11-11",
    pageCount: 680,
    thumbnail: "https://via.placeholder.com/128x192/805AD5/FFFFFF?text=Arte+Historia",
    similarityKeywords: ["arte", "historia", "cultura", "educación", "occidental", "evolución"]
  },
  {
    id: "santuario_015",
    title: "El Poder del Ahora",
    authors: ["Eckhart Tolle"],
    description: "Guía espiritual que enseña a vivir en el momento presente como camino hacia la paz interior y la iluminación.",
    categories: ["Espiritualidad", "Autoayuda", "Meditación", "Crecimiento Personal"],
    publisher: "Editorial Consciencia",
    publishedDate: "2018-04-05",
    pageCount: 240,
    thumbnail: "https://via.placeholder.com/128x192/38B2AC/FFFFFF?text=Poder+Ahora",
    similarityKeywords: ["espiritualidad", "autoayuda", "meditación", "presente", "paz", "iluminación"]
  }
];

/**
 * Categorías temáticas del dataset Santuario
 */
export const santuarioCategories = [
  { name: "Historia", count: 4, description: "Libros sobre historia antigua y civilizaciones" },
  { name: "Filosofía", count: 6, description: "Obras filosóficas clásicas y contemporáneas" },
  { name: "Literatura", count: 6, description: "Clásicos literarios con profundidad temática" },
  { name: "Espiritualidad", count: 4, description: "Libros sobre crecimiento espiritual y autoayuda" },
  { name: "Clásicos", count: 8, description: "Obras consideradas clásicas de la literatura mundial" },
  { name: "Autoayuda", count: 3, description: "Libros para el desarrollo personal" },
  { name: "Cultura", count: 3, description: "Obras sobre arte y cultura" }
];

/**
 * Obtiene libros del dataset Santuario por categoría
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Libros de la categoría
 */
export const getBooksByCategory = (category) => {
  return santuarioDataset.filter(book =>
    book.categories.some(cat =>
      cat.toLowerCase().includes(category.toLowerCase())
    )
  );
};

/**
 * Busca libros en el dataset Santuario por término
 * @param {string} query - Término de búsqueda
 * @returns {Array} Libros que coinciden
 */
export const searchSantuarioBooks = (query) => {
  const lowerQuery = query.toLowerCase();

  return santuarioDataset.filter(book => {
    // Buscar en título
    if (book.title.toLowerCase().includes(lowerQuery)) return true;

    // Buscar en autores
    if (book.authors.some(author => author.toLowerCase().includes(lowerQuery))) return true;

    // Buscar en descripción
    if (book.description.toLowerCase().includes(lowerQuery)) return true;

    // Buscar en categorías
    if (book.categories.some(cat => cat.toLowerCase().includes(lowerQuery))) return true;

    // Buscar en palabras clave de similitud
    if (book.similarityKeywords && book.similarityKeywords.some(keyword =>
      keyword.toLowerCase().includes(lowerQuery)
    )) return true;

    return false;
  });
};

/**
 * Obtiene recomendaciones del dataset Santuario basadas en un libro
 * @param {Object} sourceBook - Libro fuente
 * @param {number} limit - Límite de recomendaciones
 * @returns {Array} Libros recomendados
 */
export const getSantuarioRecommendations = (sourceBook, limit = 5) => {
  if (!sourceBook) return [];

  // Extraer palabras clave del libro fuente
  const sourceKeywords = extractKeywords(sourceBook);

  // Calcular similitud con cada libro del dataset
  const scoredBooks = santuarioDataset
    .filter(book => book.id !== sourceBook.id) // Excluir el libro fuente
    .map(book => {
      const bookKeywords = extractKeywords(book);
      const similarity = calculateKeywordSimilarity(sourceKeywords, bookKeywords);

      return {
        ...book,
        similarityScore: similarity,
        matchReason: getMatchReason(sourceKeywords, bookKeywords)
      };
    })
    .filter(book => book.similarityScore > 0.2) // Umbral mínimo
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return scoredBooks;
};

/**
 * Extrae palabras clave de un libro
 * @param {Object} book - Libro
 * @returns {Set} Conjunto de palabras clave
 */
const extractKeywords = (book) => {
  const keywords = new Set();

  // Extraer del título
  if (book.title) {
    book.title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
  }

  // Extraer de categorías
  if (book.categories) {
    book.categories.forEach(cat => {
      cat.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 3) keywords.add(word);
      });
    });
  }

  // Usar palabras clave específicas si existen
  if (book.similarityKeywords) {
    book.similarityKeywords.forEach(keyword => {
      keywords.add(keyword.toLowerCase());
    });
  }

  return keywords;
};

/**
 * Calcula similitud entre conjuntos de palabras clave
 * @param {Set} keywordsA - Palabras clave A
 * @param {Set} keywordsB - Palabras clave B
 * @returns {number} Puntuación de similitud (0-1)
 */
const calculateKeywordSimilarity = (keywordsA, keywordsB) => {
  if (keywordsA.size === 0 || keywordsB.size === 0) return 0;

  const intersection = new Set([...keywordsA].filter(x => keywordsB.has(x)));
  const union = new Set([...keywordsA, ...keywordsB]);

  return intersection.size / union.size;
};

/**
 * Obtiene la razón de coincidencia entre libros
 * @param {Set} sourceKeywords - Palabras clave fuente
 * @param {Set} targetKeywords - Palabras clave objetivo
 * @returns {string} Razón de coincidencia
 */
const getMatchReason = (sourceKeywords, targetKeywords) => {
  const intersection = [...sourceKeywords].filter(x => targetKeywords.has(x));

  if (intersection.length === 0) return "Coincidencia general";

  // Priorizar ciertas categorías de palabras clave
  const priorityKeywords = [
    { words: ["historia", "romana", "grecia", "antigua"], reason: "Tema histórico similar" },
    { words: ["filosofía", "estoicismo", "espiritualidad"], reason: "Tema filosófico similar" },
    { words: ["literatura", "clásico", "novela"], reason: "Género literario similar" },
    { words: ["autoayuda", "crecimiento", "personal"], reason: "Tema de desarrollo personal" }
  ];

  for (const category of priorityKeywords) {
    if (intersection.some(keyword => category.words.includes(keyword))) {
      return category.reason;
    }
  }

  return `Coincidencia en ${intersection.length} temas`;
};

/**
 * Dataset Santuario para pruebas del motor de recomendaciones
 */
export default {
  dataset: santuarioDataset,
  categories: santuarioCategories,
  getBooksByCategory,
  searchSantuarioBooks,
  getSantuarioRecommendations
};