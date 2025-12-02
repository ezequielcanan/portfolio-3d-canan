import React, { useRef, useMemo, useEffect, useContext, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import Loader from "../Loader";
import { ContentContext } from "../../context/ContentContext";
import { RigidBody } from "@react-three/rapier";
import Wrapper from "../Wrapper";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdDocument } from "react-icons/io";

export default function Earth({
  radius = 1 / 3,
  widthSegments = 32,
  heightSegments = 32,
  color = "royalblue",
  gridColor = "white",
  latLines = 9,
  lonLines = 18,
  lineSegments = 128,
  rotationSpeed = 0.2,
  ...props
}) {
  const group = useRef();
  const colorMap = useLoader(TextureLoader, '/textures/earth.png');
  const { earthColor, islandAnimation, setHtml } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const objectName = "ABOUT ME"

  useEffect(() => {
    if (!showAbout) {
      setHtml(null)
    } else {
      setHtml((
        <>
          <div className="content-header">
            <button onClick={(e) => (e.stopPropagation(), setForceClick(true))}><FaArrowLeft /> BACK</button>
            <h1>{objectName}</h1>
          </div>
          <div className="about-me-container">
            {/*<div>
              <img src="/images/profile.jpg" alt="Profile" />
            </div>*/}
            <p>Versatile Full‑Stack Developer with a proven track record at just 17, I dove into programming at 12, out of pure passion, through self‑guided, hands‑on projects and fast‑tracked into university by acing the GED. I just completed my Bachelor's degree in IT at Purdue Global with a perfect 4.0 GPA. In these years, I have built end‑to‑end applications—designing React interfaces, coding scalable back‑ends with Node.js (Express, NestJS) and Flask, and researching in machine learning models that tackle real‑world challenges. I’ve always been driven by a deep curiosity and a love of learning, which has helped me build technical skills beyond what you’d expect for my age. Now, I can’t wait to expand my machine learning expertise and keep creating solid, full‑stack solutions that really move the needle for businesses.</p>
            <a download href="/docs/resume.pdf">Download CV</a>
          </div>

        </>
      ))
    }

    return () => {
      setHtml(null)
    }
  }, [showAbout])

  const lines = useMemo(() => {
    const items = [];
    const mat = new THREE.LineBasicMaterial({
      color: earthColor,
      toneMapped: false,
    });

    // latitude lines (parallel circles) -- skip the poles
    for (let i = 1; i <= latLines; i++) {
      const theta = Math.PI * (i / (latLines + 1));
      const y = radius * Math.cos(theta);
      const r = Math.abs(radius * Math.sin(theta));
      const pts = [];
      for (let j = 0; j <= lineSegments; j++) {
        const phi = (j / lineSegments) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.LineLoop(geom, mat);
      items.push(line);
    }

    // longitude lines (meridians)
    for (let i = 0; i < lonLines; i++) {
      const phiOffset = (i / lonLines) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= lineSegments; j++) {
        const theta = (j / lineSegments) * Math.PI;
        const x = radius * Math.sin(theta) * Math.cos(phiOffset);
        const y = radius * Math.cos(theta);
        const z = radius * Math.sin(theta) * Math.sin(phiOffset);
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geom, mat);
      items.push(line);
    }

    return { items, mat };
  }, [radius, latLines, lonLines, lineSegments, earthColor]);

  // add lines into the group once
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    lines.items.forEach((l) => g.add(l));
    return () => {
      lines.items.forEach((l) => {
        if (g) g.remove(l);
        if (l.geometry) l.geometry.dispose();
      });
      if (lines.mat) lines.mat.dispose();
    };
  }, [lines]);

  // Material personalizado para el efecto holograma
  const hologramMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        earthTexture: { value: colorMap },
        emissiveColor: { value: new THREE.Color(earthColor) }, // Cyan
        transparency: { value: 0.4 }, // Transparencia del agua
        emissiveIntensity: { value: 0.8 } // Intensidad de la emisión
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D earthTexture;
        uniform vec3 emissiveColor;
        uniform float transparency;
        uniform float emissiveIntensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vec4 texel = texture2D(earthTexture, vUv);
          
          // Las áreas blancas (continentes) serán emisivas
          float continentMask = texel.r; // Usamos el canal rojo como máscara
          
          // Las áreas negras (agua) serán transparentes
          float waterTransparency = (1.0 - continentMask) * transparency;
          
          // Color base para el agua (ligeramente azul)
          vec3 waterColor = vec3(0.1, 0.3, 0.8);
          
          // Mezclar entre color emisivo para continentes y agua transparente
          vec3 finalColor = mix(clamp(emissiveColor - vec3(0.4), 0.0, 1.0), emissiveColor * emissiveIntensity, continentMask);
          
          // Alpha: los continentes son opacos, el agua es transparente
          float alpha = mix(waterTransparency, 1.0, continentMask);
          
          gl_FragColor = vec4(finalColor, alpha);
          
          // Añadir un poco de efecto fresnel para mejorar el look holográfico
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          gl_FragColor.rgb += fresnel * 0.3;
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [colorMap, earthColor]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * rotationSpeed * (islandAnimation == "Earth" ? 70 : 1);
    }
  });

  const earthContent = (
    <group ref={group} {...props} position={[0, 2.5, 0]}>
      <Wrapper
        search={"Earth_Group"}
        offsetPosition={[0, 2.5, 0]}
        offsetLookAt={[0, 2.5, -0.1]}
        offsetWaypoint={[0, 3.5, 0]}
        objectName={objectName}
        setShowObject={setShowAbout}
        forceClick={forceClick}
        setForceClick={setForceClick}
      >
        <mesh name="Earth_Group" clickable>
          <sphereGeometry args={[radius, widthSegments, heightSegments]} />
          <primitive object={hologramMaterial} attach="material" />
        </mesh>
      </Wrapper>
    </group>
  )

  return (
    islandAnimation == "Bomb" ? (
      <>
        <RigidBody type="dynamic" mass={1} // Masas similares
          friction={3} // Alta fricción
          restitution={0} // Bajo rebote
          linearDamping={0.01} // Amortiguación lineal
          angularDamping={0.01}
          contactForceLimit={0.001}
          solverIterations={0.00001}
          solverVelocityIterations={0.00001}
        >
          <Loader url="/models/earth_base.glb" />
          {earthContent}
        </RigidBody>
      </>
    ) /*(: islandAnimation == "Earth" ? (
      <>
        <RigidBody type="fixed" restitution={0} mass={2}>
          <Loader url="/models/earth_base.glb" />
        </RigidBody>
        <RigidBody type="dynamic" mass={0.1} // Masas similares
          friction={3} // Alta fricción
          restitution={0} // Bajo rebote
          linearDamping={0.01} // Amortiguación lineal
          angularDamping={0.01}
          contactForceLimit={0.001}
          solverIterations={0.00001}
          solverVelocityIterations={0.00001}
        >
          {earthContent}
        </RigidBody>
      </>
    ))*/ : (
      <>
        <Loader url="/models/earth_base.glb" />
        {earthContent}
      </>
    )
  );
}