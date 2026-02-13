import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

if (!API_KEY) {
  console.warn('VITE_GOOGLE_BOOKS_API_KEY no está definida en las variables de entorno');
}

const api = axios.create({
  baseURL: GOOGLE_BOOKS_API,
  params: {
    key: API_KEY,
  },
});

/**
 * Limpia y formatea los datos de un libro de la API de Google Books
 * @param {Object} bookData - Datos crudos del libro de la API
 * @returns {Object} Datos formateados del libro
 */
const cleanBookData = (bookData) => {
  const { id, volumeInfo } = bookData;
  const {
    title,
    authors = [],
    publisher,
    publishedDate,
    description,
    pageCount,
    categories = [],
    imageLinks = {},
    industryIdentifiers = [],
  } = volumeInfo;

  // Obtener thumbnail de alta resolución si está disponible
  let thumbnail = imageLinks.thumbnail || '';
  if (thumbnail) {
    // Reemplazar 'http://' por 'https://' y aumentar resolución
    thumbnail = thumbnail.replace('http://', 'https://');
    thumbnail = thumbnail.replace('&zoom=1', '&zoom=0'); // Mejor calidad
    thumbnail = thumbnail.replace('=1&', '=0&');
  }

  // Obtener imagen grande si está disponible
  const image = imageLinks.extraLarge || imageLinks.large || imageLinks.medium || thumbnail;

  // Extraer ISBN si está disponible
  const isbn = industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10');

  return {
    id,
    title: title || 'Título no disponible',
    authors: authors || [],
    publisher: publisher || 'Editorial no disponible',
    publishedDate: publishedDate || '',
    description: description || '',
    pageCount: pageCount || 0,
    categories: categories || [],
    thumbnail,
    image,
    isbn: isbn?.identifier || '',
    industryIdentifiers,
  };
};

/**
 * Busca libros en Google Books API
 * @param {string} query - Término de búsqueda
 * @param {number} maxResults - Máximo de resultados (default: 20)
 * @returns {Promise<Array>} Array de libros formateados
 */
export const searchBooks = async (query, maxResults = 20) => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await api.get('', {
      params: {
        q: query,
        maxResults,
        langRestrict: 'es', // Priorizar libros en español
        printType: 'books', // Solo libros, no revistas
        orderBy: 'relevance',
      },
    });

    const books = response.data.items || [];
    return books.map(cleanBookData);
  } catch (error) {
    console.error('Error buscando libros:', error);

    // Manejo de errores específicos
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('La clave API de Google Books no es válida o ha expirado');
      } else if (error.response.status === 429) {
        throw new Error('Se ha excedido el límite de solicitudes a la API');
      }
    }

    throw new Error(`Error al buscar libros: ${error.message}`);
  }
};

/**
 * Obtiene detalles de un libro específico por ID
 * @param {string} bookId - ID del libro en Google Books
 * @returns {Promise<Object>} Datos del libro formateados
 */
export const getBookDetails = async (bookId) => {
  try {
    if (!bookId) {
      throw new Error('Se requiere un ID de libro');
    }

    const response = await api.get(`/${bookId}`);
    return cleanBookData(response.data);
  } catch (error) {
    console.error(`Error obteniendo detalles del libro ${bookId}:`, error);
    throw new Error(`No se pudo obtener detalles del libro: ${error.message}`);
  }
};

/**
 * Busca libros por autor
 * @param {string} author - Nombre del autor
 * @param {number} maxResults - Máximo de resultados (default: 15)
 * @returns {Promise<Array>} Array de libros formateados
 */
export const searchBooksByAuthor = async (author, maxResults = 15) => {
  try {
    const response = await api.get('', {
      params: {
        q: `inauthor:"${author}"`,
        maxResults,
        orderBy: 'relevance',
      },
    });

    const books = response.data.items || [];
    return books.map(cleanBookData);
  } catch (error) {
    console.error(`Error buscando libros por autor ${author}:`, error);
    throw new Error(`Error al buscar libros por autor: ${error.message}`);
  }
};

/**
 * Busca libros por categoría/género
 * @param {string} category - Categoría o género
 * @param {number} maxResults - Máximo de resultados (default: 15)
 * @returns {Promise<Array>} Array de libros formateados
 */
export const searchBooksByCategory = async (category, maxResults = 15) => {
  try {
    const response = await api.get('', {
      params: {
        q: `subject:"${category}"`,
        maxResults,
        orderBy: 'relevance',
      },
    });

    const books = response.data.items || [];
    return books.map(cleanBookData);
  } catch (error) {
    console.error(`Error buscando libros por categoría ${category}:`, error);
    throw new Error(`Error al buscar libros por categoría: ${error.message}`);
  }
};

export default {
  searchBooks,
  getBookDetails,
  searchBooksByAuthor,
  searchBooksByCategory,
};