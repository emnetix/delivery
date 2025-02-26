import { Box, CircularProgress, IconButton, styled, Typography, TextField, Button, Paper, FormControlLabel, Checkbox  } from "@mui/material";
import CopyIcon from '@mui/icons-material/ContentCopy'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from 'uuid'
import { SOCKET_ENT, useSocket } from "../../../common/util/socket/socket.util";
import { useXTerm } from 'react-xtermjs'
import { usePrevious } from "../../../common/util/hooks/usePrevious.util";
import { MessageBuffer, printToTerminal, XTERM_OPTIONS } from "../../../features/xterm/logic/xterm.logic";

type SocketData = {
  from: string,
  to: string,
  payload: {
    timestamp: string,
    device: {
      id: string,
      status: string
    },
    message: string
  }
}

const EntDelivery: FC = () => {
  const [deviceId, setDeviceId] = useState<string|null>(null);
  const [content, setContent] = useState('');
  const [targetId, setTargetId] = useState('');
  const [autoSend, setAutoSend] = useState(false);

  const [intervalKey, setIntervalKey] = useState<number|null>(null);

  const { socket, init, status, release, useOn } = useSocket();

  const isConnected = useMemo(() => status === 'SUCCESS', [status]);
  const prevIsConnected = usePrevious(isConnected);

  const { ref: xtermRef, instance: xterm } = useXTerm({
    options: XTERM_OPTIONS
  });
  const [bufferMsg, setBufferMsg] = useState<Array<MessageBuffer>>([]);
  

  const disabledSubmit = useMemo(() => {
    if (!status || !content || !targetId) return true;
    try {
      return typeof JSON.parse(content) !== 'object';
    } catch {
      return true
    }
  }, [status, content, targetId])

  const allowSend = useRef(!disabledSubmit);
  useEffect(() => {
    allowSend.current = !disabledSubmit;
  }, [disabledSubmit])

  const onAutoSend = (event: ChangeEvent<HTMLInputElement>) => {
    setAutoSend(event.target.checked);
  }

  const submit = () => {
    if (!deviceId) return;
    const { path, data } = SOCKET_ENT.SEND_DATA(deviceId, targetId, JSON.parse(content))
    socket.emit(path, JSON.stringify(data));
    setBufferMsg(old => [...old, {
      prefix: '>> 송신 데이터 :\r\n',
      color: 'green',
      message: JSON.stringify(data, null, 2), 
    }])
  }
  const copyMyId = () => {
    if (!deviceId) return;
    navigator.clipboard.writeText(deviceId);

  }
  const clearTerminal = () => xterm?.clear();
  const sampleJson = () => {
    if (!deviceId) return;

    const data = {
      timestamp: new Date().toISOString(),
      device: {
        id: deviceId,
        status: isConnected ? 'connected' : 'disconnected'
      },
      message: 'Hello, World!'
    }
    setContent(JSON.stringify(data, null, 2))
  }

  useOn(SOCKET_ENT.ON_DELIVERY, msg => {
    const response = msg as SocketData;
    if (response?.from) 
      setTargetId(response.from);
    
    setBufferMsg(old => [...old, {
      prefix: '<< 수신 데이터 :\r\n',
      color: 'cyan',
      message: JSON.stringify(msg, null, 2)
    }]);
  })

  useEffect(() => {
    if (!xterm || !bufferMsg.length) return;
    bufferMsg.forEach(msg => {
      const { message, prefix = '[!]', color  } = typeof msg === 'object' ? msg : { message: msg};
      const mm = printToTerminal(message, prefix, color);
      mm.forEach(m => xterm.writeln(m));
    });
    setBufferMsg([]);
  }, [bufferMsg])

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
      msgss.push('디바이스 고유키 초기화');
      setBufferMsg(msgss);
      setDeviceId(uuid());
    }
  }, [status])

  const clearInterval_ = () => {
    if (intervalKey === null) return;
    clearInterval(intervalKey);
    // setAutoSend(false);
  }

  useEffect(() => {
    if (autoSend) {
      clearInterval_();
      setIntervalKey(
        setInterval(() => {
          if (allowSend.current) submit();
        }, 1500)
      )
    } else {
      clearInterval_();
    }

    return clearInterval_
  }, [autoSend])

  useEffect(() => {
    init();
    return release;
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
      <IconButton onClick={copyMyId}>
        <CopyIcon />
      </IconButton>
    </Box>  
    <StyledTerminalWrap>
      <div id="myXterm" ref={xtermRef} />
    </StyledTerminalWrap>
    <StyledEnditor >
      <StyledPaper>
        <TextField value={content} onChange={evt => setContent(evt.target.value)} 
          multiline variant="outlined" label="전송할 데이터" size="small"
        />
      </StyledPaper>
      <StyledPaper color="primary" > 
        <TextField value={targetId} onChange={evt => setTargetId(evt.target.value)}
          label="대상 디바이스 아이디"  size="small" 
        />
        <Button variant="contained" disabled={disabledSubmit} onClick={submit} size="large" >전송</Button>
      </StyledPaper>
      <Button onClick={clearTerminal}>터미널 클리어</Button>
      <Button onClick={sampleJson}>샘플 JSON</Button>
      <FormControlLabel
        checked={autoSend}
        control={<Checkbox size="small" />} 
        label={<Typography variant="body2">자동 전송</Typography>} 
        onChange={onAutoSend as never}
      />
    </StyledEnditor>
  </StyledBox>
}

const StyledPaper = styled(Paper)(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  '& >.MuiTextField-root': {
    flex: 1
  }
}))
const StyledTerminalWrap = styled(Box)(({theme}) => ({
  padding: theme.spacing(1),
  '& .terminal': {
    padding: theme.spacing(1)
  }
}))

const StyledBox = styled(Box)(({theme}) => ({
  
  '& > .title-box': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),

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
}))

const StyledEnditor = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',

}))

export default EntDelivery;