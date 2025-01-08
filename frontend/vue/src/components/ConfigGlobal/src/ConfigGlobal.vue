<script setup lang="ts">
import { provide, computed, watch, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { ComponentSize, ElConfigProvider } from 'element-plus'
import { useLocaleStore } from '@/store/modules/locale'
import { useWindowSize } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import { setCssVar } from '@/utils'
import { useDesign } from '@/hooks/web/useDesign'
// import ko from 'element-plus/es/locale/lang/ko'
import en from 'element-plus/es/locale/lang/en'
const { variables } = useDesign()

const appStore = useAppStore()

const props = defineProps({
  size: propTypes.oneOf<ComponentSize>(['default', 'small', 'large']).def('default')
})

provide('configGlobal', props)

// 모든 테마 색상 초기화
onMounted(() => {
  appStore.setCssVarTheme()
})

const { width } = useWindowSize()

// 창 크기 변화 감시
watch(
  () => width.value,
  (width: number) => {
    if (width < 768) {
      !appStore.getMobile ? appStore.setMobile(true) : undefined
      setCssVar('--left-menu-min-width', '0')
      appStore.setCollapse(true)
      appStore.getLayout !== 'classic' ? appStore.setLayout('classic') : undefined
    } else {
      appStore.getMobile ? appStore.setMobile(false) : undefined
      setCssVar('--left-menu-min-width', '64px')
    }
  },
  {
    immediate: true
  }
)

// 다국어 관련
const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.currentLocale)

// currentLocale 값 변경 시 콘솔에 로그 출력
watch(currentLocale, (newValue) => {
  console.log('현재 로케일:', newValue)
})

// 컴포넌트 마운트 시 초기 값 출력
onMounted(() => {
  localeStore.setCurrentLocale({ lang: 'en', elLocale: en })
})
</script>

<template>
  <ElConfigProvider
    :namespace="variables.elNamespace"
    :locale="currentLocale.elLocale"
    :message="{ max: 1 }"
    :size="size"
  >
    <slot></slot>
  </ElConfigProvider>
</template>
