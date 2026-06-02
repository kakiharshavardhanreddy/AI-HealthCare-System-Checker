"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function Globe() {
  const group = useRef<THREE.Group>(null);
  const meridians = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) =>
        Array.from({ length: 90 }, (_, p) => {
          const phi = (p / 89) * Math.PI;
          const theta = (index / 10) * Math.PI * 2;
          return new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
        })
      ),
    []
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.2;
    group.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.8) * 0.018);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial color="#071c32" roughness={0.35} metalness={0.2} emissive="#002a3a" wireframe />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
      {meridians.map((line, index) => (
        <Line key={index} points={line} color={index % 2 ? "#00d4ff" : "#10b981"} transparent opacity={0.35} lineWidth={0.7} />
      ))}
      <mesh position={[0, 0, 1.9]}>
        <boxGeometry args={[0.18, 0.78, 0.06]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <mesh position={[0, 0, 1.9]}>
        <boxGeometry args={[0.78, 0.18, 0.06]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(900);
    for (let index = 0; index < values.length / 3; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 7;
      values[index * 3 + 1] = (Math.random() - 0.5) * 5;
      values[index * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return values;
  }, []);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00d4ff" size={0.018} transparent opacity={0.65} />
    </points>
  );
}

export function MedicalGlobeScene({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[4, 3, 4]} color="#00d4ff" intensity={4} />
          <Globe />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}
