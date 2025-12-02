import { Html } from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"
import { useContext } from "react"
import { CameraContext } from "../context/CameraContext"
import { FaArrowLeft } from "react-icons/fa"

const ContentWrapper = ({ children, showObject, title, setForceClick }) => {
  const { cameraTarget } = useContext(CameraContext)

  const maskVariants = {
    hidden: {
      scale: 0,
    },
    visible: {
      scale: 1,
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

  return (
    <AnimatePresence mode="wait">
      {showObject && (
        <Html
          center
          transform={false}
          position={[cameraTarget.position[0], cameraTarget.position[1], cameraTarget.position[2] - 0.5]}
        >
          <div className={"container"}>
            <motion.div
              className={"mask"}
              variants={maskVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key="mask"
            />
            <motion.div
              className={"content"}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key="content"
            >
              <div className="content-header">
                <button onClick={() => setForceClick(true)}><FaArrowLeft /> BACK</button>
                <h1>{title}</h1>
              </div>
              {children}
            </motion.div>
          </div>
        </Html>
      )}
    </AnimatePresence>
  )
}

export default ContentWrapper