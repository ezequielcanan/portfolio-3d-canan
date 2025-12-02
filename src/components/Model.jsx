import React, { useEffect, useRef, useState } from "react";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";
import Smoke from "./Experience/Smoke";
import html2canvas from "html2canvas";
import { Html } from "@react-three/drei";

const Model = ({ url }) => {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);
    return loader;
  });

  const { camera, gl, scene } = useThree();
  const modelRef = useRef();
  const blinkMeshes = useRef([]);
  const rotatingRings = useRef([]);
  const [smokeGenerators, setSmokeGenerators] = useState([]);

  useEffect(() => {
    const model = gltf.scene;
    if (!model) return;

    model.traverse((child) => {
      if (child.name.includes("ring") && !rotatingRings.current.find(r => r.name === child.name)) {
        rotatingRings.current.push(child);
      }

      if (child.name.includes("smoke")) {
        setSmokeGenerators(prev => {
          return !prev.find(g => g.name === child.name) ? [...prev, child] : prev;
        });
      }

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.metalness = 0.1;

        if (child.name === "Console") {
          // vertex shader
          const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vViewPos;

            void main() {
              vNormal = normalize( normalMatrix * normal );
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              vViewPos = mvPos.xyz;
              gl_Position = projectionMatrix * mvPos;
            }
          `;

          const fragmentShader = `
            precision mediump float;
            uniform vec3 uBaseColor;
            uniform vec3 uEdgeColor;
            uniform float uBaseAlpha;
            uniform float uEdgeOpacity;
            uniform float uEdgeThreshold;
            uniform float uEdgeWidth;
            uniform float uEdgeFalloff;

            varying vec3 vNormal;
            varying vec3 vViewPos;

            void main() {
              vec3 N = normalize(vNormal);
              vec3 V = normalize(-vViewPos);
              float f = pow(1.0 - max(dot(N, V), 0.0), uEdgeFalloff);
              float rimMask = smoothstep(uEdgeThreshold, uEdgeThreshold + uEdgeWidth, f);
              vec3 base = uBaseColor;
              vec3 edge = uEdgeColor;
              vec3 color = mix(base, edge, rimMask * uEdgeOpacity);
              float alpha = max(uBaseAlpha, rimMask * uEdgeOpacity);
              gl_FragColor = vec4(color, alpha);
            }
          `;

          if (child.geometry && !child.geometry.hasAttribute('normal')) {
            child.geometry.computeVertexNormals();
          }

          const consoleMat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              uBaseColor: { value: new THREE.Color(0.996, 0.627, 0) },
              uEdgeColor: { value: new THREE.Color(0.996, 0.627, 0) },
              uBaseAlpha: { value: 0 },
              uEdgeOpacity: { value: 0.5 },
              uEdgeThreshold: { value: 0.60 },
              uEdgeWidth: { value: 0.18 },
              uEdgeFalloff: { value: 2.0 }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            toneMapped: false
          });

          child.material?.dispose?.();
          child.material = consoleMat;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }

        if (child.material) {
          child.material.needsUpdate = true;
          child.material.toneMapped = false;
          if (child?.material?.emissive?.r > 0 || child?.material?.emissive?.g > 0 || child?.material?.emissive?.b > 0) {
            child.material.emissiveIntensity = child.material.name != "Orange" ? 1 : 3;
            if (child.parent.name.includes("Island") && child.material.name.includes("Blue")) {
              blinkMeshes.current.push(child);
            }
          } else {
            child.material.roughness = 1;
          }
        }

        if (child.name == "Skills_Building_Projection_Base") {
          const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPos;

            void main() {
              vUv = uv;
              vPos = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `;

          const fragmentShader = `
            precision mediump float;
            varying vec2 vUv;
            varying vec3 vPos;

            uniform vec3 uEmissiveColor;
            uniform float uIntensity;
            uniform float uOpacity;
            uniform float uGradientPower;
            uniform float uHalfY;
            uniform float uEps;
            uniform float uAlphaThreshold;

            void main() {
              if (vPos.y > (uHalfY - uEps)) {
                discard;
              }
              float gradient = 1.0 - vUv.y;
              gradient = pow(clamp(gradient, 0.0, 1.0), uGradientPower);
              float alpha = clamp(gradient * uOpacity, 0.0, 1.0);
              if (alpha < uAlphaThreshold) discard;
              vec3 color = uEmissiveColor * uIntensity;
              gl_FragColor = vec4(color, alpha);
            }
          `;

          const geometry = new THREE.BoxGeometry(child.scale.x, child.scale.y, child.scale.z);
          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              uEmissiveColor: { value: new THREE.Color(1, 1, 1) },
              uIntensity: { value: 1.0 },
              uOpacity: { value: 1.0 },
              uGradientPower: { value: 1.0 },
              uHalfY: { value: child.scale.y * 0.5 },
              uEps: { value: 1e-4 },
              uAlphaThreshold: { value: 0.01 }
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          });

          material.uniforms.uEmissiveColor.value.set(0.996, 0.627, 0);
          material.uniforms.uIntensity.value = 0.8;
          material.uniforms.uOpacity.value = 0.1;
          material.uniforms.uGradientPower.value = 0.8;
          material.uniforms.uAlphaThreshold.value = 0.02;

          const square = new THREE.Mesh(geometry, material);
          square.position.set(child.position.x, child.position.y + 0.065, child.position.z);
          scene.add(square);
        }
      }
    });

    gl.render(scene, camera);
    if (modelRef.current == null) modelRef.current = model;
  }, [gltf, camera, gl, scene]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    blinkMeshes.current.forEach((mesh, i) => {
      if (!mesh || !mesh.material) return;
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const phase = mesh.userData.blinkPhase ?? 0;
      const speed = mesh.userData.blinkSpeed ?? 0.5;
      const base = mesh.userData.originalEmissiveIntensity ?? 1.0;

      const amplitude = 1;
      const offset = 0.2;
      const raw = offset + (0.5 + 0.5 * Math.sin(t * speed + phase)) * amplitude;
      const smooth = 0.12;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity ?? base, raw * base, smooth);
    });
    
    rotatingRings.current.forEach((ring, i) => {
      ring.rotation.y += ((i % 2) ? 1 : -1) * delta * 0.3;
    });
  });

  return (
    <>
      <primitive object={gltf.scene} />
      
      {smokeGenerators.length ? (
        smokeGenerators?.map(generator => {
          return <Smoke key={generator.name} radius={0.01} size={10} count={250} speed={0.3} color={"#FEA000"} position={[generator.position.x, generator.position.y + 0.3, generator.position.z]} scale={[0.5, 0.2, 0.5]} />
        })
      ) : null}
      </>
  );
}

export default Model;