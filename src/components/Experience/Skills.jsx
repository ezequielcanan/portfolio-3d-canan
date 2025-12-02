import { useContext, useEffect, useRef, useState } from "react";
import Loader from "../Loader";
import Wrapper from "../Wrapper";
import * as THREE from "three"
import { ContentContext } from "../../context/ContentContext";
import { FaArrowLeft } from "react-icons/fa";
import { useFrame } from "@react-three/fiber";

const Skills = () => {
  const { setHtml, setTransparent, projectionColor } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showSkills, setShowSkills] = useState(false)
  const skillsMeshes = useRef([])

  const materialRef = useRef(null)

  const onInit = (child, scene) => {
    if (child.isMesh) {
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
            uIntensity: { value: 3.0 },
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

        material.uniforms.uEmissiveColor.value.set(projectionColor);
        material.uniforms.uIntensity.value = 0.8;
        material.uniforms.uOpacity.value = 0.1;
        material.uniforms.uGradientPower.value = 0.8;
        material.uniforms.uAlphaThreshold.value = 0.02;

        materialRef.current = material


        const square = new THREE.Mesh(geometry, material);
        square.position.set(child.position.x, child.position.y + 0.065, child.position.z);
        scene.add(square);
      }
    }

    if (!child.name.includes("Skills") && !child.name.includes("Scene") && child.type == "Group") {
      const exists = skillsMeshes.current.find(a => a.uuid === child.uuid || a.name === child.name);
      if (!exists) {

        // inicializa baseY una sola vez
        if (child.userData.baseY === undefined) {
          child.userData.baseY = child.position.y;
        }
        skillsMeshes.current.push(child);
      }
    }
  }

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uEmissiveColor.value.set(projectionColor)
    }
  }, [projectionColor])

  useEffect(() => {
    if (!showSkills) {
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
  }, [showSkills])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    skillsMeshes.current.forEach((skill, i) => {
      const speed = 0.08 + (i + 2) * 0.1;
      const amplitude = 0.005;
      const baseY = skill.userData.baseY ?? skill.position.y;
      skill.userData.baseY = baseY;
      skill.position.y = baseY + Math.sin(t * speed) * amplitude;
    })
  })

  return (
    <Wrapper
      search={"Skills_Building"}
      offsetPosition={[1, 1, 0]}
      offsetLookAt={[0, 1, 0]}
      offsetWaypoint={[0, 2, 2]}
      onReturnAnimation={() => setTransparent(false)}
      objectName={"SKILLS"}
      setShowObject={setShowSkills}
      forceClick={forceClick}
      setForceClick={setForceClick}
    >
      <Loader url="/models/skills.glb" onInit={onInit} clickable />
    </Wrapper>
  )
}

export default Skills;