"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

export function PatientAvatarScene({ age, gender }: { age: number; gender: string }) {
  return (
    <div className="h-72 w-full">
      <Canvas camera={{ position: [0, 0.2, 4.8], fov: 45 }}>
        <Suspense fallback={null}>
          <PatientAvatarInner age={age} gender={gender} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function PatientAvatarInner({ age, gender }: { age: number; gender: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.25;
      group.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.05;
    }
  });
  const scale = age > 65 ? 0.92 : age < 18 ? 0.78 : 1;
  const color = gender === "female" ? "#00d4ff" : gender === "male" ? "#10b981" : "#7c3aed";
  const spring = useSpring({ scale, config: { tension: 120, friction: 18 } });
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} color={color} intensity={4} />
      <animated.group ref={group} scale={spring.scale}>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.72} wireframe />
        </mesh>
        <mesh position={[0, 0.25, 0]} scale={[0.55, 1.05, 0.28]}>
          <capsuleGeometry args={[0.65, 1.2, 12, 32]} />
          <meshStandardMaterial color="#0a1628" emissive={color} emissiveIntensity={0.28} transparent opacity={0.82} wireframe />
        </mesh>
        <Line points={[[-0.58, 0.38, 0], [-1.15, -0.25, 0], [-0.88, -0.9, 0]]} color={color} lineWidth={3} />
        <Line points={[[0.58, 0.38, 0], [1.15, -0.25, 0], [0.88, -0.9, 0]]} color={color} lineWidth={3} />
        <Line points={[[-0.28, -0.78, 0], [-0.44, -1.85, 0]]} color={color} lineWidth={4} />
        <Line points={[[0.28, -0.78, 0], [0.44, -1.85, 0]]} color={color} lineWidth={4} />
      </animated.group>
    </>
  );
}

export function AnalysisBrainScene({ progress }: { progress: number }) {
  return (
    <div className="h-[420px] w-full">
      <Canvas camera={{ position: [0, 0, 5.8], fov: 50 }}>
        <Suspense fallback={null}>
          <AnalysisBrainInner progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function AnalysisBrainInner({ progress }: { progress: number }) {
  const brain = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(900);
    for (let i = 0; i < data.length / 3; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 7;
      data[i * 3 + 1] = (Math.random() - 0.5) * 5;
      data[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (brain.current) {
      brain.current.rotation.y += 0.01;
      brain.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.6) * 0.04);
    }
    if (rings.current) rings.current.rotation.z += 0.006;
    if (particles.current) {
      particles.current.rotation.y -= 0.004;
      particles.current.scale.setScalar(1 - progress * 0.002);
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 3, 3]} color="#00d4ff" intensity={5} />
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#00d4ff" size={0.025} transparent opacity={0.55} />
      </points>
      <mesh ref={brain}>
        <icosahedronGeometry args={[1.15, 4]} />
        <meshStandardMaterial color={progress > 65 ? "#00d4ff" : "#7c3aed"} emissive={progress > 65 ? "#00d4ff" : "#7c3aed"} emissiveIntensity={0.6} wireframe />
      </mesh>
      <group ref={rings}>
        {[1.6, 2, 2.45].map((radius, index) => (
          <mesh key={radius} rotation={[Math.PI / 2 + index * 0.35, index * 0.45, 0]}>
            <torusGeometry args={[radius, 0.01 + index * 0.004, 8, 120, Math.PI * 2 * Math.min(progress / 100 + index * 0.08, 1)]} />
            <meshBasicMaterial color={index % 2 ? "#7c3aed" : "#00d4ff"} transparent opacity={0.75} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function HealthGlobeWidget() {
  return (
    <div className="h-[300px] w-full">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 48 }}>
        <Suspense fallback={null}>
          <HealthGlobeInner />
        </Suspense>
      </Canvas>
    </div>
  );
}

function HealthGlobeInner() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.25;
  });
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 3, 3]} color="#00d4ff" intensity={4} />
      <mesh ref={ref}>
        <sphereGeometry args={[1.25, 48, 48]} />
        <meshStandardMaterial color="#062b3d" emissive="#00d4ff" emissiveIntensity={0.16} wireframe />
      </mesh>
      {Array.from({ length: 16 }).map((_, index) => {
        const theta = index * 1.9;
        const phi = 0.7 + (index % 5) * 0.42;
        return (
          <mesh key={index} position={[Math.sin(phi) * Math.cos(theta) * 1.28, Math.cos(phi) * 1.28, Math.sin(phi) * Math.sin(theta) * 1.28]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshBasicMaterial color={index % 2 ? "#10b981" : "#00d4ff"} />
          </mesh>
        );
      })}
    </>
  );
}
