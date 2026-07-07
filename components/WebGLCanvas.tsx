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
        uColor: { value: new THREE.Color("#888888") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.x * 1.5 + uTime) * 0.2;
          pos.z += cos(pos.y * 2.0 + uTime * 0.7) * 0.15;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float alpha = 0.45 * (1.0 - abs(vUv.y - 0.5));
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      wireframe: true,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime * 0.4;
  });

  return (
    <mesh
      ref={mesh}
      rotation={[-0.35, 0, 0]}
      position={[0, 0, 0]}
      scale={[2.2, 2.2, 1]}
      material={material}
    >
      <planeGeometry args={[24, 14, 80, 80]} />
    </mesh>
  );
}

export function WebGLCanvas() {
  return (
    <Canvas
      className="!h-full !w-full"
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 1.5]}
    >
      <WavePlane />
    </Canvas>
  );
}
