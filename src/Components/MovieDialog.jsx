import React, { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, CanvasTexture } from "three";
import * as THREE from "three";

function createTextCanvas(movie) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = 1024;
  canvas.height = 1536;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = "#222222";
  ctx.font = "bold 56px Arial";
  const titleLines = wrapText(ctx, movie.title, canvas.width - 80);
  let yPos = 80;
  titleLines.forEach((line) => {
    ctx.fillText(line, 40, yPos);
    yPos += 65;
  });

  yPos += 20;

  // Release Date
  ctx.fillStyle = "#666666";
  ctx.font = "32px Arial";
  ctx.fillText("Release Date:", 40, yPos);
  ctx.fillStyle = "#222222";
  ctx.font = "bold 32px Arial";
  ctx.fillText(movie.releaseDate || "N/A", 280, yPos);

  yPos += 60;

  // Rating
  ctx.fillStyle = "#666666";
  ctx.font = "32px Arial";
  ctx.fillText("Rating:", 40, yPos);
  ctx.fillStyle = "#f39c12";
  ctx.font = "bold 36px Arial";
  ctx.fillText(
    `★ ${movie.rating ? movie.rating.toFixed(1) : "N/A"}/10`,
    160,
    yPos
  );

  yPos += 80;

  // Divider line
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, yPos);
  ctx.lineTo(canvas.width - 40, yPos);
  ctx.stroke();

  yPos += 60;

  // Overview label
  ctx.fillStyle = "#666666";
  ctx.font = "bold 36px Arial";
  ctx.fillText("Overview", 40, yPos);

  yPos += 50;

  // Overview text
  ctx.fillStyle = "#444444";
  ctx.font = "28px Arial";
  const overviewLines = wrapText(
    ctx,
    movie.overview || "No overview available.",
    canvas.width - 80
  );
  overviewLines.forEach((line, index) => {
    if (yPos < canvas.height - 100) {
      ctx.fillText(line, 40, yPos);
      yPos += 40;
    }
  });

  return canvas;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function MovieDialog({ movie, onClose, isOpen, initialPosition }) {
  const groupRef = useRef();
  const posterRef = useRef();
  const detailsRef = useRef();
  const closeButtonRef = useRef();
  const animationProgress = useRef(0);
  const posterTexture = useLoader(TextureLoader, movie.posterUrl);

  const detailsTexture = useMemo(() => {
    const canvas = createTextCanvas(movie);
    return new CanvasTexture(canvas);
  }, [movie]);

  // Create close button texture
  const closeButtonTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    // Draw circle
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.fill();

    // Draw X
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(78, 78);
    ctx.lineTo(178, 178);
    ctx.moveTo(178, 78);
    ctx.lineTo(78, 178);
    ctx.stroke();

    return new CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    if (isOpen) {
      animationProgress.current = 0;
    }
  }, [isOpen]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isOpen && animationProgress.current < 1) {
      animationProgress.current = Math.min(
        1,
        animationProgress.current + delta * 1.5
      );

      const progress = easeOutCubic(animationProgress.current);

      // Move to center
      const targetX = 0;
      const targetY = 0;
      const targetZ = 8;

      groupRef.current.position.x =
        initialPosition[0] + (targetX - initialPosition[0]) * progress;
      groupRef.current.position.y =
        initialPosition[1] + (targetY - initialPosition[1]) * progress;
      groupRef.current.position.z =
        initialPosition[2] + (targetZ - initialPosition[2]) * progress;

      // Flip poster
      if (posterRef.current) {
        posterRef.current.rotation.y = progress * Math.PI;
        const scale = 1 + progress * 1.5;
        posterRef.current.scale.set(scale, scale, 1);
      }

      // Slide in details from right
      if (detailsRef.current) {
        const detailsProgress = Math.max(0, (progress - 0.4) / 0.6);
        detailsRef.current.position.x = 4 + detailsProgress * 0;
        detailsRef.current.scale.set(detailsProgress, detailsProgress, 1);
      }

      // Fade in close button
      if (closeButtonRef.current) {
        const buttonProgress = Math.max(0, (progress - 0.6) / 0.4);
        closeButtonRef.current.scale.set(buttonProgress, buttonProgress, 1);
      }
    }
  });

  const easeOutCubic = (t) => {
    return 1 - Math.pow(1 - t, 3);
  };

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Poster with flip animation */}
      <group ref={posterRef} position={[-3.2, 0, 0]}>
        {/* Front face - Poster */}
        <mesh>
          <planeGeometry args={[3, 4.5]} />
          <meshStandardMaterial
            map={posterTexture}
            side={THREE.FrontSide}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Back face - Details */}
        <mesh rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3, 4.5]} />
          <meshStandardMaterial
            color="#ffffff"
            side={THREE.FrontSide}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Details Panel */}
      <group ref={detailsRef} position={[4, 0, 0]}>
        <mesh>
          <planeGeometry args={[6, 9]} />
          <meshStandardMaterial
            map={detailsTexture}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>

        {/* Panel border/shadow effect */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[6.2, 9.2]} />
          <meshStandardMaterial
            color="#cccccc"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* Close Button */}
      <mesh
        ref={closeButtonRef}
        position={[7.5, 4, 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial
          map={closeButtonTexture}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default MovieDialog;
