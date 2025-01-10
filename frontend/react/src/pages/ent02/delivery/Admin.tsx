import { Box, styled, Typography } from "@mui/material";
import { FC } from "react";
import UserTable from "../../../features/admin/component/UserTable";
import AccessStats from "../../../features/admin/component/AccessStats";


const DeliveryAdmin: FC = () => {

  return <StyledBox>
    <Box className="title-box">
      <Typography variant="subtitle1" component='span' >현황 로그</Typography>
      <AccessStats />
      <UserTable />
    </Box>
  </StyledBox>
}

const StyledBox = styled(Box)(({theme}) => ({
  
  '& > .title-box': {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    padding: theme.spacing(1),
    '& > .MuiTypography-root': {
      fontWeight: theme.typography.fontWeightBold,
    }
  }
}))

export default DeliveryAdmin;