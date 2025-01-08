import { useI18n } from '@/hooks/web/useI18n'
import { PlaceholderModel, FormSchema, ComponentNameEnum, ColProps } from '../types'
import { isFunction } from '@/utils/is'
import { firstUpperCase, humpToDash } from '@/utils'
import { set, get } from 'lodash-es'

const { t } = useI18n()

/**
 *
 * @param schema 해당 컴포넌트 데이터
 * @returns 힌트 정보 객체 반환
 * @description placeholder 자동 설정에 사용됨
 */
export const setTextPlaceholder = (schema: FormSchema): PlaceholderModel => {
  const textMap = [
    ComponentNameEnum.INPUT,
    ComponentNameEnum.AUTOCOMPLETE,
    ComponentNameEnum.INPUT_NUMBER,
    ComponentNameEnum.INPUT_PASSWORD
  ]
  const selectMap = [
    ComponentNameEnum.SELECT,
    ComponentNameEnum.TIME_PICKER,
    ComponentNameEnum.DATE_PICKER,
    ComponentNameEnum.TIME_SELECT,
    ComponentNameEnum.SELECT_V2
  ]
  if (textMap.includes(schema?.component as ComponentNameEnum)) {
    return {
      placeholder: t('common.inputText')
    }
  }
  if (selectMap.includes(schema?.component as ComponentNameEnum)) {
    // 일부 범위 선택기
    const twoTextMap = ['datetimerange', 'daterange', 'monthrange', 'datetimerange', 'daterange']
    if (
      twoTextMap.includes(
        ((schema?.componentProps as any)?.type ||
          (schema?.componentProps as any)?.isRange) as string
      )
    ) {
      return {
        startPlaceholder: t('common.startTimeText'),
        endPlaceholder: t('common.endTimeText'),
        rangeSeparator: '-'
      }
    } else {
      return {
        placeholder: t('common.selectText')
      }
    }
  }
  return {}
}

/**
 *
 * @param col 내장 그리드
 * @returns 그리드 속성 반환
 * @description 전달된 그리드 속성 병합
 */
export const setGridProp = (col: ColProps = {}): ColProps => {
  const colProps: ColProps = {
    // span이 있으면 사용자 우선순위가 더 높으므로 기본 그리드가 필요하지 않음
    ...(col.span
      ? {}
      : {
          xs: 24,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        }),
    ...col
  }
  return colProps
}

/**
 *
 * @param item 전달된 컴포넌트 속성
 * @returns 기본적으로 clearable 속성 추가
 */
export const setComponentProps = (item: FormSchema): Recordable => {
  // const notNeedClearable = ['ColorPicker']
  // 이벤트를 분리하고 결합
  
  const onEvents = (item?.componentProps as any)?.on || {}
  const newOnEvents: Recordable = {}

  for (const key in onEvents) {
    if (onEvents[key]) {
      newOnEvents[`on${firstUpperCase(key)}`] = (...args: any[]) => {
        onEvents[key](...args)
      }
    }
  }

  const componentProps: Recordable = {
    clearable: true,
    ...item.componentProps,
    ...newOnEvents
  }
  // 추가 속성을 삭제해야 함
  if (componentProps.slots) {
    delete componentProps.slots
  }
  if (componentProps.on) {
    delete componentProps.on
  }
  return componentProps
}

/**
 *
 * @param formModel 폼 데이터
 * @param slotsProps 슬롯 속성
 */
export const setItemComponentSlots = (slotsProps: Recordable = {}): Recordable => {
  const slotObj: Recordable = {}
  for (const key in slotsProps) {
    if (slotsProps[key]) {
      if (isFunction(slotsProps[key])) {
        slotObj[humpToDash(key)] = (...args: any[]) => {
          return slotsProps[key]?.(...args)
        }
      } else {
        slotObj[humpToDash(key)] = () => {
          return slotsProps[key]
        }
      }
    }
  }
  return slotObj
}

/**
 *
 * @param schema Form 폼 구조화 배열
 * @param formModel FormModel
 * @returns FormModel
 * @description 해당하는 formModel 생성
 */
export const initModel = (schema: FormSchema[], formModel: Recordable) => {
  const model: Recordable = { ...formModel }
  schema.map((v) => {
    if (v.remove) {
      delete model[v.field]
    } else if (v.component !== 'Divider') {
      const hasField = get(model, v.field)
      // 이전에 이미 값이 존재하면 재할당하지 않고 기존 값을 사용
      set(
        model,
        v.field,
        hasField !== void 0 ? get(model, v.field) : v.value !== void 0 ? v.value : undefined
      )
    }
  })
  // schema에 해당하는 field가 존재하지 않으면 model에서 해당 field 삭제
  for (let i = 0; i < schema.length; i++) {
    const key = schema[i].field
    if (!Object.prototype.hasOwnProperty.call(model, key)) {
      delete model[key]
    }
  }
  return model
}
