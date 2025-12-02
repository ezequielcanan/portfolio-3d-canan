const Lights = ({isMobile}) => {
  return (
    <>
      <hemisphereLight
        skyColor={"#ffffff"}
        groundColor={"#ffffff"}
        intensity={0.5}
      />

      <directionalLight
        castShadow={!isMobile}
        intensity={5}
        color={"#ffffff"}
        position={[6, 10, 6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.1}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
      />

      <directionalLight
        castShadow={!isMobile}
        intensity={2}
        position={[-6, 10, -6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.005}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
      />
    </>
  )
}


export default Lights;