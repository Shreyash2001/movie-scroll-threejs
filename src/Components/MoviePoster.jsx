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
  orbitRef, // NEW
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

  // stable per-card phase offset so the grid "swirls" instead of moving rigidly
  const phaseOffset = useRef(null);
  if (phaseOffset.current === null) {
    const seed = movie.id || movie.title.length;
    phaseOffset.current = (seededRandom(seed + 99) - 0.5) * Math.PI * 1.8;
  }

  const scaleSpring = useRef(new SpringValue(scale, 0.5, 0.25));
  const depthSpring = useRef(new SpringValue(0, 0.05, 0.85));

  // scroll tilt spring
  const scrollTiltSpringX = useRef(new SpringValue(0, 0.3, 0.7));
  const scrollTiltSpringZ = useRef(new SpringValue(0, 0.3, 0.7));

  // orbit springs (x/y/z offsets)
  const orbitSpring = useRef({
    x: new SpringValue(0, 0.25, 0.75),
    y: new SpringValue(0, 0.25, 0.75),
    z: new SpringValue(0, 0.25, 0.75),
  });

  const rotationSpring = useRef(null);
  if (!rotationSpring.current && randomTilt.current) {
    rotationSpring.current = {
      x: new SpringValue(randomTilt.current.x, 0.1, 0.8),
      y: new SpringValue(rotation + randomTilt.current.y, 0.1, 0.8),
      z: new SpringValue(randomTilt.current.z, 0.1, 0.8),
    };
  }

  useFrame((state) => {
    if (!meshRef.current || !rotationSpring.current) return;

    const isScrolling = scrollStateRef.current.isScrolling;

    // keep your depth push-in while scrolling (reduced a bit because orbit adds z too)
    depthSpring.current.setTarget(isScrolling ? -0.35 : 0);
    const depthOffset = depthSpring.current.update();

    // shared orbit (synced), plus per-card phase offset to create circular field motion
    const orbit = orbitRef?.current || {
      x: 0,
      y: 0,
      z: 0,
      energy: 0,
      phase: 0,
    };
    const p = (orbit.phase || 0) + phaseOffset.current;

    // make x/y/z vary per card (swirl). This is a sin/cos orbit pattern used for circular motion. [web:4]
    const oxT = orbit.x * (0.65 + 0.35 * Math.sin(p));
    const oyT = orbit.y * (0.65 + 0.35 * Math.cos(p * 0.9));
    const ozT = orbit.z * (0.65 + 0.35 * Math.sin(p * 1.1));

    orbitSpring.current.x.setTarget(oxT);
    orbitSpring.current.y.setTarget(oyT);
    orbitSpring.current.z.setTarget(ozT);

    const ox = orbitSpring.current.x.update();
    const oy = orbitSpring.current.y.update();
    const oz = orbitSpring.current.z.update();

    meshRef.current.position.x = position[0] + ox;
    meshRef.current.position.y = position[1] + oy;
    meshRef.current.position.z = position[2] + depthOffset + oz;

    // scale with depth
    const depthScaleFactor = 1 + depthOffset * 0.04;

    scaleSpring.current.setTarget(
      clicked ? scale * 0.3 : hovered ? scale * 1.05 : scale
    );

    const currentScale = scaleSpring.current.update();
    const finalScale = currentScale * depthScaleFactor;
    meshRef.current.scale.set(finalScale, finalScale, finalScale);

    // Apply scroll tilt (synced across all cards)
    scrollTiltSpringX.current.setTarget(tiltRef.current.x);
    scrollTiltSpringZ.current.setTarget(tiltRef.current.z);
    const scrollTiltX = scrollTiltSpringX.current.update();
    const scrollTiltZ = scrollTiltSpringZ.current.update();

    // add a tiny yaw/roll from orbit energy for extra 3D circular feeling
    const orbitEnergy = orbit.energy || 0;
    const yawExtra = orbitEnergy * 0.12 * Math.sin(p);
    const rollExtra = orbitEnergy * 0.08 * Math.cos(p * 1.2);

    if (hovered && !clicked) {
      rotationSpring.current.x.setTarget(
        randomTilt.current.x + state.mouse.y * 0.1 + scrollTiltX
      );
      rotationSpring.current.z.setTarget(
        randomTilt.current.z - state.mouse.x * 0.1 + scrollTiltZ
      );
    } else {
      rotationSpring.current.x.setTarget(randomTilt.current.x + scrollTiltX);
      rotationSpring.current.z.setTarget(randomTilt.current.z + scrollTiltZ);
    }

    meshRef.current.rotation.x = rotationSpring.current.x.update();
    meshRef.current.rotation.y = rotation + randomTilt.current.y + yawExtra;
    meshRef.current.rotation.z = rotationSpring.current.z.update() + rollExtra;

    // subtle float (keep yours)
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
    }, 400);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
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
