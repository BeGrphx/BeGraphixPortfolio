"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function WavePlane() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#666666") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.x * 2.0 + uTime) * 0.15;
          pos.z += cos(pos.y * 3.0 + uTime * 0.8) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float alpha = 0.35 * (1.0 - vUv.y);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      wireframe: true,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime * 0.5;
  });

  return (
    <mesh ref={mesh} rotation={[-0.4, 0, 0]} position={[0, 0, -1]} material={material}>
      <planeGeometry args={[8, 4, 64, 64]} />
    </mesh>
  );
}

export function WebGLCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }} dpr={[1, 1.5]}>
      <WavePlane />
    </Canvas>
  );
}
