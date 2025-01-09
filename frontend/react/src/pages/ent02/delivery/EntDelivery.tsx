import { Box, CircularProgress, IconButton, styled, Typography, TextField, Button  } from "@mui/material";
import CopyIcon from '@mui/icons-material/ContentCopy'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuid} from 'uuid'
import { SOCKET_ENT, useSocket } from "../../../common/util/socket/socket.util";
import { useXTerm } from 'react-xtermjs'
import { usePrevious } from "../../../common/util/hooks/usePrevious.util";

const EntDelivery: FC = () => {
  const [deviceId, setDeviceId] = useState<string|null>(null);

  const { socket, init, status, release, useOn } = useSocket();

  const isConnected = useMemo(() => status === 'SUCCESS', [status]);
  const prevIsConnected = usePrevious(isConnected);

  const { ref: xtermRef, instance: xterm } = useXTerm();
  const [bufferMsg, setBufferMsg] = useState<Array<string>>([]);
  
  const [content, setContent] = useState('');
  const [targetId, setTargetId] = useState('');

  useOn(SOCKET_ENT.ON_DELIVERY, msg => {
    setBufferMsg(old => [...old, JSON.stringify(msg)])
    // console.log(`[DELIVERY]`, msg);
  })

  const clearTerminal = () => xterm?.clear();
  const sampleJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      device: {
        id: deviceId,
        status: isConnected ? 'connected' : 'disconnected'
      },
      message: 'Hello, World!'
    }
    if (deviceId) {
      const { path, data: d  } = SOCKET_ENT.SEND_DATA(deviceId, deviceId, data);
      socket.emit(path, JSON.stringify(d));
    }
    setContent(JSON.stringify(data))
  }


  useEffect(() => {
    if (!xterm || !bufferMsg.length) return;
    bufferMsg.forEach(msg => xterm.writeln(msg));
    setBufferMsg([]);
  }, [bufferMsg, xterm])

  useEffect(() => {
    if (status === 'SUCCESS') {
      if (!deviceId) return;
      setBufferMsg(old => [...old, '소켓 연결 완료', '서버에 디바이스 고유키 전송 중...'])
      const { path, data } = SOCKET_ENT.SET_ID(deviceId);
      socket.emit(path, JSON.stringify(data));
      setBufferMsg(old => [...old, `전송 완료: ${deviceId}`])

    } else if (status === 'WAITING' ) {
      const msgss = [...bufferMsg];
      if (prevIsConnected)
          msgss.push('연결 끊김');
      msgss.push('디바이 고유키 초기화');
      setBufferMsg(msgss);
      setDeviceId(uuid());
    }
  }, [status])

  useEffect(() => {
    init();
    return () => {
      release();
    }
  }, [])

  const LinkComp = useMemo(() => {
    if (status === 'INITIALIZING') return <Box display="flex"><CircularProgress size={16}/></Box>
    else return isConnected ? <LinkIcon className="link"  />: <LinkOffIcon className="link"/>;
  }, [status, isConnected]);

  return <StyledBox>
    <Box className="title-box" >
      <Typography variant="subtitle1" component='span' >전송 시험</Typography>
      {LinkComp}
      <Typography variant="subtitle2" component='span' fontWeight={700}>{deviceId}</Typography>
      <IconButton>
        <CopyIcon />
      </IconButton>
    </Box>  
    <div ref={xtermRef}/>
    <StyledEnditor >
      <TextField value={content} onChange={evt => setContent(evt.target.value)} 
        multiline variant="outlined" placeholder="전송할 데이터를 입력하세요"
      />
      <TextField value={targetId} onChange={evt => setTargetId(evt.target.value)}
        placeholder="대상 디바이스 아이디"  size="small"
      />
      <Button>전송</Button>
      <Button onClick={clearTerminal}>터미널 클리어</Button>
      <Button onClick={sampleJson}>샘플 JSON</Button>
    </StyledEnditor>
  </StyledBox>
}

const StyledBox = styled(Box)({
  
  '& > .title-box': {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',

    '& svg': {
      width: '16px'
    },

    '& .link': {
      margin: '0 4px'
    },

    '& > span': {
      margin: '0 4px',
      // '&:first-of-type': {
      //   marginLeft: '16px',
      //   backgroundColor: 'red'
      // }
    }
  }
})

const StyledEnditor = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',

}))

export default EntDelivery;