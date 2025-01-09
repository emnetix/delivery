import { useEffect } from "react"
import { bodyResizeStore, windowResizeStore } from "../store/layoutResize.store"


const predictBody = () => {
  const { 
    clientWidth, clientHeight, 
    clientTop, clientLeft, 
    offsetTop, offsetLeft,
  } = document.body;
  bodyResizeStore.set({
    clientWidth, clientHeight,
    clientTop, clientLeft,
    offsetTop, offsetLeft,
  })
}

export const useBodyEvent = () => {
  useEffect(() => {
    predictBody();
    window.addEventListener('resize', predictBody)
    return () => {
      bodyResizeStore.set(undefined);
      window.removeEventListener('resize', predictBody);
    }
  }, [window])
}

const predictWindow = () => {
  const { innerWidth, innerHeight, outerWidth, outerHeight } = window;
  windowResizeStore.set({
    innerWidth, innerHeight,
    outerWidth, outerHeight,
  })
}
export const useWindowEvent = () => {
  useEffect(() => {
    predictWindow();
    window.addEventListener('resize', predictWindow)
    return () => {
      windowResizeStore.set(undefined);
      window.removeEventListener('resize', predictWindow);
    }
  }, [window]) 
}

// export const 