import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import MoviePosterScene from "./Components/MoviePosterScene";
import { fetchMovies } from "./Services/tmdbService";
import GradientBackground from "./Components/GradientBackground";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const movieData = await fetchMovies();
        setMovies(movieData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load movies:", error);
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  if (loading) {
    return (
      <div className="loading-indicator">Loading cinematic experience...</div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <GradientBackground />
        <Suspense fallback={null}>
          <MoviePosterScene movies={movies} onMovieClick={handleMovieClick} />
        </Suspense>
      </Canvas>

      {/* <MovieDetailsOverlay movie={selectedMovie} onClose={handleCloseDetails} /> */}
    </div>
  );
}

export default App;
