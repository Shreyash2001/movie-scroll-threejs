import axios from "axios";

const TMDB_API_KEY = "5b83527f20412342738089c4292ef2e5"; // Replace with your actual API key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "/tmdb/t/p/w500";

export const fetchMovies = async () => {
  try {
    const pagePromises = [];

    // Fetch multiple pages for more variety
    for (let page = 1; page <= 5; page++) {
      pagePromises.push(
        axios.get(`${TMDB_BASE_URL}/movie/popular`, {
          params: { api_key: TMDB_API_KEY, page },
        })
      );
    }

    const responses = await Promise.all(pagePromises);
    const allMovies = responses.flatMap((res) => res.data.results);

    const uniqueMovies = Array.from(
      new Map(allMovies.map((movie) => [movie.id, movie])).values()
    );

    return uniqueMovies
      .filter((movie) => movie.poster_path)
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
        rating: movie.vote_average,
        releaseDate: movie.release_date,
        overview: movie.overview,
      }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};
