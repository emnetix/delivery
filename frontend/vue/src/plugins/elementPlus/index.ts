import type { App } from 'vue'

// ElScrollbar와 같은 일부 컴포넌트를 전역으로 가져와야 합니다. 그렇지 않으면 일부 드롭다운 항목 스타일에 문제가 있습니다.
import { ElLoading, ElScrollbar } from 'element-plus'

const plugins = [ElLoading]

const components = [ElScrollbar]

export const setupElementPlus = (app: App<Element>) => {
  plugins.forEach((plugin) => {
    app.use(plugin)
  })

  // 개발 환경에서 더 빠른 시작을 위해 모든 스타일을 한 번에 가져옵니다.
  if (import.meta.env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'true') {
    import('element-plus/dist/index.css')
    return
  }

  components.forEach((component) => {
    app.component(component.name!, component)
  })
}
