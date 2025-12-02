import { useContext, useEffect, useState } from "react";
import Loader from "../Loader";
import * as THREE from "three";
import Smoke from "./Smoke";
import Wrapper from "../Wrapper";
import { ContentContext } from "../../context/ContentContext";
import { FaArrowLeft } from "react-icons/fa";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Html } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import { SiCheckmarx } from "react-icons/si";
import { IoMdCheckmark } from "react-icons/io";

const Console = () => {
  const [smokeGenerators, setSmokeGenerators] = useState([]);
  const { setHtml, html, setTransparent, setMaterials, materials, findMaterial, setEarthColor, setProjectionColor, projectionColor } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState("Orange")
  const [color, setColor] = useState("#FEA000");
  const [colorsChild, setColorsChild] = useState()
  const [consoleChild, setConsoleChild] = useState()
  const materialsNames = ["Purple", "Light Purple", "Pink", "Light Blue", "Orange"]

  const handleColorChange = (newColor) => {
    setColor(newColor)
    setMaterials(prev => {
      const modifiedMaterialIndex = prev.findIndex(mat => mat.name == selectedMaterial)
      if (modifiedMaterialIndex != -1) {
        //console.log(prev[modifiedMaterialIndex])
        //prev[modifiedMaterialIndex].emissiveIntensity = 15
        if (prev[modifiedMaterialIndex]?.emissive?.r || prev[modifiedMaterialIndex]?.emissive?.g || prev[modifiedMaterialIndex]?.emissive?.b) {
          prev[modifiedMaterialIndex].emissive = new THREE.Color(newColor)
        } else {
          prev[modifiedMaterialIndex].color = new THREE.Color(newColor)
        }
      }
      return prev
    })
    if (consoleChild?.material && selectedMaterial == "Orange") {
      const color = new THREE.Color(newColor)
      /*consoleChild.material.uniforms.uBaseColor.value = color;
      consoleChild.material.uniforms.uEdgeColor.value = color;
      consoleChild.material.needsUpdate = true;
      setConsoleChild({...consoleChild})*/
      setProjectionColor(color)
    }

    if (selectedMaterial == "Light Blue") {
      setEarthColor(newColor)
    }
  }

  const onInit = (child) => {
    if (child.name == "Colors") {
      setColorsChild(child)
    }
    if (child.isMesh) {
      if (child.name === "Console") {
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
            uBaseColor: { value: consoleChild?.material?.uniforms?.uBaseColor?.value || new THREE.Color(0.8, 0.8, 0.8) },
            uEdgeColor: { value: consoleChild?.material?.uniforms?.uEdgeColor?.value || new THREE.Color(0.8, 0.8, 0.8) },
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

        if (!consoleChild) setConsoleChild(child)
      }
    }
  }

  const onInitTowers = (child) => {
    if (child.name.includes("smoke")) {
      setSmokeGenerators(prev => {
        return !prev.find(g => g.name === child.name) ? [...prev, child] : prev;
      });
    }
  }

  useEffect(() => {
    if (!findMaterial("ColorPanel")) {
      const colorPanelMaterial = findMaterial("Orange")?.clone()
      if (colorPanelMaterial) {
        colorPanelMaterial.name = "ColorPanel"
        setMaterials(prev => [...prev, colorPanelMaterial])
      }
    }

    materialsNames.forEach(name => {
      if (!findMaterial(name + " Original")) {
        const clonedMaterial = findMaterial(name)?.clone()
        if (clonedMaterial) {
          clonedMaterial.name = name + " Original"
          setMaterials(prev => [...prev, clonedMaterial])
        }
      }
    })

    if (!showConsole) {
      setHtml(null)
    } else {
      setTransparent(true)
      setHtml((
        <>
          <div className="content-header-hidden content-header">
              <button onClick={(e) => (e.stopPropagation(), setForceClick(true))}><FaArrowLeft /> BACK</button>
            </div>
        </>
      ))
    }

    return () => {
      setHtml(null)
    }
  }, [showConsole, selectedMaterial, materials])

  const onClickConsole = (e) => {
    const colorPanelMaterialIndex = findMaterial("ColorPanel", true)
    /*if (e?.object?.name == "Confirm") {
      const selectedMaterialIndex = findMaterial(selectedMaterial, true)
      const copyingMaterial = materials[colorPanelMaterialIndex].clone()
      setMaterials(prev => {
        prev.splice(selectedMaterialIndex, 1)
        const newMaterial = copyingMaterial
        newMaterial.name = selectedMaterial
        return [...prev, newMaterial]
      })
      if (consoleChild?.material && selectedMaterial == "Orange") {
        const color = new THREE.Color(copyingMaterial.emissive.r, copyingMaterial.emissive.g, copyingMaterial.emissive.b)
        consoleChild.material.uniforms.uBaseColor.value = color;
        consoleChild.material.uniforms.uEdgeColor.value = color;
        consoleChild.material.needsUpdate = true;
        setConsoleChild({...consoleChild})+
        setSmokeColor(color)
      }
    } else */
    if (e?.object?.name?.includes("Reset")) {
      setMaterials(prev => {
        materialsNames.forEach(name => {
          const clonedMaterial = findMaterial(name + " Original")?.clone()
          const actualMaterialIndex = findMaterial(name, true)
          if (clonedMaterial) {
            clonedMaterial.name = name
            prev.splice(actualMaterialIndex, 1)
            prev.push(clonedMaterial)
          }
        })
        return [...prev]
      })
      setConsoleChild(false)
      setSelectedMaterial("Orange")
      setColor("#FEA000")
      setProjectionColor("#FEA000")
      setEarthColor(0x00ffff)
    } else if (materialsNames.includes(e?.object?.material?.name)) {
      const materialName = e?.object?.material?.name || "Orange"
      const clonedMaterial = findMaterial(materialName)?.clone()
      setMaterials(prev => {
        prev.splice(colorPanelMaterialIndex, 1)
        const colorPanelMaterial = clonedMaterial
        colorPanelMaterial.name = "ColorPanel"
        return [...prev, colorPanelMaterial]
      })
      setSelectedMaterial(materialName)
      setColor(clonedMaterial.emissive.getHexString())
    }
  }

  const rotationColorSelector = new THREE.Euler(
    degToRad(-45), // X
    degToRad(45),  // Y
    degToRad(0),   // Z
    'YXZ'          // Orden de aplicación: primero Y, luego X, luego Z
  );

  return (
    <>
      <Wrapper
        search={"Console"}
        offsetPosition={[0.7, 0.7, 0.7]}
        offsetLookAt={[0, 0, 0]}
        offsetWaypoint={[1, 2, 1]}
        onReturnAnimation={() => setTransparent(false)}
        objectName={"CONSOLE"}
        setShowObject={setShowConsole}
        forceClick={forceClick}
        setForceClick={setForceClick}
      >
        <Loader url="/models/console.glb" onInit={onInit} onClick={onClickConsole} clickable />
        <Loader url="/models/console_towers.glb" onInit={onInitTowers} />
        {/*colorPanelChild ? (
          <mesh position={[colorPanelChild.position.x, colorPanelChild.position.y, colorPanelChild.position.z]} rotation={colorPanelChild.rotation} material={findMaterial("ColorPanel")}>
            <boxGeometry args={[0.12, 0.005, 0.20]} />
          </mesh>
        ) : null*/}
        {(html && colorsChild && showConsole) ? (
          <Html
            transform
            position={colorsChild.position}
            rotation={rotationColorSelector}
            scale={0.1}
            pointerEvents="none"
          >
            <div className={"colors-pointer " + selectedMaterial.toLowerCase().replaceAll(" ", "")} />
          </Html>
        ) : null}
        {(html && consoleChild && showConsole) ? (
          <Html
            transform
            position={[consoleChild.position.x, consoleChild.position.y - 0.02, consoleChild.position.z]}
            scale={[0.03, 0.03, 0.03]}
            key={"html-console"}
            rotation={rotationColorSelector}
          >
            <div className="console-overlay">
              <HexColorPicker color={color} onChange={handleColorChange} style={{ width: "180%" }} />
              <HexColorInput color={color} onChange={handleColorChange} style={{ width: "180%" }} />
            </div>
          </Html>
        ) : null}
        {smokeGenerators.length ? (
          smokeGenerators?.map(generator => {
            return <Smoke key={generator.name} radius={0.01} size={10} count={250} speed={0.3} color={projectionColor} position={[generator.position.x, generator.position.y + 0.3, generator.position.z]} scale={[0.5, 0.2, 0.5]} />
          })
        ) : null}
      </Wrapper>
    </>
  )
}

export default Console;