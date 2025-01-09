import { CSSProperties, useMemo } from 'react';
import { Box } from '@mui/material';
import DefHeader from './features/layout/component/Header';
import DefBody from './features/layout/component/Body';
import Layout from './features/layout/component/Layout';
import { Route, Routes, useLocation } from 'react-router';
import Home from './pages/Home';
import Info from './pages/Home copy';
import About from './pages/About';
import EntDelivery from './pages/ent02/delivery/EntDelivery';

export default function App() {
  const loc = useLocation();

  const containerStyle = useMemo(() => {
    if (loc.pathname === '/') {
      return {
        paddingLeft: '0',
        paddingRight: '0',
        maxWidth: 'none',
      } as CSSProperties
    }

    return {}
  }, [loc])
  
  return (<>
    <Layout />
    <Box style={containerStyle} >
      <DefHeader />
      <DefBody>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ent02/delivery" element={<EntDelivery />} />
          <Route path="/info" element={<Info />} />
          <Route path="/About" element={<About />} />
        </Routes>
      </DefBody>
    </Box>
  </>);
}
