import { useLoader, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useState } from "react";  // Añadido useState
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import { ContentContext } from "../context/ContentContext";
import { RigidBody } from "@react-three/rapier";

const Loader = ({ url, onInit, onClick, dontClick = false, rigidBodyType = "dynamic", rigidBody=true, onPointerDown, onPointerUp, props }) => {
  const { materials, setMaterials, findMaterial, islandAnimation } = useContext(ContentContext)

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);
    return loader;
  });

  const model = useMemo(() => gltf.scene.clone(true), [gltf]);

  const defaultOnClick = (e) => {
    e.stopPropagation()
    if (onClick) onClick(e)
  }

  useEffect(() => {
    if (!model) return;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.metalness = 0.1;
        if (child.material) {
          const foundMaterial = findMaterial(child?.material?.name)
          if (foundMaterial) {
            child.material = foundMaterial
          } else {
            //child.material.needsUpdate = true;
            child.material.toneMapped = false;
            if (child?.material?.emissive?.r > 0 || child?.material?.emissive?.g > 0 || child?.material?.emissive?.b > 0) {
              child.material.emissiveIntensity = child.material.name != "Orange" ? 1 : 3;
            } else {
              child.material.roughness = 1;
            }
            setMaterials(prev => !prev.find(mat => mat.name == child?.material?.name) ? [...prev, child.material] : prev)
          }
        }
      }

      if (onInit) onInit(child, model);
    });
  }, [model, materials]);

  // Estado para rastrear si RigidBody fue aplicado previamente
  const [hadRigidBody, setHadRigidBody] = useState(false);

  useEffect(() => {
    // Resetear la matriz del objeto cuando RigidBody se remueve
    // Esto limpia cualquier "residuo" de física que afecte al raycasting
    if (hadRigidBody && !(islandAnimation == "Bomb" && rigidBody)) {
      model.traverse((child) => {
        if (child.isMesh) {
          child.updateMatrix();  // Fuerza actualización de matriz para limpiar estado físico
        }
      });
      setHadRigidBody(false);
    }
    if (islandAnimation == "Bomb" && rigidBody) {
      setHadRigidBody(true);
    }
  }, [islandAnimation, rigidBody, model]);

  return (
    <>
      <group onClick={dontClick ? onClick : defaultOnClick} onPointerDown={onPointerDown ? (e => { e.stopPropagation(); onPointerDown(e); }) : undefined} onPointerUp={onPointerUp ? (e => { e.stopPropagation(); onPointerUp(e); }) : undefined} {...props} name={url.split('/').pop().split('.').shift().toUpperCase()}>
        {(islandAnimation == "Bomb" || islandAnimation == "Earth") && rigidBody ? (  // Solo aplicar RigidBody a NO-clikeables (dontClick=true)
          <RigidBody
            type={islandAnimation == "Bomb" ? rigidBodyType : "fixed"}
            mass={1} // Masas similares
            friction={3} // Alta fricción
            restitution={0} // Bajo rebote
            linearDamping={0.01} // Amortiguación lineal
            angularDamping={0.01}
            contactForceLimit={0.001}
            solverIterations={0.00001}
            solverVelocityIterations={0.00001}
          >
            <primitive object={model} />
          </RigidBody>
        ) : (
          <primitive object={model} />
        )}
      </group>
    </>
  );
}

export default Loader;