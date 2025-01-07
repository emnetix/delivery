<script setup lang="tsx">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import {
  ElTabs,
  ElTabPane,
  ElButton,
  ElMessage,
  ElCheckbox,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElRow,
  ElCol,
  ElCard,
  ElSkeleton
} from 'element-plus'
import { useRouter } from 'vue-router'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import axios from 'axios'
import { Echart } from '@/components/Echart'
import type { EChartsOption } from 'echarts'
import { set } from 'lodash-es'

import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'

const mainActiveTab = ref<string>('setting')

const terminalRef = ref<HTMLElement | null>(null)
const terminal = ref<Terminal | null>(null)

const router = useRouter()
const goToHome = () => {
  router.push('/catalog')
}

const isLogEnabled = ref(false) // 로그 수집 활성화 상태
let logTimer: ReturnType<typeof setTimeout> | null = null // 타이머 참조 저장용

// 마지막 로그 타임스탬프 추적을 위한 변수 추가
const lastLogTimestamp = ref<string | null>(null)
// 앱 정보 표시 여부를 추적하기 위한 변수 추가
let appInfoDisplayed = false

// 최대 로그 수를 상수로 정의
const MAX_LOGS = 100

// 최대 데이터 포인트 수를 360개로 설정
const MAX_DATA_POINTS = 360

// API 기본 URL 상수 추가
const API_BASE_URL = 'https://delivery.emnetix.net'
// const API_BASE_URL = ''

// 로그 데이터 가져오기 함수 수정
const fetchLogs = async () => {
  if (!isLogEnabled.value) return

  try {
    // API 요청 URL 구성 - 고정된 최대 로그 수 사용
    let url = `${API_BASE_URL}/api/v1/ent02delivery/admin/logs?limit=${MAX_LOGS}`
    if (lastLogTimestamp.value) {
      url += `&after=${encodeURIComponent(lastLogTimestamp.value)}`
    }

    const response = await axios.get(url)
    if (response.data && response.data.app_info) {
      // 앱 정보 표시 (최초 1회만)
      if (response.data.app_info && !appInfoDisplayed) {
        terminal.value?.writeln('\x1b[34m=== 애플리케이션 정보 ===')
        terminal.value?.writeln(`이름: ${response.data.app_info.name}`)
        terminal.value?.writeln(`버전: ${response.data.app_info.version}`)
        terminal.value?.writeln(`환경: ${response.data.app_info.environment}\x1b[0m`)
        terminal.value?.writeln('------------------------')
        appInfoDisplayed = true
      }
    }

    if (response.data && response.data.logs) {
      // 로그가 있는 경우에만 마지막 타임스탬프 업데이트
      if (response.data.logs.length > 0) {
        lastLogTimestamp.value = response.data.logs[response.data.logs.length - 1].timestamp
      }

      // 각 로그 항목을 형식화하여 표시
      response.data.logs.forEach(
        (log: { timestamp: string; level: string; service: string; message: string }) => {
          const time = new Date(log.timestamp).toLocaleTimeString('ko-KR')
          const levelColor =
            {
              ERROR: '\x1b[31m', // 빨간색
              WARN: '\x1b[33m', // 노란색
              INFO: '\x1b[32m' // 초록색
            }[log.level] || '\x1b[37m' // 기본 흰색

          const logMessage = `${levelColor}[${time}] [${log.level}] ${log.service} - ${log.message} \x1b[0m`
          terminal.value?.writeln(logMessage)
        }
      )

      logTimer = setTimeout(fetchLogs, 100)
    }
  } catch (error) {
    ElMessage.error('로그 데이터를 가져오는 중 오류가 발생했습니다.')
    logTimer = setTimeout(fetchLogs, 3000)
  }
}

// 로그 수집 시작/중지 함수 수정
const toggleLogCollection = () => {
  if (isLogEnabled.value) {
    fetchLogs()
  } else {
    if (logTimer) {
      clearTimeout(logTimer)
      logTimer = null
    }
  }
}

// 통합된 차트 옵션으로 수정
const connectionLineOptions = reactive<EChartsOption>({
  title: {
    text: '연결 현황'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['웹소켓 수', 'ID 수']
  },
  xAxis: {
    type: 'category',
    data: Array(MAX_DATA_POINTS).fill('') // 360개의 빈 데이터로 초기화
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '웹소켓 수',
      type: 'line',
      smooth: true,
      data: Array(MAX_DATA_POINTS).fill(0) // 360개의 0으로 초기화
    },
    {
      name: 'ID 수',
      type: 'line',
      smooth: true,
      data: Array(MAX_DATA_POINTS).fill(0) // 360개의 0으로 초기화
    }
  ]
}) as EChartsOption

// 차트 데이터 업데이트를 위한 타이머 참조 추가
let chartTimer: ReturnType<typeof setTimeout> | null = null

// 통계 자동 갱신 상태를 추적하기 위한 변수 추가
const isStatsEnabled = ref(true)

// 차트 데이터 가져오기 함수 수정
const fetchStateData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/ent02delivery/admin/stats`)
    const data = response.data
    // console.log(data)
    const total_ids = data.stats.total_ids
    const total_connections = data.stats.total_connections

    updateChartData(total_connections, total_ids)
    chartLoading.value = false
  } catch (error) {
    ElMessage.error('통계 데이터를 불러오는 중 오류가 발생했습니다.')
    isStatsEnabled.value = false
  } finally {
    if (isStatsEnabled.value) {
      chartTimer = setTimeout(fetchStateData, 1000)
    }
  }
}

// 차트 데이터 업데이트를 위한 별도 함수
const updateChartData = (connections: number, ids: number) => {
  const currentTime = new Date().toLocaleTimeString('ko-KR')

  // xAxis 데이터 업데이트
  const xAxisData = [...(connectionLineOptions.xAxis as { data: string[] }).data]
  xAxisData.push(currentTime)
  if (xAxisData.length > MAX_DATA_POINTS) xAxisData.shift()
  set(connectionLineOptions, 'xAxis.data', xAxisData)

  // 연결 수 데이터 업데이트
  const connectionsData = [...(connectionLineOptions.series?.[0].data as number[])]
  connectionsData.push(connections)
  if (connectionsData.length > MAX_DATA_POINTS) connectionsData.shift()
  set(connectionLineOptions, 'series[0].data', connectionsData)

  // ID 수 데이터 업데이트
  const idsData = [...(connectionLineOptions.series?.[1].data as number[])]
  idsData.push(ids)
  if (idsData.length > MAX_DATA_POINTS) idsData.shift()
  set(connectionLineOptions, 'series[1].data', idsData)
}

// 차트 데이터 로딩 상태
const chartLoading = ref(true)

// 통계 자동 갱신 토글 함수 수정
const toggleStatsCollection = () => {
  if (isStatsEnabled.value) {
    fetchStateData()
  } else {
    if (chartTimer) {
      clearTimeout(chartTimer)
      chartTimer = null
    }
  }
}

// 테이블 자동 갱신 상태를 추적하기 위한 변수 추가
const isTableEnabled = ref(true)

// 테이블 타이머 참조 추가
let tableTimer: ReturnType<typeof setTimeout> | null = null

// 데이터 로딩 함수 수정
const loadTableData = async (page: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/ent02delivery/admin/ids`, {
      params: {
        page: page,
        pageSize: pageSize.value
      }
    })
    tableData.value = response.data.ids
    // total.value = response.data.total

    // 자동 갱신이 활성화된 경우 다음 갱신 예약
    if (isTableEnabled.value) {
      tableTimer = setTimeout(() => loadTableData(currentPage.value), 1000)
    }
  } catch (error) {
    ElMessage.error('ID 등록 정보를 불러오는 중 오류가 발생했습니다.')
    if (isTableEnabled.value) {
      tableTimer = setTimeout(() => loadTableData(currentPage.value), 1000)
    }
  }
}

// 테이블 자동 갱신 토글 함수 추가
const toggleTableCollection = () => {
  if (isTableEnabled.value) {
    loadTableData(currentPage.value)
  } else {
    if (tableTimer) {
      clearTimeout(tableTimer)
      tableTimer = null
    }
  }
}

onMounted(() => {
  // 터미널 초기화
  if (terminalRef.value) {
    terminal.value = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      cols: 100,
      rows: 23,
      theme: {
        background: '#1e1e1e'
      }
    })
    terminal.value.open(terminalRef.value)
  }

  // 테이블 데이터 초기 로드
  loadTableData(1)
  // 차트 데이터 로드 시작
  fetchStateData()
})

onUnmounted(() => {
  if (logTimer) {
    clearTimeout(logTimer)
  }
  if (chartTimer) {
    clearTimeout(chartTimer)
  }
  if (tableTimer) {
    clearTimeout(tableTimer)
  }
  terminal.value?.dispose()
})

const clearTerminal = () => {
  terminal.value?.clear()
}

const handleReset = async () => {
  lastLogTimestamp.value = null // 타임스탬프 초기화
  ElMessage.success('로그 수집이 리셋되었습니다')
}

// 테이블 데이터 타입 정의
interface IdRecord {
  id: string
  sid: string
  lastAccessTime: string
}

// 테이블 관련 상태 추가
const tableData = ref<IdRecord[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 페이지 변경 핸들러
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadTableData(page)
}
</script>

<template>
  <div class="vterm-wrapper h-full overflow-auto">
    <div class="flex flex-row justify-between m-4">
      <ContentWrap title="Delivery Admin" class="flex-grow">
        <template #header>
          <div class="flex items-center">
            <BaseButton type="primary" class="ml-2" @click="goToHome">홈</BaseButton>
          </div>
        </template>

        <ElTabs v-model="mainActiveTab">
          <ElTabPane label="현황" name="setting">
            <div class="space-y-4">
              <div class="statistics-container">
                <ElRow :gutter="20" justify="space-between">
                  <ElCol :span="24">
                    <div class="flex justify-end mb-2">
                      <ElCheckbox
                        v-model="isStatsEnabled"
                        @change="toggleStatsCollection"
                        class="ml-2"
                      >
                        연결 현황 자동 갱신
                      </ElCheckbox>
                      <ElCheckbox
                        v-model="isTableEnabled"
                        @change="toggleTableCollection"
                        class="ml-4"
                      >
                        ID 목록 자동 갱신
                      </ElCheckbox>
                    </div>
                    <ElCard shadow="hover" class="mb-2">
                      <ElSkeleton :loading="chartLoading" animated>
                        <Echart
                          :options="connectionLineOptions"
                          :height="300"
                          class="w-full"
                          autoresize
                        />
                      </ElSkeleton>
                    </ElCard>
                  </ElCol>
                </ElRow>
              </div>

              <ElCard shadow="hover">
                <ElTable :data="tableData" border style="width: 100%" :max-height="250">
                  <ElTableColumn prop="id" label="ID" width="300" />
                  <ElTableColumn prop="sid" label="SID" width="300" />
                  <ElTableColumn prop="lastAccessTime" label="마지막 접근 시간" />
                </ElTable>

                <div class="flex justify-center mt-4">
                  <ElPagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="total"
                    @current-change="handleCurrentChange"
                    layout="prev, pager, next"
                  />
                </div>
              </ElCard>
            </div>
          </ElTabPane>

          <ElTabPane label="로그" name="communication">
            <div class="w-full">
              <div ref="terminalRef" class="terminal-container"></div>
              <div class="mt-4 space-y-2">
                <div class="flex space-x-2 items-center">
                  <ElButton type="warning" @click="clearTerminal">로그 클리어</ElButton>
                  <ElButton type="danger" @click="handleReset">로그 수집 리셋</ElButton>
                  <ElCheckbox v-model="isLogEnabled" @change="toggleLogCollection">
                    로그 수집 활성화
                  </ElCheckbox>
                </div>
              </div>
            </div>
          </ElTabPane>
        </ElTabs>
      </ContentWrap>
    </div>
  </div>
</template>

<style scoped>
.terminal-container {
  height: 380px;
  min-width: 850px;
  width: 100% !important;
  background-color: #1e1e1e;
  padding: 8px;
  border-radius: 4px;
}
</style>
