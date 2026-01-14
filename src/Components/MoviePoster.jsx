import React, { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { SpringValue } from "../Utils/physicsSystem";

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function MoviePoster({
  movie,
  position,
  rotation,
  scale,
  onClick,
  scrollStateRef,
  tiltRef,
  cylinderEffectRef,
  cylinderRadius,
  isDialogOpen,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const texture = useLoader(TextureLoader, movie.posterUrl);

  const randomTilt = useRef(null);
  if (!randomTilt.current) {
    const seed = movie.id || movie.title.length;

    randomTilt.current = {
      x: (seededRandom(seed) - 0.5) * 0.15,
      y: (seededRandom(seed + 1) - 0.5) * 0.1,
      z: (seededRandom(seed + 2) - 0.5) * 0.15,
    };
  }

  const scaleSpring = useRef(new SpringValue(scale, 0.5, 0.25));
  const scrollTiltSpringX = useRef(new SpringValue(0, 0.3, 0.7));
  const scrollTiltSpringZ = useRef(new SpringValue(0, 0.3, 0.7));

  const rotationSpring = useRef(null);
  if (!rotationSpring.current && randomTilt.current) {
    rotationSpring.current = {
      x: new SpringValue(randomTilt.current.x, 0.1, 0.8),
      y: new SpringValue(rotation + randomTilt.current.y, 0.1, 0.8),
      z: new SpringValue(randomTilt.current.z, 0.1, 0.8),
    };
  }

  useFrame((state) => {
    if (!meshRef.current || !rotationSpring.current || isDialogOpen) return;

    const cylinderEffectStrength = cylinderEffectRef.current;
    const angleOffset = (position[1] / cylinderRadius) * 1.2;
    const cylinderZ = (Math.cos(angleOffset) - 1) * cylinderRadius * 0.8;

    const finalX = position[0];
    const finalY = position[1];
    const finalZ =
      position[2] * (1 - cylinderEffectStrength) +
      cylinderZ * cylinderEffectStrength;

    meshRef.current.position.x = finalX;
    meshRef.current.position.y = finalY;
    meshRef.current.position.z = finalZ;

    const tiltRotationX = -Math.sin(angleOffset) * cylinderEffectStrength * 0.5;
    const scrollDamp = 1 - Math.min(0.6, cylinderEffectStrength);

    scaleSpring.current.setTarget(
      clicked ? scale * 0.85 : hovered ? scale * (1 + 0.05 * scrollDamp) : scale
    );

    const currentScale = scaleSpring.current.update();
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    scrollTiltSpringX.current.setTarget(tiltRef.current.x);
    scrollTiltSpringZ.current.setTarget(tiltRef.current.z);
    const scrollTiltX = scrollTiltSpringX.current.update();
    const scrollTiltZ = scrollTiltSpringZ.current.update();

    if (hovered && !clicked) {
      rotationSpring.current.x.setTarget(
        randomTilt.current.x + state.mouse.y * 0.1 + scrollTiltX + tiltRotationX
      );
      rotationSpring.current.z.setTarget(
        randomTilt.current.z - state.mouse.x * 0.1 + scrollTiltZ
      );
    } else {
      rotationSpring.current.x.setTarget(
        randomTilt.current.x + scrollTiltX + tiltRotationX
      );
      rotationSpring.current.z.setTarget(randomTilt.current.z + scrollTiltZ);
    }

    const curveRotationY = angleOffset * cylinderEffectStrength * 0.00012;

    meshRef.current.rotation.x = rotationSpring.current.x.update();
    meshRef.current.rotation.y =
      rotation + randomTilt.current.y + curveRotationY;
    meshRef.current.rotation.z = rotationSpring.current.z.update();

    const time = state.clock.getElapsedTime();
    const floatOffset = Math.sin(time * 0.5 + position[0]) * 0.05;
    meshRef.current.position.y += floatOffset;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);

    setTimeout(() => {
      onClick(movie);
      setClicked(false);
    }, 200);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => !isDialogOpen && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[2.5, 3.7]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

export default MoviePoster;
