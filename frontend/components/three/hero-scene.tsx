"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function MedicalGlobe() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.16;
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.2) * 0.02);
  });

  return (
    <group ref={ref} position={[1.7, 0.25, 0]}>
      <mesh>
        <sphereGeometry args={[2.15, 96, 96]} />
        <meshStandardMaterial color="#062b3d" emissive="#00334a" emissiveIntensity={0.75} roughness={0.35} wireframe />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[2.15, 96, 96]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[2.15, 64, 64]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.045} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function OrbitingIcon({ type, radius, speed, phase }: { type: string; radius: number; speed: number; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (!ref.current) return;
    ref.current.position.set(1.7 + Math.cos(t) * radius, Math.sin(t * 0.8) * 1.3, Math.sin(t) * radius * 0.55);
    ref.current.rotation.y += 0.02;
    ref.current.rotation.x = Math.sin(clock.elapsedTime + phase) * 0.18;
  });

  return (
    <group ref={ref}>
      <pointLight color={type === "heart" ? "#ef4444" : type === "brain" ? "#7c3aed" : "#00d4ff"} intensity={1.5} distance={3} />
      {type === "heart" ? (
        <group scale={0.22}>
          <mesh position={[-0.35, 0.2, 0]}>
            <sphereGeometry args={[0.45, 18, 18]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.35, 0.2, 0]}>
            <sphereGeometry args={[0.45, 18, 18]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]} position={[0, -0.25, 0]}>
            <boxGeometry args={[0.72, 0.72, 0.35]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      ) : type === "pill" ? (
        <mesh scale={[0.42, 0.18, 0.18]}>
          <capsuleGeometry args={[0.5, 1.1, 8, 18]} />
          <meshBasicMaterial color="#f0f9ff" />
        </mesh>
      ) : type === "stethoscope" ? (
        <mesh>
          <torusGeometry args={[0.28, 0.035, 8, 32]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      ) : type === "brain" ? (
        <mesh>
          <icosahedronGeometry args={[0.34, 2]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.8} wireframe />
        </mesh>
      ) : type === "dna" ? (
        <Line
          points={Array.from({ length: 32 }, (_, i) => new THREE.Vector3(Math.cos(i * 0.45) * 0.22, (i - 16) * 0.025, Math.sin(i * 0.45) * 0.22))}
          color="#00d4ff"
          lineWidth={2}
        />
      ) : (
        <group scale={0.32}>
          <mesh>
            <boxGeometry args={[0.2, 1, 0.08]} />
            <meshBasicMaterial color="#00d4ff" />
          </mesh>
          <mesh>
            <boxGeometry args={[1, 0.2, 0.08]} />
            <meshBasicMaterial color="#00d4ff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function HeartbeatWave() {
  const ref = useRef<THREE.Group>(null);
  const points = useMemo(
    () =>
      Array.from({ length: 170 }, (_, index) => {
        const x = -5 + (index / 169) * 10;
        const pulse = Math.sin(index * 0.22) * 0.08 + (index % 42 === 0 ? 0.8 : index % 42 === 2 ? -0.45 : 0);
        return new THREE.Vector3(x, pulse - 2.35, 0);
      }),
    []
  );
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = Math.sin(clock.elapsedTime * 1.8) * 0.22;
  });
  return (
    <group ref={ref}>
      <Line points={points} color="#10b981" lineWidth={3} transparent opacity={0.85} />
    </group>
  );
}

function ParticleBreath() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 5000;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 2.8 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      data[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      data[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      data[i * 3 + 2] = r * Math.cos(phi);
    }
    return data;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.8) * 0.06);
    ref.current.rotation.y += 0.0008;
  });
  return (
    <points ref={ref} position={[1.7, 0.2, -0.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00d4ff" size={0.012} transparent opacity={0.38} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 52 }} dpr={[1, 1.7]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[4, 3, 5]} color="#00d4ff" intensity={5} />
          <pointLight position={[-3, -2, 2]} color="#7c3aed" intensity={2.5} />
          <ParticleBreath />
          <MedicalGlobe />
          {["heart", "dna", "pill", "stethoscope", "cross", "brain"].map((type, index) => (
            <OrbitingIcon key={type} type={type} radius={2.9 + index * 0.12} speed={0.34 + index * 0.035} phase={index * 1.04} />
          ))}
          <HeartbeatWave />
        </Suspense>
      </Canvas>
    </div>
  );
}
