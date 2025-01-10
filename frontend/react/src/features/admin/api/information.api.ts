import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query"
import { BaseAxios } from "../../../common/util/api/axios.util"

type UseQueryOptions = Omit<UndefinedInitialDataOptions, 'queryKey' | 'queryFn'>

// 최대 로그 수를 상수로 정의
const MAX_LOGS = 100



// // 최대 데이터 포인트 수를 360개로 설정
// const MAX_DATA_POINTS = 360
type Log = {
  level: string
  message: string
  service: string
  timestamp: Date
}
type AdminLogs = {
  app_info: {
    environment: string
    name: string
    version: string
  },
  log_info: {
    first_log_timestamp: Date
    last_log_timestamp: Date
    total_logs: number
  },
  logs: Array<Log>,
}

type GetLogsParam = Partial<{
  after: Date
}>

export const getLogs = ({ after }: GetLogsParam = {}) => BaseAxios.get('/api/v1/ent02delivery/admin/logs', { params: { limit: MAX_LOGS, after} })
  .then<AdminLogs>(res => {
    const { status, data } = res;
    if (status === 200) {
      const { first_log_timestamp, last_log_timestamp } = data.log_info
      data.log_info.first_log_timestamp = new Date(`${first_log_timestamp}Z`);
      data.log_info.last_log_timestamp = new Date(`${last_log_timestamp}Z`);
      data.logs = (data.logs as Array<Log>).map(({timestamp, ...other}) => ({...other, timestamp: new Date(`${timestamp}Z`)}))
      const { status: _, ...other } = data;
      return other;
    } else {
      throw new Error(`Status Is Not 200 ${res.status}`)
    }
  })
// /api/v1/ent02delivery/admin/ids?

type GetIdsParam = Partial<{
  page: number
  pageSize: number
}>

type Pagination<T> = {
  list: Array<T>
  pagination: {
    page: number
    pageSize: number
  }
}


type IdInfo = {
  id: string
  lastAccessTime: Date
  sid: string
}

export const getIds = ({ page = 1, pageSize = 10 }: GetIdsParam = {}) => {
  return BaseAxios.get('/api/v1/ent02delivery/admin/ids', {
    params: { page, pageSize }
  }).then<Pagination<IdInfo>>(res => {
    const { status, data } = res;
    if (status === 200) {
      const {ids, pagination} = data;
      return {
        list: (ids as Array<IdInfo>).map(({lastAccessTime, ...other}) => ({
          ...other,
          lastAccessTime: new Date(lastAccessTime),
        })),
        pagination
      }
    } else {
      throw new Error(`Status Is Not 200 ${res.status}`)
    }
  })
}

type Stats = {
  active_connections: number
  last_updated: Date
  total_ids: number
}

export const getStats = () => BaseAxios.get('/api/v1/ent02delivery/admin/stats')
  .then<Stats>(res => {
    const { status, data } = res;
    if (status === 200) {
      const { stats } = data;
      const { last_updated, ...other } = stats;
      return {
        last_updated: new Date(`${last_updated}Z`),
        ...other
      }
    } else {
      throw new Error(`Status Is Not 200 ${res.status}`)
    }
  })


const ADMIN_QUERY_ROOT = 'ADMIN'
export const ADMIN_QUERY_KEY = {
  ids: (param: GetIdsParam) => [ADMIN_QUERY_ROOT, 'IDS', param],
  stats: () => [ADMIN_QUERY_ROOT, 'STATS']
}

export const useQueryIds = (param: GetIdsParam) => {

  return useQuery({
    queryKey: ADMIN_QUERY_KEY.ids(param),
    queryFn: () => getIds(param),
  })
} 

export const useQueryStats = (option?:UseQueryOptions) => {
  return useQuery({
    ...option,
    queryKey: ADMIN_QUERY_KEY.stats(),
    queryFn: () => getStats()
  } as UndefinedInitialDataOptions<Stats>)
}