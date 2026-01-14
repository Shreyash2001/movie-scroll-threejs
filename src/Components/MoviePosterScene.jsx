import React, { useRef, useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import MoviePoster from "./MoviePoster";
import MovieDialog from "./MovieDialog";
import { PhysicsSystem } from "../Utils/physicsSystem";
import { Html } from "@react-three/drei";

function MoviePosterScene({ movies, onMovieClick }) {
  const sceneRef = useRef();
  const physicsRef = useRef(new PhysicsSystem());
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollStateRef = useRef({ isScrolling: false });
  const tiltRef = useRef({ x: 0, y: 0, z: 0 });
  const cylinderEffectRef = useRef(0);
  const { gl } = useThree();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const COLUMNS = 15;
  const SPACING_X = 3.5;
  const SPACING_Y = 4.8;
  const CYLINDER_RADIUS = 12;

  const MIN_ITEMS = 500;
  const ROWS_NEEDED = Math.ceil(MIN_ITEMS / COLUMNS);
  const TOTAL_POSTERS = ROWS_NEEDED * COLUMNS;

  const displayMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];

    const expanded = [];
    for (let i = 0; i < TOTAL_POSTERS; i++) {
      expanded.push(movies[i % movies.length]);
    }
    return expanded;
  }, [movies, TOTAL_POSTERS]);

  const ROWS = ROWS_NEEDED;
  const GRID_WIDTH = COLUMNS * SPACING_X;
  const GRID_HEIGHT = ROWS * SPACING_Y;

  const posterPositions = useMemo(() => {
    return displayMovies.map((movie, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);

      return {
        x: col * SPACING_X - (COLUMNS * SPACING_X) / 2 + SPACING_X / 2,
        y: -row * SPACING_Y,
        z: 0,
        rotation: 0,
        scale: 1,
      };
    });
  }, [displayMovies]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowDialog(true);
    if (onMovieClick) onMovieClick(movie);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (showDialog) return;
      e.preventDefault();
      physicsRef.current.addVelocity(e.deltaX, e.deltaY);
    };

    const touchStartRef = { current: null };

    const handleTouchStart = (e) => {
      if (showDialog) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
      if (showDialog) return;
      if (touchStartRef.current) {
        const touch = e.touches[0];
        const deltaX = touchStartRef.current.x - touch.clientX;
        const deltaY = touchStartRef.current.y - touch.clientY;

        physicsRef.current.addVelocity(deltaX * 0.5, deltaY * 0.5);
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const canvas = gl.domElement;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gl, showDialog]);

  useFrame((state) => {
    if (showDialog) return;

    const position = physicsRef.current.update();
    const cam = state.camera;

    scrollStateRef.current.isScrolling = physicsRef.current.getIsScrolling();
    tiltRef.current = physicsRef.current.getTiltRotation();
    cylinderEffectRef.current = physicsRef.current.getCylinderEffect();

    if (sceneRef.current) {
      const wrappedX = ((position.x % GRID_WIDTH) + GRID_WIDTH) % GRID_WIDTH;
      const wrappedY = ((position.y % GRID_HEIGHT) + GRID_HEIGHT) % GRID_HEIGHT;

      sceneRef.current.position.x = -wrappedX;
      sceneRef.current.position.y = -wrappedY;
    }

    const targetX = mouseRef.current.x * 0.3;
    const targetY = mouseRef.current.y * 0.3;
    cam.position.x += (targetX - cam.position.x) * 0.05;
    cam.position.y += (targetY - cam.position.y) * 0.05;
    cam.lookAt(0, 0, 0);
  });

  const renderTiledGrid = () => {
    if (displayMovies.length === 0) return null;

    const tiles = [];
    for (let tileX = -1; tileX <= 1; tileX++) {
      for (let tileY = -1; tileY <= 1; tileY++) {
        const offsetX = tileX * GRID_WIDTH;
        const offsetY = tileY * GRID_HEIGHT;

        posterPositions.forEach((pos, index) => {
          const movie = displayMovies[index];
          const key = `${movie.id}-${index}-${tileX}-${tileY}`;

          tiles.push(
            <MoviePoster
              key={key}
              movie={movie}
              position={[pos.x + offsetX, pos.y + offsetY, pos.z]}
              rotation={pos.rotation}
              scale={pos.scale}
              onClick={() => handleMovieClick(movie)}
              scrollStateRef={scrollStateRef}
              tiltRef={tiltRef}
              cylinderEffectRef={cylinderEffectRef}
              cylinderRadius={CYLINDER_RADIUS}
              isDialogOpen={showDialog}
            />
          );
        });
      }
    }
    return tiles;
  };

  return (
    <>
      <group ref={sceneRef}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#4488ff" />
        {renderTiledGrid()}
      </group>

      {/* Movie Dialog */}
      {selectedMovie && (
        <Html fullscreen style={{ pointerEvents: "medium" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: showDialog ? "auto" : "none",
            }}
          >
            <MovieDialog
              movie={selectedMovie}
              onClose={handleCloseDialog}
              isOpen={showDialog}
            />
          </div>
        </Html>
      )}
    </>
  );
}

export default MoviePosterScene;
