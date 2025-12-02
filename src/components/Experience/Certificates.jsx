import { useRef, useState, useEffect, useContext } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import Loader from "../Loader";
import Wrapper from "../Wrapper";
import { OrbitControls } from "@react-three/drei";
import { FaArrowLeft } from "react-icons/fa";
import { ContentContext } from "../../context/ContentContext";
import * as audioManager from "../../utils/audioManager";
import { RiDragMove2Line } from "react-icons/ri";



const Certificates = ({ isMobile = false }) => {
  const internalControlsRef = useRef(null);
  const { camera } = useThree();
  const [enableInternalControls, setEnableInternalControls] = useState(false);
  const { setHtml, setTransparent, setPlayBackground } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showCertificates, setShowCertificates] = useState(false)
  const currentSourceRef = useRef(null);

  const clickedMaterial = useRef(null);

  const onPointerDownCertificates = (e) => {
    clickedMaterial.current = e.object?.material?.name || null;
  };

  const onPointerUpCertificates = (e) => {
    const releasedMaterial = e.object?.material?.name || null;
    if (clickedMaterial.current && clickedMaterial.current === releasedMaterial) {
      onClickCertificates(e);
    }
    clickedMaterial.current = null;
  };

  const onEndAnimation = () => {
    const controls = internalControlsRef.current;

    const lookAtPoint = camera.position.clone().add(new Vector3(0, 0, -2))

    controls.target.copy(lookAtPoint);
    controls.update();

    controls.enabled = true;
    setEnableInternalControls(true);
  };

  const stopCurrentSound = () => {
    const src = currentSourceRef.current;
    if (src && typeof src.stop === "function") {
      try {
        src.onended = null;
        src.stop(0);
      } catch (e) { }
      try { src.disconnect(); } catch (e) { }
      currentSourceRef.current = null;
    }
  };

  useEffect(() => {
    if (!showCertificates) {
      setHtml(null)
    } else {
      setTransparent(true)
      setHtml((
        <>
          <div className="content-header-hidden content-header">
            <button onClick={(e) => (e.stopPropagation(), setForceClick(true))}><FaArrowLeft /> BACK</button>
          </div>
          {/*<div className="certificates-drag">
            <RiDragMove2Line />
          </div>*/}
        </>
      ))
    }

    return () => {
      setHtml(null)
    }
  }, [showCertificates])

  const onClickCertificates = (e) => {
    if (enableInternalControls) {
      const materialName = e.object?.material?.name || "";
      if (materialName != "Purple" && materialName != "Orange") {
        let bufferName = "smallApplause";
        if (materialName === "purdue") bufferName = "applause";
        else if (materialName === "ged") bufferName = "mediumApplause";

        // play y guardar referencia al source para poder pararlo
        const src = audioManager.play(bufferName);
        if (src) currentSourceRef.current = src;
        setPlayBackground(false)
        setHtml(prev => {
          return (
            <>
              {prev}
              <div className="certificate-popup" onClick={() => (setHtml(prev), stopCurrentSound(), setPlayBackground(true))}>
                <div className="certificate-container">
                  <img src={`/images/certificates/${materialName}.jpg`} alt={materialName} />
                </div>
              </div>
            </>
          )
        })
      }
    }
  }


  return (
    <Wrapper
      search={"Building"}
      onEndAnimation={onEndAnimation}
      onReturnAnimation={() => (setEnableInternalControls(false), setTransparent(false))}
      offsetPosition={[0, 0.3, 0.3]}
      offsetLookAt={[0, 0.3, 0]}
      offsetWaypoint={[0, 1, 2]}
      objectName={"CERTIFICATES"}
      setShowObject={setShowCertificates}
      forceClick={forceClick}
      setForceClick={setForceClick}
    >
      <Loader url="/models/certificates.glb" clickable onClick={!isMobile ? undefined : onClickCertificates} onPointerDown={!isMobile ? onPointerDownCertificates : undefined} onPointerUp={!isMobile ? onPointerUpCertificates : null} />
      <OrbitControls
        ref={internalControlsRef}
        enabled={enableInternalControls}               // arrancan deshabilitados
        enableDamping
        dampingFactor={0.05}
        minDistance={0.3}
        maxDistance={0.4}

        maxAzimuthAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.8}
        enablePan={false}
      />
    </Wrapper>
  );
}

export default Certificates;
