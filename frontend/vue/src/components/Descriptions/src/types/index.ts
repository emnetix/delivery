export interface DescriptionsSchema {
  span?: number // 차지하는 칸 수
  field: string // 필드명
  label?: string // 레이블명
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  labelAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  slots?: {
    default?: (...args: any[]) => JSX.Element | null
    label?: (...args: any[]) => JSX.Element | null
  }
}
