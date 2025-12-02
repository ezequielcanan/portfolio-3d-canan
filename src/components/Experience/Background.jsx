// src/Background.jsx
import React, { useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Stars, Sparkles } from "@react-three/drei";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";

export default function Background() {
  const { scene } = useThree();
  const nebula = useLoader(TextureLoader, "/textures/nebula.jpg");

  useEffect(() => {
    if (nebula) {
      nebula.encoding = THREE.sRGBEncoding;
      nebula.wrapS = nebula.wrapT = THREE.RepeatWrapping;
    }
  }, [nebula, scene]);

  return (
    <>
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1}/>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.01}
          luminanceSmoothing={0.5}
          intensity={0.5}
        />
      </EffectComposer>
    </>
  );
}
