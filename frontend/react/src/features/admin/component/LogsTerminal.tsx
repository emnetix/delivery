import { Box, Button, Checkbox, FormControlLabel, styled, Typography } from "@mui/material"
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react"
import { useXTerm } from "react-xtermjs"
import { MessageBuffer, printToTerminal, XTERM_OPTIONS } from "../../xterm/logic/xterm.logic"
import { useQueryLogs } from "../api/information.api"


const LEVEL_COLOR = {
  ERROR: 'red',
  WARN: 'yellow',
  INFO: 'green',
}

const LogsTerminal: FC = () => {
  const { ref, instance: xterm } = useXTerm({ options: XTERM_OPTIONS })
  

  const [lastDate, setLastDate] = useState<Date|null>(null);
  const param = useMemo(() => ({after: lastDate || undefined}), [lastDate]);
  const [active, setActive] = useState(false);
  
  const [bufferMsg, setBufferMsg] = useState<Array<MessageBuffer>>([]);
  
  const { data: qData, refetch } = useQueryLogs(param, { enabled: active});

  useEffect(() => {
    if (!qData || !active) return;
    const { app_info, logs } = qData;
    const buffer = [...bufferMsg];
    if (!lastDate) {
      const { environment, name, version } = app_info;
      buffer.push({ color: 'blue', prefix: '', message: '=== 애플리케이션 정보 ===' });
      buffer.push({ color: 'blue', prefix: '', message: `이름 : ${name}` });
      buffer.push({ color: 'blue', prefix: '', message: `버전 : ${version}` });
      buffer.push({ color: 'blue', prefix: '', message: `환경 : ${environment}` });
      buffer.push({ color: 'blue', prefix: '', message: '=========================' });
    }
    logs.forEach(({ level, message, service, timestamp }) => {
      buffer.push({
        color: LEVEL_COLOR[level as never],
        prefix: `[${timestamp.toLocaleTimeString('ko-KR')}] [${level}] ${service} -`,
        message,
      })
    })

    setBufferMsg(buffer);
    const lastD = qData.logs.at(-1)?.timestamp;
    if (lastD)
      setLastDate(lastD);
    
  }, [qData])

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    // console.log(event);
    setActive(event.target.checked);
  }
  const clearTerminal = () => {
    xterm?.clear();
    setBufferMsg(old => [...old, '로그 클리어'])
  };

  const initLog = () => {
    setLastDate(null);
    setBufferMsg(old => [...old, '로그 수집 리셋']);
  }

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
    if (active) refetch();
  }, [active])

  useEffect(() => {
    console.log(lastDate);
  }, [lastDate])
  return <StyledLogsTerminal>
    <div ref={ref} />
    <div className="actionBox">
      <Button size="small" variant="contained" color="warning" onClick={clearTerminal} >로그 클리어</Button>
      <Button size="small" variant="contained" color="error" onClick={initLog}>로그 수집 리셋</Button>
      <FormControlLabel 
        checked={active}
        control={<Checkbox size="small" />} 
        label={<Typography variant="body2">로그 수집 활성화</Typography>} 
        onChange={onChange as never}
      />
    </div>
  </StyledLogsTerminal>
}

const StyledLogsTerminal = styled(Box)(({ theme }) => ({
  '& .terminal': {
    padding: theme.spacing(1)
  },
  
  '& > .actionBox': {
    display: 'flex',
    alignItems: 'center',
    '& > button': {
      margin: theme.spacing(1),
      '&:first-of-type': {
        marginLeft: 0
      },
      '&:last-of-type': {
        marginRight: 0
      },
    },
    '& > .MuiFormControlLabel-root': {
      margin: theme.spacing(1)
    }

  }
}))

export default  LogsTerminal;