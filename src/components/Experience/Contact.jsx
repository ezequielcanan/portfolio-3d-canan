import { useContext, useEffect, useRef, useState } from "react";
import Loader from "../Loader";
import Wrapper from "../Wrapper";
import { OrbitControls } from "@react-three/drei";
import { ContentContext } from "../../context/ContentContext";
import { FaArrowLeft } from "react-icons/fa";
import { TextField } from "@mui/material"
import emailjs from "@emailjs/browser"
import { BiSend } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";

const Contact = () => {
  const { setHtml, setTransparent } = useContext(ContentContext)
  const [forceClick, setForceClick] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false)

  const onSubmit = (data) => {
    setSending(true);
    const templateParams = {
      email: data.email,
      message: data.message,
      // agrega otros campos que use tu template en EmailJS
    };

    emailjs.send(import.meta.env.VITE_SERVICE_ID_EMAIL, import.meta.env.VITE_TEMPLATE_ID_EMAIL, templateParams, import.meta.env.VITE_OPTIONS_EMAIL)
      .then((response) => {
        //console.log("SUCCESS!", response.status, response.text);
        reset();
        setSuccess(true)
        setTimeout(() => {
          setForceClick(true)
          setSuccess(false)
        }, 700)
      })
      .catch((err) => {
        console.error("FAILED...", err);
      })
      .finally(() => {
        setSending(false)
      });
  };

  useEffect(() => {
    if (!showContact) {
      setHtml(null)
    } else {
      setHtml((
        <>
          <div className="content-header">
            <button onClick={(e) => (e.stopPropagation(), setForceClick(true))}><FaArrowLeft /> BACK</button>
            <h1>CONTACT</h1>
          </div>
          <div className="contact-container">
            <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
              <TextField
                label="Your email"
                variant="standard"
                className="textfield"
                {...register("email", {
                  required: { value: true, message: "Email is required" },
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                label="Message"
                variant="standard"
                className="textfield"
                multiline
                rows={2}
                {...register("message", {
                  required: { value: true, message: "Message is required" },
                })}
                error={!!errors.message}
                helperText={errors.message?.message}
              />

              <button
                type="submit"
                className="send-btn"
                disabled={sending || success}
              >
                <BiSend />

                <AnimatePresence mode="wait">
                  <motion.span
                    key={success ? "sent" : sending ? "sending" : "send"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-block", marginLeft: "6px" }}
                  >
                    {success ? "Sent!" : sending ? "Sending..." : "Send"}
                  </motion.span>
                </AnimatePresence>
              </button>
            </form>
          </div>
        </>
      ))
    }

    return () => {
      setHtml(null)
    }
  }, [showContact, sending, success])

  return (
    <Wrapper
      search={"Message"}
      offsetPosition={[0, 0, 0.2]}
      offsetLookAt={[0, 0, 0]}
      offsetWaypoint={[0, 1, 1]}
      onReturnAnimation={() => setTransparent(false)}
      objectName={"CONTACT"}
      setShowObject={setShowContact}
      forceClick={forceClick}
      setForceClick={setForceClick}
    >
      <Loader url="/models/contact.glb" clickable />
    </Wrapper>
  )
};

export default Contact;