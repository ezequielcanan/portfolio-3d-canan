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
      link: "https://github.com/ezequielcanan/portfolio-3d-canan.git",
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