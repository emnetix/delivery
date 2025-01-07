import router from './router'
import { useAppStoreWithOut } from '@/store/modules/app'
import type { RouteRecordRaw } from 'vue-router'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { NO_REDIRECT_WHITE_LIST } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'

// NProgress와 페이지 로딩 인디케이터 설정
const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

// 라우터 진입 전 가드를 단순화
router.beforeEach(async (to, from, next) => {
  start()
  loadStart()

  const permissionStore = usePermissionStoreWithOut()
  const appStore = useAppStoreWithOut()
  // const userStore = useUserStoreWithOut() // 인증 제거로 인한 주석처리

  // 인증 관련 코드 주석 처리 시작
  /*
  if (userStore.getUserInfo) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (permissionStore.getIsAddRouters) {
        next()
        return
      }

      const roleRouters = userStore.getRoleRouters || []
  */

  // 새로운 라우팅 로직
  if (!permissionStore.getIsAddRouters) {
    if (appStore.getDynamicRouter) {
      appStore.serverDynamicRouter
        ? await permissionStore.generateRoutes('server', []) // 이전: roleRouters as AppCustomRouteRecordRaw[]
        : await permissionStore.generateRoutes('frontEnd', []) // 이전: roleRouters as string[]
    } else {
      await permissionStore.generateRoutes('static')
    }

    permissionStore.getAddRouters.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw)
    })

    permissionStore.setIsAddRouters(true)
    next({ ...to, replace: true })
  } else {
    next()
  }

  // 인증 관련 코드 주석 처리 끝
  /*
  } else {
    if (NO_REDIRECT_WHITE_LIST.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
  */
})

// 라우터 진입 후 가드 설정
router.afterEach((to) => {
  // 페이지 제목 업데이트
  useTitle(to?.meta?.title as string)
  done() // Progress 종료
  loadDone()
})
