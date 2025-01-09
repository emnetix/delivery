import { CSSProperties, FC, PropsWithChildren, useMemo } from "react";
import { useLocation } from "react-router";
import { useBodyLayout } from "./Layout";



const Body: FC<PropsWithChildren> = ({ children }) => {
  const loc = useLocation();
  const body = useBodyLayout();

  const containerStyle = useMemo(() => {
    if (!body) return {};
    
    if (loc.pathname === '/') {
      const { clientHeight } = body;
      return {
        height: `${clientHeight}px`
      } as CSSProperties
    }

    return {}
  }, [body, loc])
  
  return <div style={containerStyle}>{children}</div>;
}

export default Body;