"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function WavePlane() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#999999") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.x * 0.8 + uTime) * 0.12;
          pos.z += cos(pos.y * 1.1 + uTime * 0.7) * 0.08;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float edge = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
          float alpha = 0.28 * edge;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      wireframe: true,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime * 0.3;
  });

  return (
    <mesh rotation={[-0.3, 0, 0]} position={[0, 0, 0]} material={material}>
      <planeGeometry args={[14, 8, 48, 48]} />
    </mesh>
  );
}

export function WebGLCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true }}
    >
      <WavePlane />
    </Canvas>
  );
}
