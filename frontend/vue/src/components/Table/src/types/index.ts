import { TableProps as ElTableProps } from 'element-plus'
export interface TableColumn {
  field: string
  label?: string
  type?: string
  /**
   * 숨김 여부
   */
  hidden?: boolean
  children?: TableColumn[]
  slots?: {
    default?: (...args: any[]) => JSX.Element | JSX.Element[] | null
    header?: (...args: any[]) => JSX.Element | null
  }
  index?: number | ((index: number) => number)
  columnKey?: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  renderHeader?: (...args: any[]) => JSX.Element | null
  // sortable?: boolean
  sortMethod?: (...args: any[]) => number
  sortBy?: string | string[] | ((...args: any[]) => string | string[])
  sortOrders?: (string | null)[]
  resizable?: boolean
  formatter?: (...args: any[]) => any
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  selectable?: (...args: any[]) => boolean
  reserveSelection?: boolean
  filters?: Array<{ text: string; value: string }>
  filterPlacement?: string
  filterMultiple?: boolean
  filterMethod?: (...args: any[]) => boolean
  filteredValue?: string[]
  [key: string]: any
}

export interface TableSlotDefault {
  row: Recordable
  column: TableColumn
  $index: number
  [key: string]: any
}

export interface Pagination {
  small?: boolean
  background?: boolean
  pageSize?: number
  defaultPageSize?: number
  total?: number
  pageCount?: number
  pagerCount?: number
  currentPage?: number
  defaultCurrentPage?: number
  layout?: string
  pageSizes?: number[]
  popperClass?: string
  prevText?: string
  nextText?: string
  disabled?: boolean
  hideOnSinglePage?: boolean
}

export interface TableSetProps {
  field: string
  path: string
  value: any
}

export interface TableProps extends Omit<Partial<ElTableProps<any[]>>, 'data'> {
  pageSize?: number
  currentPage?: number
  showAction?: boolean
  // 모든 초과 내용을 숨길지 여부, schema의 showOverflowTooltip보다 우선순위가 낮음
  showOverflowTooltip?: boolean
  // 테이블 헤더
  columns?: TableColumn[]
  // 페이지네이션 표시 여부
  pagination?: Pagination | undefined
  // type=selection 열에만 유효, Boolean 타입, true이면 데이터 업데이트 후 이전에 선택한 데이터를 유지함 (row-key 지정 필요)
  reserveSelection?: boolean
  // 로딩 상태
  loading?: boolean
  // 인덱스를 누적할지 여부
  reserveIndex?: boolean
  // 정렬 방식
  align?: 'left' | 'center' | 'right'
  // 헤더 정렬 방식
  headerAlign?: 'left' | 'center' | 'right'
  imagePreview?: string[]
  videoPreview?: string[]
  sortable?: boolean
  data?: Recordable
}
