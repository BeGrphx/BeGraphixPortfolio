"use client";

import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh, ShaderMaterial } from "three";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.12;
    float wave = sin(uv.x * 4.0 + t) * cos(uv.y * 3.0 - t * 0.8);
    float blend = uv.y + wave * 0.18;
    vec3 color = mix(uColorA, uColorB, clamp(blend, 0.0, 1.0));
    color += vec3(0.08, 0.04, 0.12) * sin(t + uv.x * 6.0) * 0.5;
    gl_FragColor = vec4(color, 0.55);
  }
`;

function ShaderPlane({ showShader }: { showShader: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#6366f1") },
      uColorB: { value: new THREE.Color("#ec4899") },
    }),
    [],
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (!showShader) return null;

  return (
    <mesh position={[0, 0, -2]} scale={[12, 8, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function FloatingMesh({ show3d }: { show3d: boolean }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  if (!show3d) return null;

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={[2.2, 0.3, 0.5]}>
        <icosahedronGeometry args={[0.85, 2]} />
        <MeshDistortMaterial
          color="#a78bfa"
          emissive="#4c1d95"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.6}
          distort={0.35}
          speed={1.5}
          transparent
          opacity={0.75}
        />
      </mesh>
    </Float>
  );
}

function ParticleField({ showParticles }: { showParticles: boolean }) {
  if (!showParticles) return null;
  return (
    <Stars
      radius={80}
      depth={40}
      count={1200}
      factor={2.5}
      saturation={0.4}
      fade
      speed={0.4}
    />
  );
}

export interface HeroWebGLCanvasProps {
  showShader: boolean;
  show3d: boolean;
  showParticles: boolean;
  parallaxY?: number;
}

export function HeroWebGLCanvas({
  showShader,
  show3d,
  showParticles,
  parallaxY = 0,
}: HeroWebGLCanvasProps) {
  return (
    <div
      className="absolute inset-0"
      style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 4]} intensity={1.2} color="#c4b5fd" />
        <ShaderPlane showShader={showShader} />
        <FloatingMesh show3d={show3d} />
        <ParticleField showParticles={showParticles} />
      </Canvas>
    </div>
  );
}
