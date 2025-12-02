import { Vector3 } from "three"

export class CameraAnimation {
  constructor() { }

  setup = (pointsPositions, lookAtPositions, isAnimating, controlsActivate, currentCamera, camera, controls, onCameraMove, speed = 0.5, setShowObject, forAnimation = true) => {
    this.animationProgress = 0
    this.targetPosition = new Vector3()
    this.targetLookAt = new Vector3()
    this.startPosition = new Vector3()
    this.startLookAt = new Vector3()
    this.waypointPosition = new Vector3()
    this.waypointLookAt = new Vector3()
    this.currentCamera = currentCamera
    this.controlsActivate = controlsActivate
    this.isAnimating = isAnimating
    this.lookAtPositions = lookAtPositions
    this.pointsPositions = pointsPositions
    this.controls = controls
    this.camera = camera
    this.onCameraMove = onCameraMove
    this.speed = speed
    this.returning = false
    this.origin = true

    this.targetObjectCameraPosition = this.pointsPositions[this.pointsPositions.length - 1]
    this.targetObjectLookAt = this.lookAtPositions[this.lookAtPositions.length - 1]
    if (forAnimation) {
      controlsActivate(false)
    }


    if (this.currentCamera.position[0] === this.targetObjectCameraPosition.x &&
      this.currentCamera.position[1] === this.targetObjectCameraPosition.y &&
      this.currentCamera.position[2] === this.targetObjectCameraPosition.z) {

      this.targetPosition.set(3, 4, 3);
      this.targetLookAt.set(0, 1.7, 0);
      if (forAnimation) {
        controlsActivate(true);
      }
      this.returning = true
    } else {
      this.targetPosition.copy(this.targetObjectCameraPosition);
      this.targetLookAt.copy(this.targetObjectLookAt);

      const customWaypointPosition = this.pointsPositions[0]
      const customWaypointLookAt = this.targetObjectLookAt


      this.waypointPosition.copy(customWaypointPosition);
      this.waypointLookAt.copy(customWaypointLookAt);
      this.returning = false
      this.origin = false
    }

    this.startPosition = this.camera.position.clone()

    this.startLookAt.set(
      this.currentCamera.target[0],
      this.currentCamera.target[1],
      this.currentCamera.target[2]
    );

    this.animationProgress = 0;
    this.isAnimating.current = forAnimation;

    if (setShowObject) {
      setShowObject(false)
    }
  }


  animate = (delta, setAnimating, onEndAnimation, onReturnAnimation, setOrigin, onEndFirstAnimation, setShowObject, objectName) => {
    this.animationProgress += delta * this.speed;

    if (this.animationProgress >= 1) {
      this.animationProgress = 1;
      this.isAnimating.current = false;
      this.onCameraMove({
        position: this.targetPosition.toArray(),
        target: this.targetLookAt.toArray()
      });

      if (this.controls.current) {
        this.controls.current.target.copy(this.targetLookAt);
        this.controls.current.update();
        setAnimating(false);
        if (onEndAnimation) onEndAnimation();
        if (setShowObject) setShowObject(objectName)
        if (this.returning) {
          this.origin = true;
          setOrigin(true);
          if (setShowObject) setShowObject(false)
          if (onReturnAnimation) onReturnAnimation();
        } else {
          setOrigin(false);
          onEndFirstAnimation();
        }
      }
    }

    const t = this.easeInOutCubic(this.animationProgress);

    let currentPosition, currentLookAt;

    if (!this.returning) {
      const oneMinusT = 1 - t;
      currentPosition = new Vector3()
        .copy(this.startPosition)
        .multiplyScalar(oneMinusT * oneMinusT)
        .add(
          this.waypointPosition.clone().multiplyScalar(2 * oneMinusT * t)
        )
        .add(
          this.targetPosition.clone().multiplyScalar(t * t)
        );

      // LookAt: También usa curva de Bézier
      currentLookAt = new Vector3()
        .copy(this.startLookAt)
        .multiplyScalar(oneMinusT * oneMinusT)
        .add(
          this.waypointLookAt.clone().multiplyScalar(2 * oneMinusT * t)
        )
        .add(
          this.targetLookAt.clone().multiplyScalar(t * t)
        );
    } else {
      currentPosition = new Vector3().lerpVectors(
        this.startPosition,
        this.targetPosition,
        t
      );

      currentLookAt = new Vector3().lerpVectors(
        this.startLookAt,
        this.targetLookAt,
        t
      );
    }

    this.camera.position.copy(currentPosition);
    this.camera.lookAt(currentLookAt);
  }

  easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
}

