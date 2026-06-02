"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function Network() {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () => Array.from({ length: 54 }, () => new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3)),
    []
  );
  const edges = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach((other) => {
        if (node.distanceTo(other) < 1.05) lines.push([node, other]);
      });
    });
    return lines.slice(0, 90);
  }, [nodes]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.16;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.14;
  });
  return (
    <group ref={group}>
      {edges.map((edge, index) => (
        <Line key={index} points={edge} color="#00d4ff" lineWidth={0.8} transparent opacity={0.18} />
      ))}
      {nodes.map((node, index) => (
        <mesh key={index} position={node}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color={index % 3 === 0 ? "#10b981" : "#7c3aed"} />
        </mesh>
      ))}
    </group>
  );
}

export function NeuralNetworkScene() {
  return (
    <div className="h-[420px] w-full">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 55 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 4]} color="#00d4ff" intensity={4} />
          <Network />
        </Suspense>
      </Canvas>
    </div>
  );
}
