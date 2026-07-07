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
        uColor: { value: new THREE.Color("#aaaaaa") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.x * 1.2 + uTime) * 0.18;
          pos.z += cos(pos.y * 1.8 + uTime * 0.6) * 0.12;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float fade = smoothstep(0.0, 0.15, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y));
          float alpha = 0.35 * fade;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      wireframe: true,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime * 0.35;
  });

  return (
    <mesh ref={mesh} rotation={[-0.25, 0, 0]} position={[0, 0.2, 0]} material={material}>
      <planeGeometry args={[30, 18, 64, 64]} />
    </mesh>
  );
}

export function WebGLCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true }}
    >
      <WavePlane />
    </Canvas>
  );
}
