// Smoke.jsx
import React, { useRef, useMemo, useEffect, useState, useContext } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { ContentContext } from "../../context/ContentContext";

/**
 * Smoke component for react-three-fiber
 * Props:
 *  - count: number of particles
 *  - color: smoke base color (hex or CSS)
 *  - size: base point size (pixels)
 *  - spread: vertical rise distance (world units)
 *  - speed: how fast the smoke rises
 *  - radius: horizontal spread radius (how far from center particles spawn)
 *
 * Usage:
 * <Smoke position={[0, 0, 0]} count={120} color="#ff9a66" />
 */
export default function Smoke({
  count = 120,
  color = "#ffffff",
  size = 40,
  spread = 1.6,
  speed = 0.25,
  radius = 0.6,
  ...props
}) {
  const [spd, setSpd] = useState(speed)
  const pointsRef = useRef();
  const { gl, camera, size: viewport } = useThree();
  const pixelRatio = gl.getPixelRatio();
  const { islandAnimation } = useContext(ContentContext)

  // Buffer data (positions, random offsets, scales)
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const aOffset = new Float32Array(count);
    const aScale = new Float32Array(count);
    const aStartY = new Float32Array(count); // initial y (so particles are spread vertically)

    for (let i = 0; i < count; i++) {
      // spawn roughly inside a disk of radius `radius`
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius * (0.8 + Math.random() * 0.4); // bias to center
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = -Math.random() * 0.6; // start slightly below origin to create rising effect

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      aOffset[i] = Math.random();
      aScale[i] = 0.6 + Math.random() * 1.4; // per-particle scale multiplier
      aStartY[i] = y;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aOffset", new THREE.BufferAttribute(aOffset, 1));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(aScale, 1));
    geometry.setAttribute("aStartY", new THREE.BufferAttribute(aStartY, 1));

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size },
        uSpeed: { value: speed },
        uSpread: { value: spread },
        uPixelRatio: { value: pixelRatio },
      },
      vertexShader: `
        attribute float aOffset;
        attribute float aScale;
        attribute float aStartY;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uSpread;
        uniform float uSize;
        uniform float uPixelRatio;
        varying float vLife;
        varying float vScale;

        // simple pseudo-random
        float rand(float x) {
          return fract(sin(x) * 43758.5453123);
        }

        void main() {
          // life goes 0..1 per particle and loops (mod)
          float life = mod(uTime * uSpeed + aOffset, 1.0);
          vLife = life;
          vScale = aScale;

          // slight horizontal drift that increases with life, but limited (keeps smoke together)
          float drift = 0.2; // how much sideways movement
          float angle = (uTime * 0.3 + aOffset * 6.2831) * (0.5 + aScale * 0.3);
          vec3 pos = vec3(position.x, aStartY + life * uSpread, position.z);
          pos.x += sin(angle) * drift * (0.7 * life);
          pos.z += cos(angle * 1.3) * drift * (0.6 * life);

          // model-view and projection
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          // point size attenuation so points keep consistent look with perspective
          gl_PointSize = aScale * uSize * (uPixelRatio / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }`,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        varying float vLife;
        varying float vScale;

        void main() {
          // circular soft sprite from gl_PointCoord
          vec2 coord = gl_PointCoord - 0.5;
          float dist = length(coord);

          // soft circular mask (0..1) where 0 at edge and 1 at center
          float mask = 1.0 - smoothstep(0.0, 0.7, dist);

          // a stylized vertical fade: more opaque at bottom of particle, fade to top
          float vertical = 1.0 - (gl_PointCoord.y); // bottom -> 1, top -> 0
          float alpha = mask * vertical;

          // fade globally as particle life goes towards 1 (so it disappears as rises)
          float lifeFade = 1.0 - smoothstep(0.0, 1.0, vLife);

          // tint variation and overall color
          vec3 col = uColor * (0.6 + 0.4 * (1.0 - vLife)); // slightly brighter near origin

          // final alpha / color
          alpha *= lifeFade * (0.7 + 0.3 * (1.0 - vScale)); // small scale-based tweak

          // discard tiny fragments to keep crisp edges performant
          if (alpha < 0.01) discard;

          gl_FragColor = vec4(col, alpha);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry, material };
  }, [count, color, size, spread, speed, radius, pixelRatio]);

  useEffect(() => {
    const points = pointsRef.current;
    if (!points) return;
    const geom = points.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position");
    const aScaleAttr = geom.getAttribute("aScale");

    // vectores temporales para evitar crear en el loop
    const worldPos = new THREE.Vector3();
    const mvPos = new THREE.Vector3();
    const ray = new THREE.Ray();

    // aseguramos que exista la propiedad size en el material (ayuda con raycast por defecto también)
    if (points.material && typeof points.material.size === "undefined") {
      points.material.size = size;
      points.material.sizeAttenuation = true;
    }

    points.raycast = function (raycaster, intersects) {
      // copia del rayo en espacio mundial
      ray.copy(raycaster.ray);

      const positions = posAttr.array;
      const aScales = aScaleAttr ? aScaleAttr.array : null;

      // camera parámetros
      const isPerspective = camera.isPerspectiveCamera;
      const fov = isPerspective ? (camera.fov * Math.PI) / 180 : null;
      const heightPixels = viewport.height; // altura del canvas en píxeles
      const pixelRatioLocal = gl.getPixelRatio();

      // pre-cálculos
      const matrixWorld = this.matrixWorld;
      const inverseCamera = camera.matrixWorldInverse;

      for (let i = 0; i < posAttr.count; i++) {
        // posición local
        worldPos.set(
          positions[i * 3 + 0],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        );
        // aWorld = aplicar matrixWorld
        worldPos.applyMatrix4(matrixWorld);

        // pos en espacio cámara (para obtener z en cámara)
        mvPos.copy(worldPos).applyMatrix4(inverseCamera);
        const zCam = mvPos.z; // en espacio cámara (nota: normalmente negativo si está delante)

        // si el punto está detrás de la cámara, saltar
        if (isPerspective && zCam >= 0) continue;

        // calcular tamaño en píxeles tal como en tu vertexShader:
        // gl_PointSize = aScale * uSize * (uPixelRatio / -mvPosition.z)
        const particleScale = aScales ? aScales[i] : 1.0;
        const pixelSize = particleScale * size * (pixelRatioLocal / -zCam);

        // convertir pixelSize a unidades del mundo a esa profundidad (para cámara perspectiva)
        // worldHeightAtZ = 2 * -z * tan(fov/2)
        let worldRadius = 0;
        if (isPerspective) {
          const worldHeightAtZ = 2 * -zCam * Math.tan(fov / 2);
          const worldUnitsPerPixel = worldHeightAtZ / heightPixels;
          worldRadius = (pixelSize * 0.5) * worldUnitsPerPixel; // medio pixel = radio
        } else if (camera.isOrthographicCamera) {
          // para ortográfica, la relación pixel->world es constante:
          const worldHeight = camera.top - camera.bottom;
          const worldUnitsPerPixel = worldHeight / heightPixels;
          worldRadius = (pixelSize * 0.5) * worldUnitsPerPixel;
        } else {
          // fallback conservador
          continue;
        }

        // distancia mínima del rayo al punto (en unidades mundo)
        const distSq = ray.distanceSqToPoint(worldPos);

        if (distSq <= worldRadius * worldRadius) {
          // punto intersectado -> construir objeto intersection parecido a three.js
          // calcular punto en la recta más cercano al point:
          const vToPoint = new THREE.Vector3().subVectors(worldPos, ray.origin);
          const t = ray.direction.dot(vToPoint); // proyección
          const pointOnRay = new THREE.Vector3().copy(ray.direction).multiplyScalar(t).add(ray.origin);

          const distance = ray.origin.distanceTo(pointOnRay);

          intersects.push({
            distance: distance,
            distanceToRay: Math.sqrt(distSq),
            point: pointOnRay.clone(),
            index: i,
            object: this,
          });
        }
      }
    };

    // cleanup: opcionalmente restaurar raycast si desmontas
    return () => {
      if (points && points.raycast) {
        delete points.raycast;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, camera, viewport.width, viewport.height, gl, size, pixelRatio]);

  // update shader uniforms on each frame
  useFrame((state, delta) => {
    if (material) {
      material.uniforms.uTime.value += delta;
      // allow prop-driven updates
      material.uniforms.uSize.value = size;
      material.uniforms.uSpeed.value = spd;
      material.uniforms.uSpread.value = spread;
      material.uniforms.uPixelRatio.value = gl.getPixelRatio();
      // allow runtime changes of color
      material.uniforms.uColor.value.set(color);
    }
  });

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    islandAnimation == "Bomb" ? (
      <RigidBody type="dynamic" mass={1} // Masas similares
          friction={3} // Alta fricción
          restitution={0} // Bajo rebote
          linearDamping={0.01} // Amortiguación lineal
          angularDamping={0.01}
          contactForceLimit={0.001}
          solverIterations={0.00001}
          solverVelocityIterations={0.00001}
          >
        <CylinderCollider
          args={[0.000000001, 0.0000000001]} // [radio, altura] // Centrado verticalmente
        />
        <points ref={pointsRef} geometry={geometry} {...props}>
          <primitive attach="material" object={material} />
        </points>
      </RigidBody>
    ) : (
      <points ref={pointsRef} geometry={geometry} {...props}>
        <primitive attach="material" object={material} />
      </points>
    )
  );
}
