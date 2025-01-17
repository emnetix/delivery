import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { NO_RESET_WHITE_LIST } from '@/constants'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/catalog',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/catalog',
    component: () => import('@/views/Catalog/Catalog.vue'),
    name: 'Catalog',
    meta: {
      hidden: true,
      title: '카탈로그',
      noTagsView: true
    }
  },
  {
    path: '/ent02/delivery/admin',
    component: () => import('@/views/Ent/ENT02DeliveryAdmin/ENT02DeliveryAdmin.vue'),
    name: 'ENT02DeliveryAdmin',
    meta: {
      hidden: true,
      title: 'Delivery Admin',
      noTagsView: true
    }
  },
  {
    path: '/ent02/delivery/delivery',
    component: () => import('@/views/Ent/ENT02Delivery/ENT02Delivery.vue'),
    name: 'ENT02Delivery',
    meta: {
      hidden: true,
      title: 'Delivery',
      noTagsView: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'RedirectLayout',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

// export const asyncRouterMap: AppRouteRecordRaw[] = [
//   {
//     path: '/dashboard',
//     component: Layout,
//     redirect: '/dashboard/analysis',
//     name: 'Dashboard',
//     meta: {
//       title: t('router.dashboard'),
//       icon: 'vi-ant-design:dashboard-filled',
//       alwaysShow: true
//     },
//     children: [
//       {
//         path: 'analysis',
//         component: () => import('@/views/Dashboard/Analysis.vue'),
//         name: 'Analysis',
//         meta: {
//           title: t('router.analysis'),
//           noCache: true,
//           affix: true
//         }
//       },
//       {
//         path: 'workplace',
//         component: () => import('@/views/Dashboard/Workplace.vue'),
//         name: 'Workplace',
//         meta: {
//           title: t('router.workplace'),
//           noCache: true
//         }
//       }
//     ]
//   }
// ]
export const asyncRouterMap: AppRouteRecordRaw[] = []

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
