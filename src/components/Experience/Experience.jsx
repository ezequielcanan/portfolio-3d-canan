import Projects from "./Projects"
import Lights from "./Lights"
import Contact from "./Contact"
import Island from "./Island"
import Earth from "./Earth"
import Console from "./Console"
import Education from "./Education"
import SocialMedia from "./SocialMedia"
import Certificates from "./Certificates"
import Skills from "./Skills"
import Background from "./Background"

const Experience = ({isMobile}) => {
  return (
    <>
      <Lights isMobile={isMobile}/>
      <Island />
      <Earth gridColor="cyan" />
      <Skills/>
      <Certificates isMobile={isMobile}/>
      <Education />
      <SocialMedia />
      <Console />
      <Projects/>
      <Contact />
      <Background />
    </>
  )
}
export default Experience
