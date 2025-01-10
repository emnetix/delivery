import { FC, useEffect, useMemo, useState } from "react";
import { useQueryStats } from "../api/information.api";
import 'chart.js/auto';
import { Line, } from 'react-chartjs-2'
import { Box, styled } from "@mui/material";
import { ChartData, ChartOptions } from "chart.js/auto";

type BufferData = {
  date?: Date
  countDevice: number
  countSocket: number
}

type ChartDataRaw = {
  sockets: Array<number>
  ids: Array<number>
  labels: Array<string>
}

const MAX = 25;

type Props = {
  refetch: boolean
}

const AccessStats: FC<Props> = ({refetch}) => {
  // const [enabled] = useState(false);
  const refetchInterval = useMemo(() => 1000, [])
  const { data: qData } = useQueryStats({ refetchInterval, enabled: refetch });

  const [bufferDataList, setBufferDataList] = useState<Array<BufferData>>(Array.from({length: MAX}, () => ({ countDevice: 0, countSocket: 0})));

  useEffect(() => {
    if (!qData) return;
    setBufferDataList(old => {
      const arr: Array<BufferData> = [
        ...old, 
        { 
          date: qData.last_updated,
          countSocket: qData.active_connections, 
          countDevice: qData.total_ids 
        }
      ];
      arr.shift();
      return arr;
    })
  }, [qData]) 


  // const [d] = useState<ChartData<"line", number[], unknown>>({ datasets: [{ label: '소켓수', data: [1,2,3,4]}]})
  const options = useMemo<ChartOptions<'line'>>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            precision: 0
          },
          beginAtZero: true
        }
      }
    }
  }, [])
  const data = useMemo<ChartData<"line", number[], unknown>>(() => {
    const { labels, ids, sockets } = bufferDataList.reduce((rst, {date, countDevice, countSocket}) => {
      rst.labels.push(date?.toLocaleTimeString('kr') || '');
      rst.sockets.push(countSocket);
      rst.ids.push(countDevice);
      return rst;
    }, { sockets: [], ids: [], labels: []} as ChartDataRaw)
    return {
      labels,
      datasets: [
        { label: '웹소켓 수', data: sockets },
        { label: 'ID 수', data: ids, borderWidth: 5 }
      ]
    }
  }, [bufferDataList])

  return <StyledAccessStats>
    <Box style={{ height: 480}}>
      <Line data={data} options={options} />
    </Box>
  </StyledAccessStats>
}

const StyledAccessStats = styled(Box)(() => ({

}))

export default AccessStats;