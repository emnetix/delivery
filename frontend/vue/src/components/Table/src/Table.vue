<script lang="tsx">
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ComponentSize,
  ElTooltipProps,
  ElImage,
  ElEmpty,
  ElCard
} from 'element-plus'
import { defineComponent, PropType, ref, computed, unref, watch, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { setIndex } from './helper'
import type { TableProps, TableColumn, Pagination, TableSetProps } from './types'
import { set, get } from 'lodash-es'
import { CSSProperties } from 'vue'
import { getSlot } from '@/utils/tsxHelper'
import TableActions from './components/TableActions.vue'
import { createVideoViewer } from '@/components/VideoPlayer'
import { Icon } from '@/components/Icon'
import { BaseButton } from '@/components/Button'

export default defineComponent({
  name: 'Table',
  props: {
    pageSize: propTypes.number.def(10),
    currentPage: propTypes.number.def(1),
    // 테이블의 도구 모음을 표시할지 여부
    showAction: propTypes.bool.def(false),
    // 모든 초과 내용을 숨길지 여부, schema의 showOverflowTooltip보다 우선순위가 낮음
    showOverflowTooltip: propTypes.bool.def(true),
    // 테이블 헤더
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
    // 페이지네이션 표시 여부
    pagination: {
      type: Object as PropType<Pagination>,
      default: (): Pagination | undefined => undefined
    },
    // type=selection 열에만 유효, Boolean 타입, true이면 데이터 업데이트 후 이전에 선택한 데이터를 유지함 (row-key 지정 필요)
    reserveSelection: propTypes.bool.def(false),
    // 로딩 상태
    loading: propTypes.bool.def(false),
    // 인덱스를 누적할지 여부
    reserveIndex: propTypes.bool.def(false),
    // 정렬 방식
    align: propTypes.string
      .validate((v: string) => ['left', 'center', 'right'].includes(v))
      .def('left'),
    // 헤더 정렬 방식
    headerAlign: propTypes.string
      .validate((v: string) => ['left', 'center', 'right'].includes(v))
      .def('left'),
    data: {
      type: Array as PropType<Recordable[]>,
      default: () => []
    },
    // 이미지 자동 미리보기 필드 배열
    imagePreview: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    // 비디오 자동 미리보기 필드 배열
    videoPreview: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    height: propTypes.oneOfType([Number, String]),
    maxHeight: propTypes.oneOfType([Number, String]),
    stripe: propTypes.bool.def(false),
    border: propTypes.bool.def(true),
    size: {
      type: String as PropType<ComponentSize>,
      validator: (v: ComponentSize) => ['default', 'small', 'large'].includes(v)
    },
    fit: propTypes.bool.def(true),
    showHeader: propTypes.bool.def(true),
    highlightCurrentRow: propTypes.bool.def(false),
    currentRowKey: propTypes.oneOfType([Number, String]),
    // row-class-name, 타입은 (row: Recordable, rowIndex: number) => string | string
    rowClassName: {
      type: [Function, String] as PropType<(row: Recordable, rowIndex: number) => string | string>,
      default: ''
    },
    rowStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, rowIndex: number) => Recordable | CSSProperties
      >,
      default: undefined
    },
    cellClassName: {
      type: [Function, String] as PropType<
        (row: Recordable, column: any, rowIndex: number) => string | string
      >,
      default: ''
    },
    cellStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, column: any, rowIndex: number) => Recordable | CSSProperties
      >,
      default: undefined
    },
    headerRowClassName: {
      type: [Function, String] as PropType<(row: Recordable, rowIndex: number) => string | string>,
      default: ''
    },
    headerRowStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, rowIndex: number) => Recordable | CSSProperties
      >,
      default: undefined
    },
    headerCellClassName: {
      type: [Function, String] as PropType<
        (row: Recordable, column: any, rowIndex: number) => string | string
      >,
      default: ''
    },
    headerCellStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, column: any, rowIndex: number) => Recordable | CSSProperties
      >,
      default: undefined
    },
    rowKey: propTypes.string.def('id'),
    emptyText: propTypes.string.def('No Data'),
    defaultExpandAll: propTypes.bool.def(false),
    expandRowKeys: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    defaultSort: {
      type: Object as PropType<{ prop: string; order: string }>,
      default: () => ({})
    },
    tooltipEffect: {
      type: String as PropType<'dark' | 'light'>,
      default: 'dark'
    },
    tooltipOptions: {
      type: Object as PropType<
        Pick<
          ElTooltipProps,
          | 'effect'
          | 'enterable'
          | 'hideAfter'
          | 'offset'
          | 'placement'
          | 'popperClass'
          | 'popperOptions'
          | 'showAfter'
          | 'showArrow'
        >
      >,
      default: () => ({
        enterable: true,
        placement: 'top',
        showArrow: true,
        hideAfter: 200,
        popperOptions: { strategy: 'fixed' }
      })
    },
    showSummary: propTypes.bool.def(false),
    sumText: propTypes.string.def('Sum'),
    summaryMethod: {
      type: Function as PropType<(param: { columns: any[]; data: any[] }) => any[]>,
      default: undefined
    },
    spanMethod: {
      type: Function as PropType<
        (param: { row: any; column: any; rowIndex: number; columnIndex: number }) => any[]
      >,
      default: undefined
    },
    selectOnIndeterminate: propTypes.bool.def(true),
    indent: propTypes.number.def(16),
    lazy: propTypes.bool.def(false),
    load: {
      type: Function as PropType<(row: Recordable, treeNode: any, resolve: Function) => void>,
      default: undefined
    },
    treeProps: {
      type: Object as PropType<{ hasChildren?: string; children?: string; label?: string }>,
      default: () => ({ hasChildren: 'hasChildren', children: 'children', label: 'label' })
    },
    tableLayout: {
      type: String as PropType<'auto' | 'fixed'>,
      default: 'fixed'
    },
    scrollbarAlwaysOn: propTypes.bool.def(false),
    flexible: propTypes.bool.def(false),
    // 사용자 정의 내용
    customContent: propTypes.bool.def(false),
    cardBodyStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({})
    },
    cardBodyClass: {
      type: String as PropType<string>,
      default: ''
    },
    cardWrapStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({})
    },
    cardWrapClass: {
      type: String as PropType<string>,
      default: ''
    }
  },
  emits: ['update:pageSize', 'update:currentPage', 'register', 'refresh'],
  setup(props, { attrs, emit, slots, expose }) {
    const elTableRef = ref<ComponentRef<typeof ElTable>>()

    // 등록
    onMounted(() => {
      const tableRef = unref(elTableRef)
      emit('register', tableRef?.$parent, elTableRef)
    })

    const pageSizeRef = ref(props.pageSize)

    const currentPageRef = ref(props.currentPage)

    // useTable에서 전달된 props
    const outsideProps = ref<TableProps>({})

    const mergeProps = ref<TableProps>({})

    const getProps = computed(() => {
      const propsObj = { ...props }
      Object.assign(propsObj, unref(mergeProps))
      return propsObj
    })

    const setProps = (props: TableProps = {}) => {
      mergeProps.value = Object.assign(unref(mergeProps), props)
      outsideProps.value = { ...props } as any
    }

    const setColumn = (columnProps: TableSetProps[], columnsChildren?: TableColumn[]) => {
      const { columns } = unref(getProps)
      for (const v of columnsChildren || columns) {
        for (const item of columnProps) {
          if (v.field === item.field) {
            set(v, item.path, item.value)
          } else if (v.children?.length) {
            setColumn(columnProps, v.children)
          }
        }
      }
    }

    const addColumn = (column: TableColumn, index?: number) => {
      const { columns } = unref(getProps)
      if (index !== void 0) {
        columns.splice(index, 0, column)
      } else {
        columns.push(column)
      }
    }

    const delColumn = (field: string) => {
      const { columns } = unref(getProps)
      const index = columns.findIndex((item) => item.field === field)
      if (index > -1) {
        columns.splice(index, 1)
      }
    }

    const refresh = () => {
      emit('refresh')
    }

    const changSize = (size: ComponentSize) => {
      setProps({ size })
    }

    const confirmSetColumn = (columns: TableColumn[]) => {
      setProps({ columns })
    }

    expose({
      setProps,
      setColumn,
      delColumn,
      addColumn,
      elTableRef
    })

    const pagination = computed(() => {
      return Object.assign(
        {
          small: false,
          background: false,
          pagerCount: 7,
          layout: 'sizes, prev, pager, next, jumper, ->, total',
          pageSizes: [10, 20, 30, 40, 50, 100],
          disabled: false,
          hideOnSinglePage: false,
          total: 10
        },
        unref(getProps).pagination
      )
    })

    watch(
      () => unref(getProps).pageSize,
      (val: number) => {
        pageSizeRef.value = val
      }
    )

    watch(
      () => unref(getProps).currentPage,
      (val: number) => {
        currentPageRef.value = val
      }
    )

    watch(
      () => pageSizeRef.value,
      (val: number) => {
        emit('update:pageSize', val)
      }
    )

    watch(
      () => currentPageRef.value,
      (val: number) => {
        emit('update:currentPage', val)
      }
    )

    const getBindValue = computed(() => {
      const bindValue: Recordable = { ...attrs, ...unref(getProps) }
      delete bindValue.columns
      delete bindValue.data
      delete bindValue.align
      return bindValue
    })

    const renderTreeTableColumn = (columnsChildren: TableColumn[]) => {
      const { align, headerAlign, showOverflowTooltip, imagePreview, videoPreview } =
        unref(getProps)
      return columnsChildren.map((v) => {
        if (v.hidden) return null
        const props = { ...v } as any
        if (props.children) delete props.children

        const children = v.children

        const slots = {
          default: (...args: any[]) => {
            const data = args[0]
            let isPreview = false
            isPreview =
              imagePreview.some((item) => (item as string) === v.field) ||
              videoPreview.some((item) => (item as string) === v.field)

            return children && children.length
              ? renderTreeTableColumn(children)
              : props?.slots?.default
                ? props.slots.default(...args)
                : v?.formatter
                  ? v?.formatter?.(data.row, data.column, get(data.row, v.field), data.$index)
                  : isPreview
                    ? renderPreview(get(data.row, v.field), v.field)
                    : get(data.row, v.field)
          }
        }
        if (props?.slots?.header) {
          slots['header'] = (...args: any[]) => props.slots.header(...args)
        }

        return (
          <ElTableColumn
            showOverflowTooltip={showOverflowTooltip}
            align={align}
            headerAlign={headerAlign}
            {...props}
            prop={v.field}
          >
            {slots}
          </ElTableColumn>
        )
      })
    }

    const renderPreview = (url: string, field: string) => {
      const { imagePreview, videoPreview } = unref(getProps)
      return (
        <div class="flex items-center">
          {imagePreview.includes(field) ? (
            <ElImage
              src={url}
              fit="cover"
              class="w-[100%]"
              lazy
              preview-src-list={[url]}
              preview-teleported
            />
          ) : videoPreview.includes(field) ? (
            <BaseButton
              type="primary"
              icon={<Icon icon="vi-ep:video-play" />}
              onClick={() => {
                createVideoViewer({
                  url
                })
              }}
            >
              미리보기
            </BaseButton>
          ) : null}
        </div>
      )
    }

    const renderTableColumn = (columnsChildren?: TableColumn[]) => {
      const {
        columns,
        reserveIndex,
        pageSize,
        currentPage,
        align,
        headerAlign,
        showOverflowTooltip,
        reserveSelection,
        imagePreview,
        videoPreview
      } = unref(getProps)

      return (columnsChildren || columns).map((v) => {
        if (v.hidden) return null
        if (v.type === 'index') {
          return (
            <ElTableColumn
              type="index"
              index={
                v.index ? v.index : (index) => setIndex(reserveIndex, index, pageSize, currentPage)
              }
              align={v.align || align}
              headerAlign={v.headerAlign || headerAlign}
              label={v.label}
              fixed={v.fixed}
              width="65px"
            ></ElTableColumn>
          )
        } else if (v.type === 'selection') {
          return (
            <ElTableColumn
              type="selection"
              reserveSelection={reserveSelection}
              align={align}
              headerAlign={headerAlign}
              selectable={v.selectable}
              width="50"
            ></ElTableColumn>
          )
        } else {
          const props = { ...v } as any
          if (props.children) delete props.children

          const children = v.children

          const slots = {
            default: (...args: any[]) => {
              const data = args[0]

              let isPreview = false
              isPreview =
                imagePreview.some((item) => (item as string) === v.field) ||
                videoPreview.some((item) => (item as string) === v.field)

              return children && children.length
                ? renderTreeTableColumn(children)
                : props?.slots?.default
                  ? props.slots.default(...args)
                  : v?.formatter
                    ? v?.formatter?.(data.row, data.column, get(data.row, v.field), data.$index)
                    : isPreview
                      ? renderPreview(get(data.row, v.field), v.field)
                      : get(data.row, v.field)
            }
          }
          if (props?.slots?.header) {
            slots['header'] = (...args: any[]) => props.slots.header(...args)
          }
          return (
            <ElTableColumn
              showOverflowTooltip={showOverflowTooltip}
              align={align}
              headerAlign={headerAlign}
              {...props}
              prop={v.field}
            >
              {slots}
            </ElTableColumn>
          )
        }
      })
    }

    return () => {
      const tableSlots = {}
      if (getSlot(slots, 'empty')) {
        tableSlots['empty'] = (...args: any[]) => getSlot(slots, 'empty', args)
      }
      if (getSlot(slots, 'append')) {
        tableSlots['append'] = (...args: any[]) => getSlot(slots, 'append', args)
      }

      return (
        <div v-loading={unref(getProps).loading}>
          {unref(getProps).customContent ? (
            <div class="flex flex-wrap">
              {unref(getProps)?.data?.length ? (
                unref(getProps)?.data.map((item) => {
                  const cardSlots = {
                    default: () => {
                      return getSlot(slots, 'content', item)
                    }
                  }
                  if (getSlot(slots, 'content-header')) {
                    cardSlots['header'] = () => {
                      return getSlot(slots, 'content-header', item)
                    }
                  }
                  if (getSlot(slots, 'content-footer')) {
                    cardSlots['footer'] = () => {
                      return getSlot(slots, 'content-footer', item)
                    }
                  }
                  return (
                    <ElCard
                      shadow="hover"
                      class={unref(getProps).cardWrapClass}
                      style={unref(getProps).cardWrapStyle}
                      bodyClass={unref(getProps).cardBodyClass}
                      bodyStyle={unref(getProps).cardBodyStyle}
                    >
                      {cardSlots}
                    </ElCard>
                  )
                })
              ) : (
                <div class="flex flex-1 justify-center">
                  <ElEmpty description="데이터 없음" />
                </div>
              )}
            </div>
          ) : (
            <>
              {unref(getProps).showAction && !unref(getProps).customContent ? (
                <TableActions
                  columns={unref(getProps).columns}
                  onChangSize={changSize}
                  onRefresh={refresh}
                  onConfirm={confirmSetColumn}
                />
              ) : null}
              <ElTable ref={elTableRef} data={unref(getProps).data} {...unref(getBindValue)}>
                {{
                  default: () => renderTableColumn(),
                  ...tableSlots
                }}
              </ElTable>
            </>
          )}
          {unref(getProps).pagination ? (
            <ElPagination
              v-model:pageSize={pageSizeRef.value}
              v-model:currentPage={currentPageRef.value}
              class="mt-10px"
              {...unref(pagination)}
            ></ElPagination>
          ) : undefined}
        </div>
      )
    }
  }
})
</script>
