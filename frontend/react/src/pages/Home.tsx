import { styled, Box, Button } from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router";



const Home: FC = () => {
  const navi = useNavigate();

  const goTestPage = () => {
    navi('/ent02/delivery')
  }

  return <StyledWrapp>
    <StyledItem bgcolor="primary.dark">
    </StyledItem>
    <StyledItem>
      <Button variant="contained">Admin</Button>
      <Button variant="contained" onClick={goTestPage}>Test</Button>
      <Button variant="contained">FaLinux</Button>
    </StyledItem>
  </StyledWrapp>
}

const StyledWrapp = styled('div')({
  display: 'flex',
  width: '100%',
  height: '100%',
  alignItems: 'stretch',
})

const StyledItem = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > button': {
    margin: '4px'
  }
})
export default Home;

