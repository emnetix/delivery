<script setup lang="tsx">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElButton, ElInput, ElMessage, ElCheckbox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { v4 as uuidv4 } from 'uuid'

import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'
import { Icon } from '@/components/Icon' // Icon 컴포넌트 추가

import { ENT02Delivery } from '@/ent02client'
import type { ENT02DeliveryDelivery, ENT02DeliveryError } from '@/ent02client'

const deviceID = uuidv4()

const bbc = ref<ENT02Delivery | null>(null)

const isConnected = ref<boolean>(false)

const router = useRouter()
const goToHome = () => {
  router.push('/catalog')
}

const myId = ref(deviceID)

const registerLoading = ref(false)

const handleMyRegister = async () => {
  try {
    registerLoading.value = true
    let id = myId.value
    if (!id) {
      id = deviceID
    }
    bbc.value?.setId(id)
    bbc.value?.registerDevice()
  } catch (error) {
    console.error('등록 실패:', error)
  } finally {
    registerLoading.value = false
  }
}

const otherId = ref('')

const terminalRef = ref<HTMLElement | null>(null)
const terminal = ref<Terminal | null>(null)

// 자동 전송 상태를 위한 ref 추가
const autoSend = ref(false)
const autoSendInterval = ref<ReturnType<typeof setInterval> | null>(null)

// 자동 전송 시작/중지 처리
watch(autoSend, (newValue) => {
  if (newValue) {
    // 자동 전송 시작
    autoSendInterval.value = setInterval(() => {
      if (otherId.value && isConnected.value) {
        insertSampleJson()
        handleSendJson()
      }
    }, 3000) // 3초마다 실행
  } else {
    // 자동 전송 중지
    if (autoSendInterval.value) {
      clearInterval(autoSendInterval.value)
      autoSendInterval.value = null
    }
  }
})

onMounted(() => {
  bbc.value = new ENT02Delivery()
  if (bbc.value) {
    bbc.value.onConnected = () => {
      printToTerminal('서버와 연결 됨', '>> ', 'green')
      isConnected.value = true
    }
    bbc.value.onDisconnected = () => {
      printToTerminal('서버와 연결 끊김', '>> ', 'red')
      isConnected.value = false
    }
    bbc.value.onDelivery = (data: ENT02DeliveryDelivery) => {
      otherId.value = data.from

      try {
        // 전체 데이터를 JSON 문자열로 변환
        const formattedJson = JSON.stringify(data, null, 2).replace(/\n/g, '\r\n')
        printToTerminal(`수신된 데이터:\r\n${formattedJson}`, '<< ', 'cyan')
      } catch (error) {
        // JSON 변환 실패 시 원본 데이터 출력
        printToTerminal(`수신된 데이터: ${JSON.stringify(data)}`, '<< ', 'cyan')
      }
    }
    bbc.value.onError = (error: ENT02DeliveryError) => {
      printToTerminal(`수신된 에러: ${error.message}`, '!! ', 'red')
    }

    bbc.value.setId(deviceID)
    bbc.value.registerDevice()
  }

  // xterm 초기화
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
})

onUnmounted(() => {
  if (autoSendInterval.value) {
    clearInterval(autoSendInterval.value)
  }
  terminal.value?.dispose()
})

// 터미널 출력 함수 정
const printToTerminal = (
  data: Uint8Array | string,
  prefix: string = '',
  color: string = 'white'
) => {
  const colorCodes: { [key: string]: string } = {
    black: '30',
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    magenta: '35',
    cyan: '36',
    white: '37',
    brightBlack: '90',
    brightRed: '91',
    brightGreen: '92',
    brightYellow: '93',
    brightBlue: '94',
    brightMagenta: '95',
    brightCyan: '96',
    brightWhite: '97'
  }

  const colorCode = colorCodes[color] || colorCodes.white
  console.log('[PRINT_TO_TERMINAL]', data)
  if (typeof data === 'string') {
    terminal.value?.writeln(`\x1b[${colorCode}m${prefix}${data}\x1b[0m`)
    return
  }
  console.log('[PRINT_TO_TERMINAL] AFTER STRING')


  const hexData = Array.from(data).map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())

  const asciiData = Array.from(data)
    .map((byte) => {
      if (byte >= 32 && byte <= 126) {
        return String.fromCharCode(byte)
      }
      return '.'
    })
    .join('')

  terminal.value?.writeln(`\x1b[${colorCode}m${prefix}`)

  for (let i = 0; i < hexData.length; i += 16) {
    const chunk = hexData.slice(i, i + 16)
    const asciiChunk = asciiData.slice(i, i + 16)
    const hexLine = chunk.join(' ').padEnd(48, ' ')
    terminal.value?.writeln(`\x1b[${colorCode}m${hexLine} | ${asciiChunk}`)
  }

  terminal.value?.writeln('\x1b[0m')
}

const sendData = ref<string>('')

const clearTerminal = () => {
  terminal.value?.clear()
}

// 클립보드 복사 함수 추가
const copyToClipboard = () => {
  navigator.clipboard.writeText(myId.value)
  ElMessage.success('아이디가 클립보드에 복사되었습니다')
}

// 샘플 JSON 생성 함수 추가
const insertSampleJson = () => {
  const sampleData = {
    timestamp: new Date().toISOString(),
    device: {
      id: myId.value,
      status: isConnected.value ? 'connected' : 'disconnected'
    },
    message: 'Hello, World!'
  }
  sendData.value = JSON.stringify(sampleData, null, 2)
}

// JSON 전송 함수 추가
const handleSendJson = () => {
  if (!bbc.value || !isConnected.value) {
    ElMessage.error('서버에 연결되어 있지 않습니다')
    return
  }

  try {
    const jsonData = JSON.parse(sendData.value)
    bbc.value.setPeerId(otherId.value)
    bbc.value.sendData(jsonData)

    printToTerminal(
      `전송된 데이터: to ${otherId.value}\r\n ${sendData.value.replace(/\n/g, '\r\n')}`,
      '>> ',
      'green'
    )
  } catch (error) {
    console.error('JSON 파싱 오류:', error)
    ElMessage.error('올바른 JSON 형식이 아닙니다')
  }
}
</script>

<template>
  <div class="vterm-wrapper h-full overflow-auto">
    <div class="flex flex-row justify-between m-4">
      <ContentWrap title="전송 시험" class="flex-grow">
        <template #header>
          <div class="flex items-center gap-2">
            <BaseButton type="primary" class="ml-2" @click="goToHome">홈</BaseButton>
            <div class="flex items-center gap-2 ml-2">
              <Icon
                :icon="
                  isConnected
                    ? 'vi-fluent:plug-connected-16-filled'
                    : 'vi-fluent:plug-disconnected-16-regular'
                "
              />
              <span>내 아이디:</span>
              <ElInput v-model="myId" placeholder="아이디" style="width: 400px">
                <template #suffix>
                  <ElButton link @click="copyToClipboard">
                    <i class="solar--clipboard-broken"></i>
                  </ElButton>
                </template>
              </ElInput>
              <BaseButton type="primary" @click="handleMyRegister" :loading="registerLoading">
                등록
              </BaseButton>
            </div>
          </div>
        </template>

        <div class="w-full">
          <div ref="terminalRef" class="terminal-container"></div>
          <div class="mt-4 space-y-2">
            <ElInput
              v-model="sendData"
              type="textarea"
              rows="4"
              placeholder="전송할 데이터를 입력하세요"
            />
            <div class="flex items-center space-x-2">
              <span>대상 아이디:</span>
              <ElInput v-model="otherId" placeholder="상대 아이디" style="width: 400px">
                <template #suffix>
                  <ElButton link @click="otherId = ''">
                    <Icon icon="ep:circle-close" />
                  </ElButton>
                </template>
              </ElInput>
              <ElButton type="success" :disabled="!isConnected" @click="handleSendJson"
                >전송</ElButton
              >
              <ElButton type="warning" @click="clearTerminal">터미널 클리어</ElButton>
              <ElButton type="info" @click="insertSampleJson">샘플 JSON</ElButton>
              <ElCheckbox v-model="autoSend">자동 전송</ElCheckbox>
            </div>
          </div>
        </div>
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

.solar--clipboard-broken {
  display: inline-block;
  width: 24px;
  height: 24px;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' d='M21 16c0 2.829 0 4.243-.879 5.122C19.243 22 17.828 22 15 22H9c-2.828 0-4.243 0-5.121-.878C3 20.242 3 18.829 3 16v-3m13-8.998c2.175.012 3.353.109 4.121.877C21 5.758 21 7.172 21 10v2M8 4.002c-2.175.012-3.353.109-4.121.877S3.014 6.825 3.002 9M9 17.5h6'/%3E%3Cpath d='M8 3.5A1.5 1.5 0 0 1 9.5 2h5A1.5 1.5 0 0 1 16 3.5v1A1.5 1.5 0 0 1 14.5 6h-5A1.5 1.5 0 0 1 8 4.5z'/%3E%3Cpath stroke-linecap='round' d='M8 14h1m7 0h-4m5-3.5h-2m-3 0H7'/%3E%3C/g%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
