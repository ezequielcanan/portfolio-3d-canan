import { Suspense, useState, useRef, useContext, useEffect, useCallback } from "react";
import { Canvas as CanvasThree } from "@react-three/fiber";
import { OrbitControls, Html, PerspectiveCamera, useProgress } from "@react-three/drei";
import * as THREE from "three";
import Experience from "./Experience/Experience";
import { CameraContext } from "../context/CameraContext";
import { Physics } from "@react-three/rapier";
import { ContentContext } from "../context/ContentContext";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import * as audioManager from "../utils/audioManager";
import backgroundSound from "../assets/sounds/background.mp3"


const backgroundAudio = new Audio(backgroundSound)
backgroundAudio.loop = true;
backgroundAudio.volume = 0.2;

// Canvas component with loading overlay, title and start button
export default function Canvas() {
  const { cameraTarget, setCameraTarget, controlsEnabled, setControlsEnabled, controlsRef, origin, animating } = useContext(CameraContext);
  const { forceClick, setForceClick, transparent, playBackground, setPlayBackground } = useContext(ContentContext);
  const { islandAnimation } = useContext(ContentContext);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  // overlay state
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayClosing, setOverlayClosing] = useState(false);

  const { progress, active, loaded, total, item } = useProgress();
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When the scene finishes loading (progress reaches 100), enable the Start button
  const finishedLoading = loaded === 54
  const realProgress = loaded / 54 * 100

  // Framer Motion: smooth the progress value with a spring for real-time, precise bar animation
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 150, damping: 22 });
  const width = useTransform(spring, (v) => `${Math.min(Math.max(v, 0), 100)}%`);

  useEffect(() => {
    // progress from useProgress tends to be in 0-100 range; avoid regressions by only increasing the motion value.
    // This prevents the bar from jumping backward if useProgress briefly reports a lower value.
    const current = mv.get() || 0;
    const next = Math.max(current, realProgress);
    mv.set(next);
  }, [progress]);



  // When we reach finishedLoading, snap to 100 to guarantee a full bar (helps if rounding caused 99->100 flips)
  useEffect(() => {
    if (finishedLoading) mv.set(100);
  }, [finishedLoading]);

  const handleStart = () => {
    // Enable controls and start scene
    audioManager.play("start")

    setControlsEnabled?.(true);
    setStarted(true);
    // start closing animation
    setOverlayClosing(true);
  };

  const handleKeyDown = useCallback((e) => {
    const targetTag = e.target?.tagName;
    if (targetTag === "INPUT" || targetTag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
    if (e.key === "m" || e.key === "M") {
      if (!audioManager.getMuteState()) {
        backgroundAudio.volume = 0
      } else {
        backgroundAudio.volume = 0.2
      }
      audioManager.toggleMute();
    }
  }, []);

  useEffect(() => {
    if (origin) {
      setPlayBackground(true)
    }
  }, [origin])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown])

  useEffect(() => {
    if (!islandAnimation && (origin || (!origin && transparent)) && started && !animating && playBackground) {
      backgroundAudio.play()
    } else {
      backgroundAudio.pause()
    }
  }, [started, origin, islandAnimation, animating, transparent, playBackground])

  return (
    <div style={{ width: "100vw", height: "100vh", position: 'relative' }} className="canvas-wrap">

      {/* Overlay: title, subtitle, progress and start button */}
      <AnimatePresence>
        {overlayVisible && (
          <motion.div
            key="loading-overlay"
            initial={{ scaleY: 1, opacity: 1 }}
            animate={{ scaleY: overlayClosing ? 0 : 1, opacity: overlayClosing ? 0 : 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: overlayClosing ? 'none' : 'auto',
              transformOrigin: 'top',
              background: 'linear-gradient(180deg, rgba(0,0,0), rgba(2,2,2))',
              zIndex: 30,
              color: 'white',
              padding: 20,
              textAlign: 'center'
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              // when the overlay finished closing, remove it from the DOM so the canvas is fully interactive
              if (overlayClosing) setOverlayVisible(false);
            }}
            exit={{ scaleY: 0, opacity: 0 }}
          >
            <div style={{ maxWidth: 900 }}>
              <h1 style={{ fontSize: isMobile ? 28 : 40, margin: 0, fontWeight: 700 }}>Ezequiel Canan</h1>
              <h2 style={{ fontSize: isMobile ? 14 : 20, marginTop: 8, opacity: 0.9, letterSpacing: 2 }}>3D PORTFOLIO</h2>

              <div style={{ marginTop: 28 }}>
                {!finishedLoading ? (
                  <div style={{ width: isMobile ? 260 : 420, height: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', margin: '0 auto' }}>
                    {/* precise, spring-smoothed progress bar using framer-motion motionValue */}
                    <motion.div
                      style={{ height: '100%', borderRadius: 12, background: 'linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.32))', width }}
                      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                  </div>
                ) : null}

                {!finishedLoading ? (
                  <div style={{ marginTop: 12, fontSize: 14, opacity: 0.95 }}>
                    {!finishedLoading ? `${Math.round(realProgress)}%` : "Ready!"}
                  </div>
                ) : null}

                {finishedLoading ? (
                  <div style={{ marginTop: 22 }}>
                    <button
                      onClick={handleStart}
                      className={"start-button"}
                    >
                      Start
                    </button>
                  </div>
                ) : null}

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CanvasThree
        className="canvas"
        shadows={!isMobile} // ⬅️ Deshabilitar sombras en móviles
        dpr={isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)} // ⬅️ Reducir DPR en móviles
        //framerate="40" // ⬅️ Limitar framerate
        //performance={{ min: 0.8 }}
        onCreated={({ gl }) => {
          gl.outputEncoding = THREE.sRGBEncoding;
          gl.physicallyCorrectLights = true;

          // ⬅️ Configuraciones optimizadas para móvil
          gl.toneMapping = isMobile ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isMobile ? 0.8 : 1;
          gl.shadowMap.enabled = !isMobile;
          gl.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
        }}
      >

        <PerspectiveCamera makeDefault fov={isMobile ? 85 : 50} position={cameraTarget.position} />

        <OrbitControls
          ref={controlsRef}
          enabled={controlsEnabled}
          enableDamping
          dampingFactor={!isMobile ? 0.05 : 0.1}
          target={cameraTarget.target}
          minDistance={2}
          maxDistance={10}
          enablePan={false}
        />

        <Suspense>
          <Physics gravity={islandAnimation == "Bomb" ? [0, 1, 0] : [0, -.8, -.5]} key={islandAnimation == "Bomb" ? `physics-rb` : `physics-no-rb`}>
            <Experience started={started} isMobile={isMobile} />
          </Physics>
        </Suspense>
      </CanvasThree>
    </div >
  );
}
