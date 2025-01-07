<script setup lang="ts">
import { ElDrawer, ElDivider, ElMessage } from 'element-plus'
import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { useCssVar } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import { trim, setCssVar, getCssVar } from '@/utils'
import ColorRadioPicker from './components/ColorRadioPicker.vue'
import InterfaceDisplay from './components/InterfaceDisplay.vue'
import LayoutRadioPicker from './components/LayoutRadioPicker.vue'
import { useStorage } from '@/hooks/web/useStorage'
import { useClipboard } from '@vueuse/core'
import { useDesign } from '@/hooks/web/useDesign'

const { clear: storageClear } = useStorage('localStorage')

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('setting')

const appStore = useAppStore()

const { t } = useI18n()

const drawer = ref(false)

// 테마 색상 관련
const systemTheme = ref(appStore.getTheme.elColorPrimary)

const setSystemTheme = (color: string) => {
  setCssVar('--el-color-primary', color)
  appStore.setTheme({ elColorPrimary: color })
  const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  setMenuTheme(trim(unref(leftMenuBgColor)))
}

// 헤더 테마 관련
const headerTheme = ref(appStore.getTheme.topHeaderBgColor || '')

const setHeaderTheme = (color: string) => {
  appStore.setHeaderTheme(color)
}

// 메뉴 테마 관련
const menuTheme = ref(appStore.getTheme.leftMenuBgColor || '')

const setMenuTheme = (color: string) => {
  appStore.setMenuTheme(color)
}

// layout 변경을 감시하고, 일부 테마 색상 재설정
// watch(
//   () => layout.value,
//   (n) => {
//     if (n === 'top' && !appStore.getIsDark) {
//       headerTheme.value = '#fff'
//       setHeaderTheme('#fff')
//     } else {
//       setMenuTheme(unref(menuTheme))
//     }
//   }
// )

// 복사
const copyConfig = async () => {
  const { copy, copied, isSupported } = useClipboard({
    source: `
      // 면包줄기
      breadcrumb: ${appStore.getBreadcrumb},
      // 면包줄기 아이콘
      breadcrumbIcon: ${appStore.getBreadcrumbIcon},
      // 햄버거 아이콘
      hamburger: ${appStore.getHamburger},
      // 전체 화면 아이콘
      screenfull: ${appStore.getScreenfull},
      // 크기 아이콘
      size: ${appStore.getSize},
      // 다국어 아이콘
      locale: ${appStore.getLocale},
      // 태그 페이지
      tagsView: ${appStore.getTagsView},
      // 태그 페이지 아이콘
      getTagsViewIcon: ${appStore.getTagsViewIcon},
      // 로고
      logo: ${appStore.getLogo},
      // 메뉴 아코디언
      uniqueOpened: ${appStore.getUniqueOpened},
      // 고정 헤더
      fixedHeader: ${appStore.getFixedHeader},
      // 푸터
      footer: ${appStore.getFooter},
      // 회색 모드
      greyMode: ${appStore.getGreyMode},
      // layout 배치
      layout: '${appStore.getLayout}',
      // 다크 모드
      isDark: ${appStore.getIsDark},
      // 컴포넌트 크기
      currentSize: '${appStore.getCurrentSize}',
      // 테마 관련
      theme: {
        // 테마 색상
        elColorPrimary: '${appStore.getTheme.elColorPrimary}',
        // 왼쪽 메뉴 테두리 색상
        leftMenuBorderColor: '${appStore.getTheme.leftMenuBorderColor}',
        // 왼쪽 메뉴 배경 색상
        leftMenuBgColor: '${appStore.getTheme.leftMenuBgColor}',
        // 왼쪽 메뉴 밝은 배경 색상
        leftMenuBgLightColor: '${appStore.getTheme.leftMenuBgLightColor}',
        // 왼쪽 메뉴 선택 배경 색상
        leftMenuBgActiveColor: '${appStore.getTheme.leftMenuBgActiveColor}',
        // 왼쪽 메뉴 접기 선택 배경 색상
        leftMenuCollapseBgActiveColor: '${appStore.getTheme.leftMenuCollapseBgActiveColor}',
        // 왼쪽 메뉴 글자 색��
        leftMenuTextColor: '${appStore.getTheme.leftMenuTextColor}',
        // 왼쪽 메뉴 선택 글자 색상
        leftMenuTextActiveColor: '${appStore.getTheme.leftMenuTextActiveColor}',
        // 로고 글자 색상
        logoTitleTextColor: '${appStore.getTheme.logoTitleTextColor}',
        // 로고 테두리 색상
        logoBorderColor: '${appStore.getTheme.logoBorderColor}',
        // 헤더 배경 색상
        topHeaderBgColor: '${appStore.getTheme.topHeaderBgColor}',
        // 헤더 글자 색상
        topHeaderTextColor: '${appStore.getTheme.topHeaderTextColor}',
        // 헤더 호버 색상
        topHeaderHoverColor: '${appStore.getTheme.topHeaderHoverColor}',
        // 헤더 테두리 색상
        topToolBorderColor: '${appStore.getTheme.topToolBorderColor}'
      }
    `,
    legacy: true
  })
  if (!isSupported) {
    ElMessage.error(t('setting.copyFailed'))
  } else {
    await copy()
    if (unref(copied)) {
      ElMessage.success(t('setting.copySuccess'))
    }
  }
}

// 캐시 지우기
const clear = () => {
  storageClear()
  window.location.reload()
}

const themeChange = () => {
  const color = getCssVar('--el-bg-color')
  setMenuTheme(color)
  setHeaderTheme(color)
}
</script>

<template>
  <div
    :class="prefixCls"
    class="fixed top-[45%] right-0 w-40px h-40px flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10"
    @click="drawer = true"
  >
    <Icon icon="vi-ant-design:setting-outlined" color="#fff" />
  </div>

  <ElDrawer v-model="drawer" direction="rtl" size="350px" :z-index="4000">
    <template #header>
      <span class="text-16px font-700">{{ t('setting.projectSetting') }}</span>
    </template>

    <div class="text-center">
      <!-- 테마 -->
      <ElDivider>{{ t('setting.theme') }}</ElDivider>
      <ThemeSwitch @change="themeChange" />

      <!-- 레이아웃 -->
      <ElDivider>{{ t('setting.layout') }}</ElDivider>
      <LayoutRadioPicker />

      <!-- 시스템 테마 -->
      <ElDivider>{{ t('setting.systemTheme') }}</ElDivider>
      <ColorRadioPicker
        v-model="systemTheme"
        :schema="[
          '#409eff',
          '#009688',
          '#536dfe',
          '#ff5c93',
          '#ee4f12',
          '#0096c7',
          '#9c27b0',
          '#ff9800'
        ]"
        @change="setSystemTheme"
      />

      <!-- 헤더 테마 -->
      <ElDivider>{{ t('setting.headerTheme') }}</ElDivider>
      <ColorRadioPicker
        v-model="headerTheme"
        :schema="[
          '#fff',
          '#151515',
          '#5172dc',
          '#e74c3c',
          '#24292e',
          '#394664',
          '#009688',
          '#383f45'
        ]"
        @change="setHeaderTheme"
      />

      <!-- 메뉴 테마 -->
      <ElDivider>{{ t('setting.menuTheme') }}</ElDivider>
      <ColorRadioPicker
        v-model="menuTheme"
        :schema="[
          '#fff',
          '#001529',
          '#212121',
          '#273352',
          '#191b24',
          '#383f45',
          '#001628',
          '#344058'
        ]"
        @change="setMenuTheme"
      />
    </div>

    <!-- 인터페이스 표시 -->
    <ElDivider>{{ t('setting.interfaceDisplay') }}</ElDivider>
    <InterfaceDisplay />

    <ElDivider />
    <div>
      <BaseButton type="primary" class="w-full" @click="copyConfig">{{
        t('setting.copy')
      }}</BaseButton>
    </div>
    <div class="mt-5px">
      <BaseButton type="danger" class="w-full" @click="clear">
        {{ t('setting.clearAndReset') }}
      </BaseButton>
    </div>
  </ElDrawer>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-setting';

.@{prefix-cls} {
  border-radius: 6px 0 0 6px;
}
</style>
