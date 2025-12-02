import { createContext, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FaArrowLeft } from "react-icons/fa"
import * as audioManager from "../utils/audioManager";

export const ContentContext = createContext()

export const ContentContextProvider = ({ children }) => {
  const [forceClick, setForceClick] = useState(false)
  const [showObject, setShowObject] = useState(false);
  const [html, setHtml] = useState(null)
  const [isClosing, setIsClosing] = useState(false);
  const [transparent, setTransparent] = useState(false)
  const [materials, setMaterials] = useState([])
  const [earthColor, setEarthColor] = useState(0x00ffff)
  const [projectionColor, setProjectionColor] = useState(0xfea000)
  const [islandAnimation, setIslandAnimation] = useState(null)
  const [playBackground, setPlayBackground] = useState(true)

  const findMaterial = (name, index = false) => {
    return !index ? materials.find(mat => mat.name == name) : materials.findIndex(mat => mat.name == name)
  }

  const handleClose = () => {
    setIsClosing(true);
    setShowObject(false);
  }

  const handleExitComplete = () => {
    if (isClosing) {
      setForceClick(true);
      setIsClosing(false);
    }
  }

  const containerVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const maskVariants = {
    hidden: {
      width: 0,
      left: "50%"
    },
    visible: {
      width: "100%",
      left: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      scale: 0,
      transition: {
        duration: 0.5,
        ease: [0.55, 0.085, 0.68, 0.53]
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8,
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  useEffect(() => {
    if (!transparent && html) {
      audioManager.play("open");
    }
  }, [transparent, html])

  return (
    <ContentContext.Provider value={{ forceClick, setForceClick, showObject, setShowObject, setPlayBackground, playBackground, setHtml, html, transparent, setTransparent, materials, islandAnimation, setIslandAnimation, setMaterials, findMaterial, earthColor, setEarthColor, projectionColor, setProjectionColor }}>
      {children}
      <AnimatePresence mode="wait">
        {(html) && (
          !transparent ? (
            <div className={"container"} onClick={(e) => e.stopPropagation()}>
              <motion.div
                className={"mask"}
                variants={maskVariants}
                initial="hidden"
                animate="visible"
                key="mask"
              />
              <motion.div
                className={"content"}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                key="content"
              >
                {html}
              </motion.div>
            </div>
          ) : (
            <>
              {html}
            </>
          )
        )}
      </AnimatePresence>
    </ContentContext.Provider >
  )
}