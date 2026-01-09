import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GradientBackground = () => {
  const materialRef = useRef();

  // Colors extracted from your Syntone image, slightly boosted for visibility
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Deep Black/Navy Base
      uColorStart: { value: new THREE.Color("#000000") },
      // Rich Dark Blue (Syntone Primary)
      uColorMid: { value: new THREE.Color("#00143C") },
      // Lighter Blue Highlight (Visible Gradient)
      uColorEnd: { value: new THREE.Color("#003566") },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      // Slow down time for a subtle "lively" effect
      materialRef.current.uniforms.uTime.value =
        state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh renderOrder={-1}>
      {/* 2x2 Plane covers the -1 to 1 Clip Space coordinates */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        depthTest={false} // Always render behind everything
        depthWrite={false} // Do not write to depth buffer
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            // Force z=1.0 (max depth) but disable depth test so it acts as background
            // position is -1 to 1 (from planeGeometry), so this covers full screen
            gl_Position = vec4(position, 1.0); 
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColorStart;
          uniform vec3 uColorMid;
          uniform vec3 uColorEnd;
          varying vec2 vUv;

          // Simplex Noise Function
          vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }

          void main() {
            // Generate slow-moving noise pattern
            float noiseVal = snoise(vUv * 1.5 + uTime * 0.2);
            
            // Mix colors: Diagonal gradient + Noise influence
            // 1. Base mix from Black to Dark Blue (Vertical)
            vec3 color = mix(uColorStart, uColorMid, vUv.y + noiseVal * 0.1);
            
            // 2. Add Lighter Blue highlights (Horizontal + Noise)
            float highlight = smoothstep(0.3, 1.2, vUv.x + vUv.y + noiseVal * 0.4);
            color = mix(color, uColorEnd, highlight);

            // Add "Syntone" style grain (Dithering)
            float grain = (fract(sin(dot(vUv.xy * uTime, vec2(12.9898,78.233))) * 43758.5453) - 0.5) * 0.03;
            color += grain;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

export default GradientBackground;
