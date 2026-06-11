/*
API OpenLibrary

Interface : https://openlibrary.org/
Documentation : https://openlibrary.org/developers/api
Search API (API de recherche) : https://openlibrary.org/dev/docs/api/search
*/

/**
 * Chercher un livre par titre, via l'API de recherche
 * @param {string} title Paramètre de recherche
 * @returns Réponse de l'API d'OpenLibrary
 */
export async function searchBookOpenLibrary(title: string) {
  const query = title.trim().replace(/\s+/g, "+");

  const url = `https://openlibrary.org/search.json?q=${query}&language=fre&fields=key,author_name,editions,editions.key,series_name,series_position,editions.title,editions.subtitle,editions.publisher,editions.language,editions.isbn&limit=10&mode=everything`;

  console.log(">>> URL OpenLibrary : ", url); // à supprimer

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}