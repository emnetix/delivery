import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'

const timeout = 1000

const adminList = [
  {
    path: '/dashboard',
    component: '#',
    redirect: '/dashboard/analysis',
    name: 'Dashboard',
    meta: {
      title: 'router.dashboard',
      icon: 'vi-ant-design:dashboard-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'analysis',
        component: 'views/Dashboard/Analysis',
        name: 'Analysis',
        meta: {
          title: 'router.analysis',
          noCache: true,
          affix: true
        }
      },
      {
        path: 'workplace',
        component: 'views/Dashboard/Workplace',
        name: 'Workplace',
        meta: {
          title: 'router.workplace',
          noCache: true,
          affix: true
        }
      }
    ]
  }
]

const testList: string[] = [
  '/dashboard',
  '/dashboard/analysis',
  '/dashboard/workplace'
]

const List: any[] = []

const roleNames = ['최고 관리자', '관리자', '일반 사용자', '방문자']
const menus = [
  [
    {
      path: '/dashboard',
      component: '#',
      redirect: '/dashboard/analysis',
      name: 'Dashboard',
      status: Mock.Random.integer(0, 1),
      id: 1,
      meta: {
        title: '홈',
        icon: 'vi-ant-design:dashboard-filled',
        alwaysShow: true
      },
      children: [
        {
          path: 'analysis',
          component: 'views/Dashboard/Analysis',
          name: 'Analysis',
          status: Mock.Random.integer(0, 1),
          id: 2,
          meta: {
            title: '분석 페이지',
            noCache: true
          }
        },
        {
          path: 'workplace',
          component: 'views/Dashboard/Workplace',
          name: 'Workplace',
          status: Mock.Random.integer(0, 1),
          id: 3,
          meta: {
            title: '작업대',
            noCache: true
          }
        }
      ]
    },
    {
      path: '/external-link',
      component: '#',
      meta: {
        title: '문서',
        icon: 'vi-clarity:document-solid'
      },
      name: 'ExternalLink',
      status: Mock.Random.integer(0, 1),
      id: 4,
      children: [
        {
          path: 'https://element-plus-admin-doc.cn/',
          name: 'DocumentLink',
          status: Mock.Random.integer(0, 1),
          id: 5,
          meta: {
            title: '문서'
          }
        }
      ]
    },
    {
      path: '/level',
      component: '#',
      redirect: '/level/menu1/menu1-1/menu1-1-1',
      name: 'Level',
      status: Mock.Random.integer(0, 1),
      id: 6,
      meta: {
        title: '메뉴',
        icon: 'vi-carbon:skill-level-advanced'
      },
      children: [
        {
          path: 'menu1',
          name: 'Menu1',
          component: '##',
          status: Mock.Random.integer(0, 1),
          id: 7,
          redirect: '/level/menu1/menu1-1/menu1-1-1',
          meta: {
            title: '메뉴1'
          },
          children: [
            {
              path: 'menu1-1',
              name: 'Menu11',
              component: '##',
              status: Mock.Random.integer(0, 1),
              id: 8,
              redirect: '/level/menu1/menu1-1/menu1-1-1',
              meta: {
                title: '메뉴1-1',
                alwaysShow: true
              },
              children: [
                {
                  path: 'menu1-1-1',
                  name: 'Menu111',
                  component: 'views/Level/Menu111',
                  status: Mock.Random.integer(0, 1),
                  id: 9,
                  permission: ['edit', 'add', 'delete'],
                  meta: {
                    title: '메뉴1-1-1',
                    permission: ['edit', 'add', 'delete']
                  }
                }
              ]
            },
            {
              path: 'menu1-2',
              name: 'Menu12',
              component: 'views/Level/Menu12',
              status: Mock.Random.integer(0, 1),
              id: 10,
              permission: ['edit', 'add', 'delete'],
              meta: {
                title: '메뉴1-2',
                permission: ['edit', 'add', 'delete']
              }
            }
          ]
        },
        {
          path: 'menu2',
          name: 'Menu2Demo',
          component: 'views/Level/Menu2',
          status: Mock.Random.integer(0, 1),
          id: 11,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '메뉴2',
            permission: ['edit', 'add', 'delete']
          }
        }
      ]
    },
    {
      path: '/example',
      component: '#',
      redirect: '/example/example-dialog',
      name: 'Example',
      status: Mock.Random.integer(0, 1),
      id: 12,
      meta: {
        title: '종합 예시',
        icon: 'vi-ep:management',
        alwaysShow: true
      },
      children: [
        {
          path: 'example-dialog',
          component: 'views/Example/Dialog/ExampleDialog',
          name: 'ExampleDialog',
          status: Mock.Random.integer(0, 1),
          id: 13,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '종합 예시-대화상자',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-page',
          component: 'views/Example/Page/ExamplePage',
          name: 'ExamplePage',
          status: Mock.Random.integer(0, 1),
          id: 14,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '종합 예시-페이지',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-add',
          component: 'views/Example/Page/ExampleAdd',
          name: 'ExampleAdd',
          status: Mock.Random.integer(0, 1),
          id: 15,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '종합 예시-추가',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-edit',
          component: 'views/Example/Page/ExampleEdit',
          name: 'ExampleEdit',
          status: Mock.Random.integer(0, 1),
          id: 16,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '종합 예시-편집',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-detail',
          component: 'views/Example/Page/ExampleDetail',
          name: 'ExampleDetail',
          status: Mock.Random.integer(0, 1),
          id: 17,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '종합 예시-상세',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        }
      ]
    }
  ],
  [
    {
      path: '/dashboard',
      component: '#',
      redirect: '/dashboard/analysis',
      name: 'Dashboard',
      status: Mock.Random.integer(0, 1),
      id: 1,
      meta: {
        title: '홈',
        icon: 'vi-ant-design:dashboard-filled',
        alwaysShow: true
      },
      children: [
        {
          path: 'analysis',
          component: 'views/Dashboard/Analysis',
          name: 'Analysis',
          status: Mock.Random.integer(0, 1),
          id: 2,
          meta: {
            title: '분석 페이지',
            noCache: true
          }
        },
        {
          path: 'workplace',
          component: 'views/Dashboard/Workplace',
          name: 'Workplace',
          status: Mock.Random.integer(0, 1),
          id: 3,
          meta: {
            title: '작업대',
            noCache: true
          }
        }
      ]
    }
  ],
  [
    {
      path: '/external-link',
      component: '#',
      meta: {
        title: '문서',
        icon: 'vi-clarity:document-solid'
      },
      name: 'ExternalLink',
      status: Mock.Random.integer(0, 1),
      id: 4,
      children: [
        {
          path: 'https://element-plus-admin-doc.cn/',
          name: 'DocumentLink',
          status: Mock.Random.integer(0, 1),
          id: 5,
          meta: {
            title: '문서'
          }
        }
      ]
    },
    {
      path: '/level',
      component: '#',
      redirect: '/level/menu1/menu1-1/menu1-1-1',
      name: 'Level',
      status: Mock.Random.integer(0, 1),
      id: 6,
      meta: {
        title: '메뉴',
        icon: 'vi-carbon:skill-level-advanced'
      },
      children: [
        {
          path: 'menu1',
          name: 'Menu1',
          component: '##',
          status: Mock.Random.integer(0, 1),
          id: 7,
          redirect: '/level/menu1/menu1-1/menu1-1-1',
          meta: {
            title: '메뉴1'
          },
          children: [
            {
              path: 'menu1-1',
              name: 'Menu11',
              component: '##',
              status: Mock.Random.integer(0, 1),
              id: 8,
              redirect: '/level/menu1/menu1-1/menu1-1-1',
              meta: {
                title: '메뉴1-1',
                alwaysShow: true
              },
              children: [
                {
                  path: 'menu1-1-1',
                  name: 'Menu111',
                  component: 'views/Level/Menu111',
                  status: Mock.Random.integer(0, 1),
                  id: 9,
                  permission: ['edit', 'add', 'delete'],
                  meta: {
                    title: '메뉴1-1-1',
                    permission: ['edit', 'add', 'delete']
                  }
                }
              ]
            },
            {
              path: 'menu1-2',
              name: 'Menu12',
              component: 'views/Level/Menu12',
              status: Mock.Random.integer(0, 1),
              id: 10,
              permission: ['edit', 'add', 'delete'],
              meta: {
                title: '메뉴1-2',
                permission: ['edit', 'add', 'delete']
              }
            }
          ]
        },
        {
          path: 'menu2',
          name: 'Menu2Demo',
          component: 'views/Level/Menu2',
          status: Mock.Random.integer(0, 1),
          id: 11,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '메뉴2',
            permission: ['edit', 'add', 'delete']
          }
        }
      ]
    }
  ],
  [
    {
      path: '/example',
      component: '#',
      redirect: '/example/example-dialog',
      name: 'Example',
      status: Mock.Random.integer(0, 1),
      id: 12,
      meta: {
        title: '종합 예시',
        icon: 'vi-ep:management',
        alwaysShow: true
      },
      children: [
        {
          path: 'example-detail',
          component: 'views/Example/Page/ExampleDetail',
          name: 'ExampleDetail',
          status: Mock.Random.integer(0, 1),
          id: 17,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '종합 예시-상세',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        }
      ]
    }
  ]
]

for (let i = 0; i < 4; i++) {
  List.push(
    Mock.mock({
      id: toAnyString(),
      // timestamp: +Mock.Random.date('T'),
      roleName: roleNames[i],
      role: '@first',
      status: Mock.Random.integer(0, 1),
      createTime: '@datetime',
      remark: '@cword(10, 15)',
      menu: menus[i]
    })
  )
}

export default [
  // 목록 인터페이스
  {
    url: '/api/v1/role/list',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: adminList
      }
    }
  },
  {
    url: '/api/v1/role/table',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          list: List,
          total: 4
        }
      }
    }
  },
  // 목록 인터페이스
  {
    url: '/api/v1/role/list2',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: testList
      }
    }
  },
  {
    url: '/api/v1/role/table',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          list: List,
          total: 4
        }
      }
    }
  }
]
