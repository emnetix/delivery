import { AppBar } from "@mui/material";
import { Link, useLocation } from "react-router";


const Header = () => {
  const loc = useLocation();
  // const refEl = useRef(null);
  // useEffect(() => {
  //   console.log(refEl.current)
  // }, [refEl, loc])
  return loc.pathname === '/' 
    ?  undefined
    : (<AppBar position="static" >
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">about</Link></li>
          <li><Link to="/info">info</Link></li>
        </ul>
      </AppBar>)
    
}

export default Header;