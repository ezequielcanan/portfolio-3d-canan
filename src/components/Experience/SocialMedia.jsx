import { useContext, useEffect, useState } from "react";
import Loader from "../Loader";
import Wrapper from "../Wrapper";
import { ContentContext } from "../../context/ContentContext";
import { FaArrowLeft } from "react-icons/fa";

const SocialMedia = () => {
  const { setHtml, setTransparent } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showSocialMedia, setShowSocialMedia] = useState(false)
  const socialMediaLinks = {
    Linkedin: "https://www.linkedin.com/in/ezequiel-canan-704936256/",
    Whatsapp: "https://wa.me/5491126505361?text=Hola%20",
    Github: "https://github.com/ezequielcanan",
    X: "https://x.com/ezequielcanan",
    Discord: "https://discordapp.com/users/1354805708759236678",
    Gmail: "mailto:ezequielcanan@gmail.com"
  }


  useEffect(() => {
    if (!showSocialMedia) {
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
  }, [showSocialMedia])

  const onClickSocialMedia = (e) => {
    const materialName = e.object?.material?.name || "";
    if (socialMediaLinks[materialName]) {
      window.open(socialMediaLinks[materialName], "_blank");
    }
  }

  return (
    <>
      <Wrapper
        search={"Social_Media_Tree"}
        offsetPosition={[1, 1, 0]}
        offsetLookAt={[0, 0.5, 0]}
        offsetWaypoint={[1.5, 2, 0]}
        objectName={"SOCIAL MEDIA"}
        onReturnAnimation={() => setTransparent(false)}
        setShowObject={setShowSocialMedia}
        forceClick={forceClick}
        setForceClick={setForceClick}
      >
        <Loader url="/models/social_media.glb" clickable onClick={onClickSocialMedia}/>
      </Wrapper>
    </>
  )
}

export default SocialMedia;