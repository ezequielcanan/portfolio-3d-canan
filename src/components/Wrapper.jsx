import React, { useContext, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import Loader from "./Loader";
import { CameraAnimation } from "../utils/utils";
import { CameraContext } from "../context/CameraContext";
import { Html } from "@react-three/drei";
import { FaChevronLeft } from "react-icons/fa";
import { ContentContext } from "../context/ContentContext";
import * as audioManager from "../utils/audioManager";


const Wrapper = ({ search, objectName = "PROJECTS", onStartAnimation = () => {}, setShowObject = () => {}, onEndAnimation = () => { }, forceClick, setForceClick, onReturnAnimation = () => { }, speed = 0.4, offsetPosition = [0, -0.02, 0.3], offsetLookAt = [0, -0.02, 0], offsetWaypoint = [0, -0.5, 3], children }) => {
  const { cameraTarget: currentCameraTarget, setCameraTarget: onCameraMove, controlsEnabled, setControlsEnabled: onControlsEnableChange, controlsRef, setAnimating, animating, setOrigin, origin, setFound, found } = useContext(CameraContext);
  const {islandAnimation, setPlayBackground} = useContext(ContentContext);

  const { camera } = useThree();
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const cameraAnimationRef = useRef(null);
  if (!cameraAnimationRef.current) {
    cameraAnimationRef.current = new CameraAnimation(onCameraMove, camera, controlsRef);
  }
  const cameraAnimation = cameraAnimationRef.current;

  const onClick = (e, forceObject = false) => {
    let object = forceObject
    if (!forceObject) {
      e.stopPropagation()
      if (isAnimating.current) return;
      object = e?.object.name == search ? e.object : e.object.parent.name == search ? e.object.parent : (e.object.parent?.children?.find(mesh => mesh.name === search)) || ((e.object.parent?.parent?.children?.find(mesh => mesh.name === search) || e.object.parent?.parent?.parent?.children?.find(mesh => mesh.name === search)) || e.object.parent?.parent?.parent?.parent?.children?.find(mesh => mesh.name === search))
      if (found && object.name != found.name) return;
      setAnimating(true);
      setFound(object)
    }

    audioManager.play("breath");
    const objectPosition = object.position.clone()
    const targetObjectCameraPosition = objectPosition.clone().add(new Vector3(...offsetPosition));
    const targetObjectLookAt = objectPosition.clone().add(new Vector3(...offsetLookAt));
    const customWaypointPosition = objectPosition.clone().add(new Vector3(...offsetWaypoint));
    const customWaypointLookAt = targetObjectLookAt

    cameraAnimation.setup(
      [customWaypointPosition, targetObjectCameraPosition],
      [customWaypointLookAt, targetObjectLookAt],
      isAnimating,
      onControlsEnableChange,
      currentCameraTarget,
      camera,
      controlsRef,
      onCameraMove,
      speed = speed,
      setShowObject
    )
  }

  const onEndFirstAnimation = () => {
  }

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    cameraAnimation.animate(delta, setAnimating, onEndAnimation, () => {
      onReturnAnimation()
      setFound(null)
    }, setOrigin, onEndFirstAnimation, setShowObject, objectName)
  });

  useEffect(() => {
    if (!forceClick) return;
    setPlayBackground(false)
    audioManager.play("start");
    setForceClick(false);
    onClick(false, found);
  }, [forceClick, found]);

  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        if (child.props.clickable && !islandAnimation) {
          return (
            React.cloneElement(child, { ...child.props, onClick: e => {
              if (!animating && origin) {
                onClick(e)
              }
              if (child.props.onClick) {
                child.props.onClick(e)
              }
            }})
          )
        } else {
          return React.cloneElement(child, { ...child.props, onClick: (e) => (e.stopPropagation()) } )
        }
      })}
    </>
  );
};

export default Wrapper;