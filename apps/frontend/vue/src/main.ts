import 'vue/jsx'

// windi css 불러오기
import '@/plugins/unocss'

// 전역 svg 아이콘 가져오기
import '@/plugins/svgIcon'

// 다국어 초기화
import { setupI18n } from '@/plugins/vueI18n'

// 상태 관리 불러오기
import { setupStore } from '@/store'

// 전역 컴포넌트
import { setupGlobCom } from '@/components'

// element-plus 불러오기
import { setupElementPlus } from '@/plugins/elementPlus'

// 전역 스타일 불러오기
import '@/styles/index.less'

// 애니메이션 불러오기
import '@/plugins/animate.css'

// 라우터
import { setupRouter } from './router'

// 권한
import { setupPermission } from './directives'

import { createApp } from 'vue'

import App from './App.vue'

import './permission'

// 인스턴스 생성
const setupAll = async () => {
  const app = createApp(App)

  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupRouter(app)

  setupPermission(app)

  app.mount('#app')
}

setupAll()
