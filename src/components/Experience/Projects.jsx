import { useContext, useEffect, useState } from "react";
import Loader from "../Loader";
import Wrapper from "../Wrapper";
import ContentWrapper from "../ContentWrapper";
import { ContentContext } from "../../context/ContentContext";
import { FaArrowLeft, FaBlender, FaCss3, FaCss3Alt, FaGithub, FaHtml5, FaNodeJs, FaPython, FaReact } from "react-icons/fa";
import { DiMongodb } from "react-icons/di";
import { SiExpress, SiMongodb, SiMysql, SiNestjs, SiTailwindcss, SiTensorflow, SiThreedotjs } from "react-icons/si";
import { BiLogoBlender, BiLogoFlask } from "react-icons/bi";

const Projects = () => {
  const { setHtml } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const objectName = "PROJECTS"
  const projects = [
    {
      path: "/images/invoice_data_extractor.png",
      title: "Invoice Data Extractor with Machine Learning",
      description: "This web application automates data extraction from fiscal invoices for finance teams. It processes incoming invoices from a dedicated mailbox, using custom-trained AI models to extract both header information and line-item details. The system validates extraction accuracy, normalizes the data, and seamlessly integrates it into a centralized SQL database. Users can test models with sample invoices before deployment to ensure all required fields are captured correctly.",
      position: "center",
      link: "https://github.com/ezequielcanan/nodum_invoice_data_extraction.git",
      skills: (
        <>
          <FaPython/>
          <BiLogoFlask/>
          <SiMysql/>
          <SiTensorflow/>
          <SiTailwindcss/>
          <FaReact/>
        </>
      )
    },
    {
      path: "/images/clothing_management_application.png",
      title: "Clothing Manufacturing Management Application",
      description: "This full-stack platform was designed for a mid-sized apparel manufacturer to optimize operational efficiency. It provides comprehensive tools for inventory management, order processing, and sales invoicing. Key capabilities include real-time stock level monitoring, complete order lifecycle tracking, and an integrated billing module that streamlines financial operations across the manufacturing workflow.",
      position: "left",
      link: "https://github.com/ezequielcanan/factory-react.git",
      skills: (
        <>
          <SiMongodb/>
          <FaNodeJs/>
          <SiNestjs/>
          <SiTailwindcss/>
          <FaReact/>
        </>
      )
    },
    {
      path: "/images/sales.png",
      title: "Budget and Sales Management Application",
      description: "Developed for real-estate development projects, this application enables project managers to create, monitor, and forecast budgets for multi-unit constructions. It features comprehensive sales and payment tracking for apartment purchases, automated Excel report generation for client presentations, and an interactive dashboard with visualization tools for analyzing budget consumption and comparing financial scenarios.",
      position: "left",
      link: "https://github.com/ezequielcanan/inmuebles-z-gastos.git",
      skills: (
        <>
          <SiMongodb/>
          <FaNodeJs/>
          <SiExpress/>
          <SiTailwindcss/>
          <FaReact/>
        </>
      )
    },
    {
      path: "/images/simple_portfolio.png",
      title: "Simple Portfolio Website",
      description: "A personal portfolio website built to showcase projects and skills, featuring a clean and responsive design. The site includes sections for project descriptions, technologies used, and links to GitHub repositories, providing an accessible way for potential employers and collaborators to explore my work. This is an old project that helped me learn the basics of web development and design.",
      position: "left",
      link: "https://github.com/ezequielcanan/portfolio.git",
      skills: (
        <>
          <FaHtml5/>
          <FaCss3Alt/>
          <FaReact/>
          <SiTailwindcss/>
        </>
      )
    },
    {
      path: "/images/3d_portfolio.png",
      title: "3D Interactive Portfolio",
      description: "A futuristic 3D interactive portfolio that invites visitors to explore animated scenes to discover site sections—Contact, Skills, About Me, Projects, Social Media, Education, and Certificates. Interactive objects and reveal animations present content in an exploratory way, enhanced with subtle sound effects for immersion. Includes an in-app console to switch the world's color palette and customize the overall visual atmosphere.",
      position: "center",
      link: "https://github.com/ezequielcanan/portfolio-3d.git",
      skills: (
        <>
          <BiLogoBlender/>
          <FaHtml5/>
          <FaCss3Alt/>
          <FaReact/>
          <SiThreedotjs/>
        </>
      )
    }
  ]

  useEffect(() => {
    if (!showProjects) {
      setHtml(null)
    } else {
      setHtml((
        <>
          <div className="content-header">
            <button onClick={(e) => (e.stopPropagation(), setForceClick(true))}><FaArrowLeft /> BACK</button>
            <h1>{objectName}</h1>
          </div>
          <div className="projects-list">
            {projects.map((project, i) => {
              return <div className="project-item" key={"project"+i}>
                <img src={project?.path} alt={project?.title} style={{ objectPosition: project?.position }} />
                <h2>{project?.title}</h2>
                <p>{project?.description}</p>
                <div className="project-skills">
                  <h3>Skills</h3>
                  <div>
                    {project.skills}
                    <a href={project.link} target="_blank"><FaGithub/></a>
                  </div>
                </div>
              </div>
            })}
          </div>
        </>
      ))
    }

    return () => {
      setHtml(null)
    }
  }, [showProjects])

  return (
    <>
      <Wrapper
        search={"Screen"}
        objectName={objectName}
        setShowObject={setShowProjects}
        forceClick={forceClick}
        setForceClick={setForceClick}
      >
        <Loader url="/models/projects_towers.glb" />
        <Loader url="/models/projects.glb" clickable />
      </Wrapper>
    </>
  );
}

export default Projects;

/*
PROJECTS WITH EXIT

import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../Loader";
import Wrapper from "../Wrapper";
import { Html } from "@react-three/drei";
import { CameraContext } from "../../context/CameraContext";
import { FaArrowLeft } from "react-icons/fa";

const Projects = () => {
  const { cameraTarget } = useContext(CameraContext);
  const [showProjects, setShowProjects] = useState(false);
  const [forceClick, setForceClick] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const onEndAnimation = () => {
    setShowProjects(true);
  }

  const onStartAnimation = () => {
    setShowProjects(false);
  }

  const onReturnAnimation = () => {
    setShowProjects(false);
  }

  const handleClose = () => {
    setIsClosing(true);
    setShowProjects(false);
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
    <>
      <Wrapper
        search={"Screen"}
        onEndAnimation={onEndAnimation}
        onStartAnimation={onStartAnimation}
        onReturnAnimation={onReturnAnimation}
        forceClick={forceClick}
        setForceClick={setForceClick}
      >
        <Loader url="/models/projects_towers.glb" />
        <Loader url="/models/projects.glb" clickable />
      </Wrapper>

      <Html
        center
        transform={false}
        position={[cameraTarget.position[0], cameraTarget.position[1], cameraTarget.position[2] - 0.5]}
      >
        <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
          {showProjects && (
            <motion.div
              className={"container"}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key="projects-container"
            >
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
                <div className="projects-header">
                  <button onClick={handleClose}><FaArrowLeft/></button>
                  <h1>PROJECTS</h1>
                </div>
                <div className="projects-list">
                  <div className="project-item">
                    <img src="/images/invoice_data_extractor.png" alt="Invoice Data Extractor" />
                    <h2>Invoice Data Extractor with Machine Learning</h2>
                    <p>This web application automates data extraction from fiscal invoices for finance teams. It processes incoming invoices from a dedicated mailbox, using custom-trained AI models to extract both header information and line-item details. The system validates extraction accuracy, normalizes the data, and seamlessly integrates it into a centralized SQL database. Users can test models with sample invoices before deployment to ensure all required fields are captured correctly.</p>
                  </div>
                  <div className="project-item">
                    <img src="/images/clothing_management_application.png" alt="Clothing Manufacturing Management Application" />
                    <h2>Clothing Manufacturing Management Application</h2>
                    <p>This full-stack platform was designed for a mid-sized apparel manufacturer to optimize operational efficiency. It provides comprehensive tools for inventory management, order processing, and sales invoicing. Key capabilities include real-time stock level monitoring, complete order lifecycle tracking, and an integrated billing module that streamlines financial operations across the manufacturing workflow.</p>
                  </div>
                  <div className="project-item">
                    <img src="/images/sales.png" alt="Budget and Sales Management Application" />
                    <h2>Budget and Sales Management Application</h2>
                    <p>Developed for real-estate development projects, this application enables project managers to create, monitor, and forecast budgets for multi-unit constructions. It features comprehensive sales and payment tracking for apartment purchases, automated Excel report generation for client presentations, and an interactive dashboard with visualization tools for analyzing budget consumption and comparing financial scenarios.</p>
                  </div>
                  <div className="project-item">
                    <img src="/images/sales.png" alt="Budget and Sales Management Application" />
                    <h2>Budget and Sales Management Application</h2>
                    <p>Developed for real-estate development projects, this application enables project managers to create, monitor, and forecast budgets for multi-unit constructions. It features comprehensive sales and payment tracking for apartment purchases, automated Excel report generation for client presentations, and an interactive dashboard with visualization tools for analyzing budget consumption and comparing financial scenarios.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </>
  );
}

export default Projects;


*/