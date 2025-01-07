import type { RouteRecordRaw } from 'vue-router'
import { defineComponent } from 'vue'

/**
* redirect: noredirect        'noredirect'로 설정하면 해당 경로는 빵 부스러기 탐색에서 클릭할 수 없습니다.
* name:'router-name'          경로의 이름을 설정합니다. <keep-alive>를 사용할 때 문제가 발생하지 않도록 반드시 작성해야 합니다.
* meta : {
    hidden: true              true로 설정하면 해당 경로가 사이드바에 나타나지 않습니다. 예: 404, 로그인 페이지 등 (기본값 false)

    alwaysShow: true          하나의 경로 아래에 선언된 자식 경로가 1개 이상일 때 자동으로 중첩 모드가 됩니다.
                              하나만 있을 때는 그 자식 경로를 루트 경로로 사이드바에 표시합니다.
                              자식 경로의 수에 관계없이 항상 루트 경로를 표시하려면 alwaysShow: true로 설정하세요.
                              이렇게 하면 이전에 정의된 규칙을 무시하고 항상 루트 경로를 표시합니다. (기본값 false)

    title: 'title'            사이드바와 빵 부스러기에 표시될 경로의 이름을 설정합니다.

    icon: 'svg-name'          해당 경로의 아이콘을 설정합니다.

    noCache: true             true로 설정하면 <keep-alive>에 의해 캐시되지 않습니다. (기본값 false)

    breadcrumb: false         false로 설정하면 빵 부스러기 탐색에 표시되지 않습니다. (기본값 true)

    affix: true               true로 설정하면 태그 항목에 항상 고정됩니다. (기본값 false)

    noTagsView: true          true로 설정하면 태그에 나타나지 않습니다. (기본값 false)

    activeMenu: '/dashboard'  활성화된 경로 경로를 표시합니다.

    canTo: true               true로 설정하면 hidden이 true여도 경로 이동이 가능합니다. (기본값 false)

    permission: ['edit','add', 'delete']    해당 경로의 권한을 설정합니다.
  }
**/

interface RouteMetaCustom extends Record<string | number | symbol, unknown> {
  hidden?: boolean
  alwaysShow?: boolean
  title?: string
  icon?: string
  noCache?: boolean
  breadcrumb?: boolean
  affix?: boolean
  activeMenu?: string
  noTagsView?: boolean
  canTo?: boolean
  permission?: string[]
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMetaCustom {}
}

type Component<T = any> =
  | ReturnType<typeof defineComponent>
  | (() => Promise<typeof import('*.vue')>)
  | (() => Promise<T>)

declare global {
  declare interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
    name: string
    meta: RouteMetaCustom
    component?: Component | string
    children?: AppRouteRecordRaw[]
    props?: Recordable
    fullPath?: string
  }

  declare interface AppCustomRouteRecordRaw
    extends Omit<RouteRecordRaw, 'meta' | 'component' | 'children'> {
    name: string
    meta: RouteMetaCustom
    component: string
    path: string
    redirect: string
    children?: AppCustomRouteRecordRaw[]
  }
}
