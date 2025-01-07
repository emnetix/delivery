<script lang="tsx">
import { PropType, defineComponent, ref, computed, unref, watch, onMounted } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  FormRules,
  ComponentSize
  // FormItemProp
} from 'element-plus'
import { componentMap } from './helper/componentMap'
import { propTypes } from '@/utils/propTypes'
import { getSlot } from '@/utils/tsxHelper'
import {
  setTextPlaceholder,
  setGridProp,
  setComponentProps,
  setItemComponentSlots,
  initModel
} from './helper'
import { useRenderSelect } from './components/useRenderSelect'
import { useRenderRadio } from './components/useRenderRadio'
import { useRenderCheckbox } from './components/useRenderCheckbox'
import { useDesign } from '@/hooks/web/useDesign'
import { findIndex } from '@/utils'
import { get, set } from 'lodash-es'
import { FormProps } from './types'
import {
  FormSchema,
  FormSetProps,
  ComponentNameEnum,
  SelectComponentProps,
  RadioGroupComponentProps,
  CheckboxGroupComponentProps
} from './types'

const { renderSelectOptions } = useRenderSelect()
const { renderRadioOptions } = useRenderRadio()
const { renderCheckboxOptions } = useRenderCheckbox()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('form')

export default defineComponent({
  name: 'Form',
  props: {
    // Form의 레이아웃 구조 배열 생성
    schema: {
      type: Array as PropType<FormSchema[]>,
      default: () => []
    },
    // 그리드 레이아웃이 필요한지 여부
    isCol: propTypes.bool.def(true),
    // 폼 데이터 객체
    model: {
      type: Object as PropType<any>,
      default: () => ({})
    },
    // placeholder를 자동으로 설정할지 여부
    autoSetPlaceholder: propTypes.bool.def(true),
    // 사용자 정의 내용인지 여부
    isCustom: propTypes.bool.def(false),
    // 폼 라벨 너비
    labelWidth: propTypes.oneOfType([String, Number]).def('auto'),
    rules: {
      type: Object as PropType<FormRules>,
      default: () => ({})
    },
    labelPosition: propTypes.oneOf(['left', 'right', 'top']).def('right'),
    labelSuffix: propTypes.string.def(''),
    hideRequiredAsterisk: propTypes.bool.def(false),
    requireAsteriskPosition: propTypes.oneOf(['left', 'right']).def('left'),
    showMessage: propTypes.bool.def(true),
    inlineMessage: propTypes.bool.def(false),
    statusIcon: propTypes.bool.def(false),
    validateOnRuleChange: propTypes.bool.def(true),
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    },
    disabled: propTypes.bool.def(false),
    scrollToError: propTypes.bool.def(false),
    scrollToErrorOffset: propTypes.oneOfType([Boolean, Object]).def(undefined)
    // onValidate: {
    //   type: Function as PropType<(prop: FormItemProp, isValid: boolean, message: string) => void>,
    //   default: () => {}
    // }
  },
  emits: ['register'],
  setup(props, { slots, expose, emit }) {
    // element form 인스턴스
    const elFormRef = ref<ComponentRef<typeof ElForm>>()

    const mergeProps = ref<FormProps>({})

    const getProps = computed(() => {
      const propsObj = { ...props }
      Object.assign(propsObj, unref(mergeProps))
      return propsObj
    })

    // 폼 컴포넌트 저장
    const formComponents = ref({})

    // form-item 컴포넌트 저장
    const formItemComponents = ref({})

    // 폼 데이터
    const formModel = ref<Recordable>(props.model)

    onMounted(() => {
      emit('register', unref(elFormRef)?.$parent, unref(elFormRef))
    })

    // 폼에 값 할당
    const setValues = (data: Recordable = {}) => {
      formModel.value = Object.assign(unref(formModel), data)
    }

    const setProps = (props: FormProps = {}) => {
      mergeProps.value = Object.assign(unref(mergeProps), props)
    }

    const delSchema = (field: string) => {
      const { schema } = unref(getProps)

      const index = findIndex(schema, (v: FormSchema) => v.field === field)
      if (index > -1) {
        schema.splice(index, 1)
      }
    }

    const addSchema = (formSchema: FormSchema, index?: number) => {
      const { schema } = unref(getProps)
      if (index !== void 0) {
        schema.splice(index, 0, formSchema)
        return
      }
      schema.push(formSchema)
    }

    const setSchema = (schemaProps: FormSetProps[]) => {
      const { schema } = unref(getProps)
      for (const v of schema) {
        for (const item of schemaProps) {
          if (v.field === item.field) {
            set(v, item.path, item.value)
          }
        }
      }
    }

    const getOptions = async (fn: Function, item: FormSchema) => {
      const options = await fn()
      setSchema([
        {
          field: item.field,
          path:
            item.component === ComponentNameEnum.TREE_SELECT ||
            item.component === ComponentNameEnum.TRANSFER
              ? 'componentProps.data'
              : 'componentProps.options',
          value: options
        }
      ])
    }

    /**
     * @description: 폼 컴포넌트 인스턴스 가져오기
     * @param filed 폼 필드
     */
    const getComponentExpose = (filed: string) => {
      return unref(formComponents)[filed]
    }

    /**
     * @description: formItem 인스턴스 가져오기
     * @param filed 폼 필드
     */
    const getFormItemExpose = (filed: string) => {
      return unref(formItemComponents)[filed]
    }

    const setComponentRefMap = (ref: any, filed: string) => {
      formComponents.value[filed] = ref
    }

    const setFormItemRefMap = (ref: any, filed: string) => {
      formItemComponents.value[filed] = ref
    }

    expose({
      setValues,
      formModel,
      setProps,
      delSchema,
      addSchema,
      setSchema,
      getComponentExpose,
      getFormItemExpose
    })

    // 폼 구조화 배열 감시, formModel 재생성
    watch(
      () => unref(getProps).schema,
      (schema = []) => {
        formModel.value = initModel(schema, unref(formModel))
      },
      {
        immediate: true,
        deep: true
      }
    )

    // 래퍼 태그 렌더링, 그리드 레이아웃 사용 여부
    const renderWrap = () => {
      const { isCol } = unref(getProps)
      const content = isCol ? (
        <ElRow gutter={20}>{renderFormItemWrap()}</ElRow>
      ) : (
        renderFormItemWrap()
      )
      return content
    }

    // el-col을 렌더링해야 하는지 여부
    const renderFormItemWrap = () => {
      // hidden 속성은 숨김을 의미하며, 렌더링하지 않음
      const { schema = [], isCol } = unref(getProps)

      return schema
        .filter((v) => !v.remove)
        .map((item) => {
          // 만약 Divider 컴포넌트라면, 자체적으로 한 행을 차지해야 함
          const isDivider = item.component === 'Divider'
          const Com = componentMap['Divider'] as ReturnType<typeof defineComponent>
          return isDivider ? (
            <Com {...{ contentPosition: 'left', ...item.componentProps }}>{item?.label}</Com>
          ) : isCol ? (
            // 그리드가 필요한 경우, ElCol로 래핑해야 함
            <ElCol {...setGridProp(item.colProps)}>{renderFormItem(item)}</ElCol>
          ) : (
            renderFormItem(item)
          )
        })
    }

    // formItem 렌더링
    const renderFormItem = (item: FormSchema) => {
      // optionApi가 있고 options가 없거나 빈 배열인 경우 optionApi를 우선 사용
      if (
        item.optionApi &&
        (!item.componentProps?.options || !item.componentProps?.options.length)
      ) {
        // 내부에서 자동으로 인터페이스를 호출하여 다른 렌더링에 영향을 주지 않음
        getOptions(item.optionApi, item)
      }
      const formItemSlots: Recordable = {
        default: () => {
          if (item?.formItemProps?.slots?.default) {
            return item?.formItemProps?.slots?.default(formModel.value)
          } else {
            const Com = componentMap[item.component as string] as ReturnType<typeof defineComponent>

            const { autoSetPlaceholder } = unref(getProps)

            const componentSlots = (item?.componentProps as any)?.slots || {}
            const slotsMap: Recordable = {
              ...setItemComponentSlots(componentSlots)
            }
            // // 만약 select 컴포넌트이고 사용자 정의 템플릿이 없다면, 자동으로 options를 렌더링
            if (item.component === ComponentNameEnum.SELECT) {
              slotsMap.default = !componentSlots.default
                ? () => renderSelectOptions(item)
                : () => {
                    return componentSlots.default(
                      unref((item?.componentProps as SelectComponentProps)?.options)
                    )
                  }
            }

            // 가상 목록
            if (item.component === ComponentNameEnum.SELECT_V2 && componentSlots.default) {
              slotsMap.default = ({ item }) => {
                return componentSlots.default(item)
              }
            }

            // 라디오 그룹 및 버튼 스타일
            if (
              item.component === ComponentNameEnum.RADIO_GROUP ||
              item.component === ComponentNameEnum.RADIO_BUTTON
            ) {
              slotsMap.default = !componentSlots.default
                ? () => renderRadioOptions(item)
                : () => {
                    return componentSlots.default(
                      unref((item?.componentProps as CheckboxGroupComponentProps)?.options)
                    )
                  }
            }

            // 체크박스 그룹 및 버튼 스타일
            if (
              item.component === ComponentNameEnum.CHECKBOX_GROUP ||
              item.component === ComponentNameEnum.CHECKBOX_BUTTON
            ) {
              slotsMap.default = !componentSlots.default
                ? () => renderCheckboxOptions(item)
                : () => {
                    return componentSlots.default(
                      unref((item?.componentProps as RadioGroupComponentProps)?.options)
                    )
                  }
            }

            const Comp = () => {
              // 만약 field가 다중 경로인 경우, 객체로 변환해야 함
              const itemVal = computed({
                get: () => {
                  return get(formModel.value, item.field)
                },
                set: (val) => {
                  set(formModel.value, item.field, val)
                }
              })

              return item.component === ComponentNameEnum.UPLOAD ? (
                <Com
                  vModel:file-list={itemVal.value}
                  ref={(el: any) => setComponentRefMap(el, item.field)}
                  {...(autoSetPlaceholder && setTextPlaceholder(item))}
                  {...setComponentProps(item)}
                  style={
                    item.componentProps?.style || {
                      width: '100%'
                    }
                  }
                >
                  {{ ...slotsMap }}
                </Com>
              ) : (
                <Com
                  vModel={itemVal.value}
                  ref={(el: any) => setComponentRefMap(el, item.field)}
                  {...(autoSetPlaceholder && setTextPlaceholder(item))}
                  {...setComponentProps(item)}
                  style={
                    item.componentProps?.style || {
                      width: '100%'
                    }
                  }
                >
                  {{ ...slotsMap }}
                </Com>
              )
            }

            return <>{Comp()}</>
          }
        }
      }
      if (item?.formItemProps?.slots?.label) {
        formItemSlots.label = (...args: any[]) => {
          return (item?.formItemProps?.slots as any)?.label(...args)
        }
      }
      if (item?.formItemProps?.slots?.error) {
        formItemSlots.error = (...args: any[]) => {
          return (item?.formItemProps?.slots as any)?.error(...args)
        }
      }
      return (
        <ElFormItem
          v-show={!item.hidden}
          ref={(el: any) => setFormItemRefMap(el, item.field)}
          {...(item.formItemProps || {})}
          prop={item.field}
          label={item.label || ''}
        >
          {formItemSlots}
        </ElFormItem>
      )
    }

    // Form 컴포넌트에 전달되는 속성 필터링
    const getFormBindValue = () => {
      // 태그에 불필요한 속성이 나타나지 않도록 함
      const delKeys = ['schema', 'isCol', 'autoSetPlaceholder', 'isCustom', 'model']
      const props = { ...unref(getProps) }
      for (const key in props) {
        if (delKeys.indexOf(key) !== -1) {
          delete props[key]
        }
      }
      return props as FormProps
    }

    return () => (
      <ElForm
        ref={elFormRef}
        {...getFormBindValue()}
        model={unref(getProps).isCustom ? unref(getProps).model : formModel}
        class={prefixCls}
        // @ts-ignore
        onSubmit={(e: Event) => {
          e.preventDefault()
        }}
      >
        {{
          // 사용자 정의가 필요한 경우, 아무것도 렌더링하지 않고 기본 슬롯을 제공
          default: () => {
            const { isCustom } = unref(getProps)
            return isCustom ? getSlot(slots, 'default') : renderWrap()
          }
        }}
      </ElForm>
    )
  }
})
</script>

<style lang="less" scoped>
.@{elNamespace}-form.@{adminNamespace}-form .@{elNamespace}-row {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.@{elNamespace}-form--inline {
  :deep(.el-form-item__content) {
    & > :first-child {
      min-width: 229.5px;
    }
  }
  .@{elNamespace}-input-number {
    // 229.5px는 el-input-number의 최소 너비와 호환됨
    min-width: 229.5px;
  }
}
</style>