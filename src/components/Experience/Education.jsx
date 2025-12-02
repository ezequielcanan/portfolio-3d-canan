import { useContext, useEffect, useState } from "react";
import Loader from "../Loader"
import Wrapper from "../Wrapper"
import ContentWrapper from "../ContentWrapper";
import { ContentContext } from "../../context/ContentContext";
import { FaArrowLeft } from "react-icons/fa";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { Avatar, Paper, Typography, Box } from '@mui/material';

const items = [
  {
    date: 'Feb 2025 - Present',
    image: '/images/coursera.png',
    title: 'Artificial Intelligence',
    description: 'Machine Learning courses on Coursera'
  },
  {
    date: 'Apr 2025 - Oct 2025',
    image: '/images/purdue.png',
    title: 'Purdue Global',
    description: "Bachelor's degree in Information Technology"
  },
  {
    date: 'Jan 2025',
    image: '/images/ged.png',
    title: 'GED',
    description: 'GED — High School Equivalency Diploma'
  },
  {
    date: 'Feb 2023 - Mar 2024',
    image: '/images/coderhouse.jpg',
    title: 'Coderhouse',
    description: 'Full Stack Development course'
  }
];


const Education = () => {
  const { setHtml } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showEducation, setShowEducation] = useState(false)
  const objectName = "EDUCATION"

  useEffect(() => {
    if (!showEducation) {
      setHtml(null)
    } else {
      setHtml((
        <>
          <div className="content-header">
            <button onClick={(e) => (e.stopPropagation(), setForceClick(true))}><FaArrowLeft /> BACK</button>
            <h1>{objectName}</h1>
          </div>
          <Timeline position="alternate-reverse">
            {items.map((it, idx) => (
              <TimelineItem key={idx}>
                <TimelineOppositeContent
                  sx={{ m: 'auto 0' }}
                  align="right"
                >
                  {it.date}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot>
                    <Avatar
                      src={it.image}
                      alt={it.title}
                      variant="circular"
                      sx={{ width: 24, height: 24, }}
                    />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: '120px', px: 2 }}>
                  <Typography variant="h6" component="span">
                    {it.title}
                  </Typography>
                  <Typography>{it.description}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </>
      ))
    }

    return () => {
      setHtml(null)
    }
  }, [showEducation])

  return (
    <>
      <Wrapper
        search={"Education_Building"}
        offsetPosition={[0, 0.5, 0.5]}
        offsetLookAt={[0, 0, 0]}
        offsetWaypoint={[1, 2, 1]}
        objectName={objectName}
        setShowObject={setShowEducation}
        forceClick={forceClick}
        setForceClick={setForceClick}
      >
        <Loader url="/models/education.glb" clickable />
      </Wrapper>
    </>
  )
}

export default Education