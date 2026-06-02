"use client";

import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

import { useMediaQuery } from "@/hooks/use-media-query";

function StarField({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = mobile ? 1600 : 8000;
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color("#ffffff"), new THREE.Color("#00d4ff"), new THREE.Color("#7c3aed")];
    for (let i = 0; i < count; i += 1) {
      const radius = 22 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const color = palette[i % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0001;
    const material = ref.current.material as THREE.PointsMaterial;
    material.opacity = 0.6 + Math.sin(clock.elapsedTime * 1.6) * 0.18;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors transparent opacity={0.7} size={mobile ? 0.024 : 0.018} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function DnaHelix() {
  const group = useRef<THREE.Group>(null);
  const curves = useMemo(() => {
    const make = (offset: number) =>
      Array.from({ length: 120 }, (_, index) => {
        const t = index / 9;
        return new THREE.Vector3(Math.cos(t + offset) * 0.75, (index - 60) * 0.035, Math.sin(t + offset) * 0.75);
      });
    return [make(0), make(Math.PI)];
  }, []);

  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.004;
  });

  return (
    <group ref={group} position={[4.5, 0.4, -2]} rotation={[0.25, 0, 0]}>
      <Line points={curves[0]} color="#00d4ff" lineWidth={2} transparent opacity={0.6} />
      <Line points={curves[1]} color="#7c3aed" lineWidth={2} transparent opacity={0.45} />
      {curves[0].filter((_, index) => index % 10 === 0).map((point, index) => (
        <Line
          key={index}
          points={[point, curves[1][index * 10]]}
          color="#00d4ff"
          lineWidth={0.7}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  );
}

function NeuralParticles({ mobile }: { mobile: boolean }) {
  const points = useMemo(() => {
    const count = mobile ? 50 : 200;
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 6),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.006)
    }));
  }, [mobile]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const matrixHelper = useMemo(() => new THREE.Object3D(), []);
  const linePositions = useMemo(() => new Float32Array(points.length * 6 * 4), [points.length]);

  useFrame(() => {
    let cursor = 0;
    points.forEach((point, index) => {
      point.position.add(point.velocity);
      ["x", "y", "z"].forEach((axis) => {
        const key = axis as "x" | "y" | "z";
        if (Math.abs(point.position[key]) > 4) point.velocity[key] *= -1;
      });
      matrixHelper.position.copy(point.position);
      matrixHelper.updateMatrix();
      mesh.current?.setMatrixAt(index, matrixHelper.matrix);
    });
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < Math.min(points.length, i + 8); j += 1) {
        if (points[i].position.distanceTo(points[j].position) < 1.25 && cursor < linePositions.length - 6) {
          linePositions.set(points[i].position.toArray(), cursor);
          linePositions.set(points[j].position.toArray(), cursor + 3);
          cursor += 6;
        }
      }
    }
    linePositions.fill(0, cursor);
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
    if (lines.current) {
      const attr = lines.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      attr.needsUpdate = true;
      lines.current.geometry.setDrawRange(0, cursor / 3);
    }
  });

  return (
    <group position={[-2.5, 0.2, -2.5]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.75} />
      </instancedMesh>
      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
}

function MedicalCrosses() {
  const group = useRef<THREE.Group>(null);
  const crosses = useMemo(
    () =>
      Array.from({ length: 15 }, () => ({
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 6,
        z: -2 - Math.random() * 8,
        speed: 0.003 + Math.random() * 0.004,
        scale: 0.12 + Math.random() * 0.18
      })),
    []
  );

  useFrame(() => {
    group.current?.children.forEach((child, index) => {
      child.position.y += crosses[index].speed;
      child.rotation.z += 0.004;
      if (child.position.y > 3.5) child.position.y = -3.5;
    });
  });

  return (
    <group ref={group}>
      {crosses.map((cross, index) => (
        <group key={index} position={[cross.x, cross.y, cross.z]} scale={cross.scale}>
          <mesh>
            <boxGeometry args={[0.22, 1, 0.02]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
          </mesh>
          <mesh>
            <boxGeometry args={[1, 0.22, 0.02]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GridFloor() {
  return (
    <gridHelper args={[22, 44, "#00d4ff", "#00d4ff"]} position={[0, -3, 0]} rotation={[0, 0, 0]}>
      <meshBasicMaterial attach="material" color="#00d4ff" transparent opacity={0.05} />
    </gridHelper>
  );
}

function Scene({ mobile }: { mobile: boolean }) {
  return (
    <>
      <fog attach="fog" args={["#020817", 7, 24]} />
      <ambientLight intensity={0.35} />
      <StarField mobile={mobile} />
      <DnaHelix />
      <NeuralParticles mobile={mobile} />
      <MedicalCrosses />
      <GridFloor />
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.3} />
        <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} radialModulation={false} modulationOffset={0} />
        <Vignette darkness={0.6} eskil={false} />
      </EffectComposer>
    </>
  );
}

export default function GlobalBackground() {
  const mobile = useMediaQuery("(max-width: 640px)");
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-gradient">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, mobile ? 1.25 : 1.75]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <Scene mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
