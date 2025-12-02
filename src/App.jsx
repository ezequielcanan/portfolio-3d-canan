import Canvas from "./components/Canvas";
import { CameraContextProvider } from "./context/CameraContext";
import { ContentContextProvider } from "./context/ContentContext";
import { useEffect } from "react";
import * as audioManager from "./utils/audioManager";
import crankSound from "./assets/sounds/crank.mp3";
import spaceSound from "./assets/sounds/space.mp3";
import spinSound from "./assets/sounds/spin.mp3";
import ringSound from "./assets/sounds/rings.mp3";
import startSound from "./assets/sounds/start.mp3";
import breathSound from "./assets/sounds/whoosh.mp3";
import smallApplause from "./assets/sounds/small_applause.mp3"
import mediumApplause from "./assets/sounds/medium_applause.mp3"
import applause from "./assets/sounds/applause.mp3"
import openSound from "./assets/sounds/open.mp3";


const App = () => {

  useEffect(() => {
    audioManager.loadAudio("start", startSound).catch(console.error);
    audioManager.loadAudio("crank", crankSound).catch(console.error);
    audioManager.loadAudio("space", spaceSound).catch(console.error);
    audioManager.loadAudio("spin", spinSound).catch(console.error);
    audioManager.loadAudio("ring", ringSound).catch(console.error);
    audioManager.loadAudio("breath", breathSound).catch(console.error);
    audioManager.loadAudio("smallApplause", smallApplause).catch(console.error);
    audioManager.loadAudio("mediumApplause", mediumApplause).catch(console.error);
    audioManager.loadAudio("applause", applause).catch(console.error);
    audioManager.loadAudio("open", openSound).catch(console.error);


    // unlock on first user gesture
    const unlock = () => {
      audioManager.resumeIfNeeded();
      // remove listener after unlocking
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("touchstart", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);


  return (
    <CameraContextProvider>
      <ContentContextProvider>
        <Canvas />
      </ContentContextProvider>
    </CameraContextProvider>
  );
}

export default App;