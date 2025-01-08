<script lang="tsx">
import { computed, defineComponent, unref, PropType } from 'vue'
import { ElMenu, ElScrollbar } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRenderMenuItem } from './components/useRenderMenuItem'
import { useRouter } from 'vue-router'
import { isUrl } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('menu')

export default defineComponent({
  name: 'Menu',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    const appStore = useAppStore()

    const layout = computed(() => appStore.getLayout)

    const { push, currentRoute } = useRouter()

    const permissionStore = usePermissionStore()

    const menuMode = computed((): 'vertical' | 'horizontal' => {
      // 세로
      const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

      if (vertical.includes(unref(layout))) {
        return 'vertical'
      } else {
        return 'horizontal'
      }
    })

    const routers = computed(() => {
      const result = unref(layout) === 'cutMenu' ? permissionStore.getMenuTabRouters : permissionStore.getRouters
      // console.log('현재 라우터 정보:', result)
      return result
    })

    const collapse = computed(() => appStore.getCollapse)

    const uniqueOpened = computed(() => appStore.getUniqueOpened)

    const activeMenu = computed(() => {
      const { meta, path } = unref(currentRoute)
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu as string
      }
      return path
    })

    const menuSelect = (index: string) => {
      if (props.menuSelect) {
        props.menuSelect(index)
      }
      // 사용자 정의 이벤트
      if (isUrl(index)) {
        window.open(index)
      } else {
        push(index)
      }
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return <ElScrollbar>{renderMenu()}</ElScrollbar>
      }
    }

    const renderMenu = () => {
      return (
        <ElMenu
          defaultActive={unref(activeMenu)}
          mode={unref(menuMode)}
          collapse={
            unref(layout) === 'top' || unref(layout) === 'cutMenu' ? false : unref(collapse)
          }
          uniqueOpened={unref(layout) === 'top' ? false : unref(uniqueOpened)}
          backgroundColor="var(--left-menu-bg-color)"
          textColor="var(--left-menu-text-color)"
          activeTextColor="var(--left-menu-text-active-color)"
          popperClass={
            unref(menuMode) === 'vertical'
              ? `${prefixCls}-popper--vertical`
              : `${prefixCls}-popper--horizontal`
          }
          onSelect={menuSelect}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(menuMode)
              return renderMenuItem(unref(routers))
            }
          }}
        </ElMenu>
      )
    }

    return () => (
      <div
        id={prefixCls}
        class={[
          `${prefixCls} ${prefixCls}__${unref(menuMode)}`,
          'h-[100%] overflow-hidden flex-col bg-[var(--left-menu-bg-color)]',
          {
            'w-[var(--left-menu-min-width)]': unref(collapse) && unref(layout) !== 'cutMenu',
            'w-[var(--left-menu-max-width)]': !unref(collapse) && unref(layout) !== 'cutMenu'
          }
        ]}
      >
        {renderMenuWrap()}
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-menu';

.@{prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);

  :deep(.@{elNamespace}-menu) {
    width: 100% !important;
    border-right: none;

    // 선택 시 하위 제목의 색상 설정
    .is-active {
      & > .@{elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    // 하위 메뉴 호버 시 하이라이트 및 배경색 설정
    .@{elNamespace}-sub-menu__title,
    .@{elNamespace}-menu-item {
      &:hover {
        color: var(--left-menu-text-active-color) !important;
        background-color: var(--left-menu-bg-color) !important;
      }
    }

    // 선택 시 하이라이트 배경 및 색상 설정
    .@{elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .@{elNamespace}-menu-item.is-active {
      position: relative;
    }

    // 하위 메뉴의 배경색 설정
    .@{elNamespace}-menu {
      .@{elNamespace}-sub-menu__title,
      .@{elNamespace}-menu-item:not(.is-active) {
        background-color: var(--left-menu-bg-light-color) !important;
      }
    }
  }

  // 접힌 상태의
  :deep(.@{elNamespace}-menu--collapse) {
    width: var(--left-menu-min-width);

    & > .is-active,
    & > .is-active > .@{elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 접힌 상태의 애니메이션 시, 제목을 숨기기
  :deep(.horizontal-collapse-transition) {
    .@{prefix-cls}__title {
      display: none;
    }
  }

  // 수평 메뉴
  &__horizontal {
    height: calc(~'var(--top-tool-height)') !important;

    :deep(.@{elNamespace}-menu--horizontal) {
      height: calc(~'var(--top-tool-height)');
      border-bottom: none;
      // 하이라이트 색상 재설정
      & > .@{elNamespace}-sub-menu.is-active {
        .@{elNamespace}-sub-menu__title {
          border-bottom-color: var(--el-color-primary) !important;
        }
      }

      .@{elNamespace}-menu-item.is-active {
        position: relative;

        &::after {
          display: none !important;
        }
      }

      .@{prefix-cls}__title {
        /* stylelint-disable-next-line */
        max-height: calc(~'var(--top-tool-height) - 2px') !important;
        /* stylelint-disable-next-line */
        line-height: calc(~'var(--top-tool-height) - 2px');
      }
    }
  }
}
</style>

<style lang="less">
@prefix-cls: ~'@{adminNamespace}-menu-popper';

.@{prefix-cls}--vertical,
.@{prefix-cls}--horizontal {
  // 선택 시 하위 제목의 색상 설정
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  // 하위 메뉴 호버 시 하이라이트 및 배경색 설정
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-color) !important;
    }
  }

  // 선택 시 하이라이트 배경
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--left-menu-bg-active-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }
}

@submenu-prefix-cls: ~'@{adminNamespace}-submenu-popper';

// 하위 메뉴가 넘치면 스크롤 설정
.@{submenu-prefix-cls}--vertical {
  max-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(144 147 153 / 30%);
    border-radius: 4px;
  }
}
</style>
