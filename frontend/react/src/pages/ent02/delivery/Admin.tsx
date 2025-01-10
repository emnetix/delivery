import { Box, Checkbox, FormControlLabel, styled, Typography } from "@mui/material";
import { ChangeEvent, FC, useState } from "react";
import UserTable from "../../../features/admin/component/UserTable";
import AccessStats from "../../../features/admin/component/AccessStats";
import LogsTerminal from "../../../features/admin/component/LogsTerminal";


const DeliveryAdmin: FC = () => {

  const [ refetchUser, setRefetchUser ] = useState(true);
  const [ refetchAccess, setRefetchAccess ] = useState(true);

  const onRefetchUser = (event: ChangeEvent<HTMLInputElement>) => setRefetchUser(event.target.checked);
  const onRefetcAccess = (event: ChangeEvent<HTMLInputElement>) => setRefetchAccess(event.target.checked);
  

  return <StyledBox>
    <Box className="title-box">
      <Typography variant="subtitle1" component='span' >현황 로그</Typography>
      <LogsTerminal />
      <FormControlLabel
        checked={refetchAccess}
        control={<Checkbox size="small" />} 
        label={<Typography variant="body2">연결 현황 자동 갱신</Typography>} 
        onChange={onRefetcAccess as never}
      />
      <FormControlLabel
          checked={refetchUser}
          control={<Checkbox size="small" />} 
          label={<Typography variant="body2">ID 목록 자동 갱신</Typography>} 
          onChange={onRefetchUser as never}
        />
      <AccessStats refetch={refetchAccess} />
      <UserTable refetch={refetchUser} />
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