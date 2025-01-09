import { useStore } from "../../../common/util/store/store.util";
import { useBodyEvent, useWindowEvent } from "../logic/layoutResize.logic";
import { bodyResizeStore, windowResizeStore } from "../store/layoutResize.store";


const Layout = () => {
  useBodyEvent();
  useWindowEvent();

  return undefined;
}

export const useBodyLayout = () => {
  const [resize] = useStore(bodyResizeStore)
  return resize;
}
export const useWindowLayout = () => {
  const [resize] = useStore(windowResizeStore)
  return resize;
}

export default Layout;