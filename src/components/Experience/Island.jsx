import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Loader from "../Loader";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ContentContext } from "../../context/ContentContext";
import { Physics, RigidBody } from "@react-three/rapier";
import { CameraContext } from "../../context/CameraContext";
import * as audioManager from "../../utils/audioManager";


const Island = () => {
  const blinkMeshes = useRef([]);
  const rotatingRings = useRef([]);
  const arrowsMeshes = useRef([]);
  const { scene } = useThree()
  const { islandAnimation, setIslandAnimation } = useContext(ContentContext)
  const { animating, origin } = useContext(CameraContext)
  const [lastAnimation, setLastAnimation] = useState(null)
  const allMeshes = useRef([])
  const originalMeshes = useRef([])
  const completedRotation = useRef(new Set())
  const meshDataInitialized = useRef(false)

  const onInitIsland = (child) => {
    if (child.isMesh) {
      if (child.material && child.parent.name.includes("Island") && child.material.name.includes("Blue")) {
        blinkMeshes.current.push(child);
      }
    }
  }

  const onInitArrows = (child) => {
    if (child.isMesh) {
      const exists = arrowsMeshes.current.find(a => a.uuid === child.uuid || a.name === child.name);
      if (!exists) {
        // inicializa baseY una sola vez
        if (child.userData.baseY === undefined) {
          child.userData.baseY = child.position.y;
        }
        child.material.transparent = true;
        arrowsMeshes.current.push(child);
      }
    }
  }

  const onInitWireframe = (child) => {
    if (child.material) {
      child.material.visible = false
    }
  }

  function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  const onInitRings = (child) => {
    if (child.name.includes("ring") && !rotatingRings.current.find(r => r.name === child.name)) {
      rotatingRings.current.push(child);
    }
  }

  // Función para inicializar los datos de los meshes
  const initializeMeshData = (meshes) => {
    meshes.forEach((mesh) => {
      if (!mesh.userData.originalPosition) {
        mesh.updateMatrixWorld();
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);

        mesh.userData.originalPosition = worldPos.clone();
        mesh.userData.originalLocalPosition = mesh.position.clone();
        mesh.userData.initialRotationY = mesh.rotation.y;
        mesh.userData.angle = 0;
        mesh.userData.rotateSpeed = 4;
      }
    });
    meshDataInitialized.current = true;
  }

  useEffect(() => {
    const out = [];
    scene.traverse((obj) => {
      if (obj.type == "Group") out.push(obj);
    });
    allMeshes.current = out
    originalMeshes.current = allMeshes.current.slice();

    // Inicializar los datos de los meshes inmediatamente
    initializeMeshData(allMeshes.current);
  }, [scene])

  // Reinicializar datos cuando comienza la animación
  useEffect(() => {
    if (islandAnimation === "Rotate") {
      completedRotation.current.clear();

      // Asegurarse de que todos los datos estén inicializados
      if (!meshDataInitialized.current) {
        initializeMeshData(allMeshes.current);
      } else {
        // Reiniciar el ángulo para todos los meshes
        allMeshes.current.forEach((mesh) => {
          if (mesh.userData.originalPosition) {
            mesh.userData.angle = 0;
          }
        });
      }
    }
  }, [islandAnimation]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Animación de parpadeo
    blinkMeshes.current.forEach((mesh, i) => {
      if (!mesh || !mesh.material) return;
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const phase = mesh.userData.blinkPhase ?? 0;
      const speed = mesh.userData.blinkSpeed ?? 2;
      const base = mesh.userData.originalEmissiveIntensity ?? 1.0;

      const amplitude = 0.2;
      const offset = 0.5;
      const raw = offset + (0.5 + 0.5 * Math.sin(t * speed + phase)) * amplitude;
      const smooth = 0.12;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity ?? base, raw * base, smooth);
    });

    // Animación de anillos rotatorios
    rotatingRings.current.forEach((ring, i) => {
      ring.rotation.y += ((i % 2) ? 1 : -1) * delta * 0.3;
    });

    // Animacion de flechas hacia arriba y hacia abajo rebotando cuando baja (aumentando velocidad y generar efecto de rebote)
    arrowsMeshes.current.forEach((arrow, i) => {
      const speed = 2 + i * 0.2;
      const amplitude = 0.01;
      const baseY = arrow.userData.baseY ?? arrow.position.y;
      arrow.userData.baseY = baseY;
      arrow.position.y = baseY + Math.sin(t * speed) * amplitude;


      const activeDuration = 6;   // segundos en los que la opacidad oscila
      const pauseDuration = 3;   // segundos apagada
      const totalCycle = activeDuration + pauseDuration;
      const phaseOffset = i * 0.1;  // pequeño desfase por flecha
      // ----------------------------------------------------

      // calcula el tiempo relativo dentro del ciclo (en segundos)
      const cycleTime = (t + phaseOffset) % totalCycle;

      if (cycleTime < activeDuration) {
        // estamos en la fase "activa": usamos una sin para oscilar 0 -> 1 -> 0
        const progress = cycleTime / activeDuration; // 0..1
        // usar Math.PI hace que la sin vaya de 0 a 1 y vuelva a 0 en la duración
        arrow.material.opacity = Math.abs(Math.sin(progress * Math.PI));
      } else {
        // fase de pause: opacidad 0
        arrow.material.opacity = 0;
      }
    });


    if (islandAnimation == "Rotate") {
      allMeshes.current.forEach((mesh, i) => {
        if (!mesh) return;

        // Si ya completó la rotación, no hacer nada
        if (completedRotation.current.has(mesh.id)) {
          return;
        }

        // Asegurarse de que los datos del mesh estén inicializados
        if (!mesh.userData.originalPosition) {
          initializeMeshData([mesh]);
        }

        const speed = mesh.userData.rotateSpeed ?? 4;
        const remaining = Math.PI * 2 - mesh.userData.angle;
        const dAngle = Math.min(remaining / 2, delta * (remaining + 0.7));
        const newAngle = mesh.userData.angle + dAngle;

        // Rotar la posición original alrededor del eje Y que pasa por (0,0,0)
        const ox = mesh.userData.originalPosition.x;
        const oz = mesh.userData.originalPosition.z;
        const cos = Math.cos(newAngle);
        const sin = Math.sin(newAngle);
        const rx = cos * ox - sin * oz;
        const rz = sin * ox + cos * oz;

        // Mantener la altura Y original
        const ry = mesh.userData.originalPosition.y;

        // Actualizar posición
        if (mesh.parent) {
          const newWorldPos = new THREE.Vector3(rx, ry, rz);
          mesh.parent.worldToLocal(newWorldPos);
          mesh.position.copy(newWorldPos);
        } else {
          mesh.position.set(rx, ry, rz);
        }

        // Rotar la orientación del mesh
        mesh.rotation.y = mesh.userData.initialRotationY + newAngle;

        mesh.userData.angle = newAngle;

        // Si alcanzó la vuelta completa
        if (mesh.userData.angle >= Math.PI * 2 - 1e-6 && !completedRotation.current.has(mesh.id)) {
          // Restaurar posición y rotación original
          if (mesh.parent) {
            const origLocal = mesh.userData.originalLocalPosition.clone();
            mesh.position.copy(origLocal);
          } else {
            mesh.position.copy(mesh.userData.originalPosition);
          }
          mesh.rotation.y = mesh.userData.initialRotationY;

          // Recalcular y guardar la posición mundial actualizada
          mesh.updateMatrixWorld();
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          mesh.userData.originalPosition = worldPos.clone();
          mesh.userData.originalLocalPosition = mesh.position.clone();
          mesh.userData.angle = 0;

          completedRotation.current.add(mesh.id);
        }

        if (completedRotation.current.size === allMeshes.current.length) {
          setIslandAnimation(null);
          completedRotation.current.clear();
          // No limpiar meshDataInitialized para mantener los datos para futuras animaciones
        }
      });
    } else if (islandAnimation == "Rings") {
      let allCompleted = true;
      if (lastAnimation !== islandAnimation) {
        clock.startAnimation = t;
      }
      const elapsed = t - (clock.startAnimation || 0);
      rotatingRings.current.forEach((ring, i) => {
        const amplitude = 0.4;
        const speed = Math.PI * 0.8;
        const delay = 0.25;
        const phaseTime = Math.max(0, elapsed - i * delay);
        const phase = phaseTime * speed;
        const scale = 1 + amplitude * Math.sin(phase);

        if (ring.scale.x > 1 && scale <= 1) {
          ring.userData.iterations = (ring.userData.iterations || 0) + 1;
        }

        if (ring.userData.iterations >= 3) {
          // Forzar el scale a 1 cuando complete las iteraciones
          ring.scale.set(1, 1, 1);
        } else {
          ring.scale.setScalar(scale);
          allCompleted = false;
        }
      });

      // Verificar si TODOS los anillos completaron
      if (allCompleted && rotatingRings.current.every(ring => (ring.userData.iterations || 0) >= 3)) {
        // Resetear iteraciones y finalizar animación
        rotatingRings.current.forEach((r) => {
          r.userData.iterations = 0;
          r.scale.set(1, 1, 1); // Asegurar scale final
        });
        setIslandAnimation(null);
      }
    }

    if (lastAnimation !== islandAnimation) {
      setLastAnimation(islandAnimation);
    }
  });


  const onClickAnimations = (e) => {
    if (!islandAnimation && !animating && origin) {
      const animation = e.object.parent.name
      if (animation == "Rotate") {
        audioManager.play("crank");
      } else if (animation == "Bomb") {
        audioManager.play("space");
      } else if (animation == "Earth") {
        audioManager.play("spin");
      } else if (animation == "Rings") {
        audioManager.play("ring");
      }
      if (animation == "Bomb" || animation == "Earth") {
        setIslandAnimation(animation)
        setTimeout(() => {
          setIslandAnimation(null)
        }, animation == "Bomb" ? 5000 : 2000);
      } else if (animation == "Rotate" || animation == "Rings") {
        setIslandAnimation(animation)
      }
    }
  }



  useEffect(() => {
    if (islandAnimation || !origin) {
      arrowsMeshes.current = []
    }
  }, [islandAnimation, origin])

  return (
    <>
      <Loader url="/models/island.glb" onInit={onInitIsland} dontClick rigidBody={false} />
      <Loader url="/models/diamonds.glb" onInit={onInitIsland} />
      {(!islandAnimation && origin) ? <Loader url="/models/arrows.glb" onInit={onInitArrows} /> : null}
      <Loader url="/models/animations_buttons.glb" onClick={onClickAnimations} rigidBodyType="fixed" />
      <Loader url="/models/island_wireframe.glb" onInit={onInitWireframe} rigidBody={false} />
      <Physics gravity={[0, -0.5, 0]}>
        <Loader url="/models/rings.glb" onInit={onInitRings} />
      </Physics>
    </>
  )
}

export default Island;