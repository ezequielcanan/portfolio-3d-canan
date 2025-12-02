import { createContext, useRef, useState } from "react"

export const CameraContext = createContext()

export const CameraContextProvider = ({ children }) => {
  const [cameraTarget, setCameraTarget] = useState({
    position: [3, 4, 3],
    target: [0, 1.7, 0]
  });
  const [origin, setOrigin] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [found, setFound] = useState(null);
  const [animating, setAnimating] = useState(false);
  const controlsRef = useRef();

  return (
    <CameraContext.Provider value={{cameraTarget, setCameraTarget, controlsEnabled, setControlsEnabled, controlsRef, setAnimating, animating, origin, setOrigin, found, setFound}}>
      {children}
    </CameraContext.Provider>
  )
}