import type { Form, FormExpose } from '@/components/Form'
import type { ElForm, ElFormItem } from 'element-plus'
import { ref, unref, nextTick } from 'vue'
import { FormSchema, FormSetProps, FormProps } from '@/components/Form'
import { isEmptyVal, isObject } from '@/utils/is'

export const useForm = () => {
  // Form 인스턴스
  const formRef = ref<typeof Form & FormExpose>()

  // ElForm 인스턴스
  const elFormRef = ref<ComponentRef<typeof ElForm>>()

  /**
   * @param ref Form 인스턴스
   * @param elRef ElForm 인스턴스
   */
  const register = (ref: typeof Form & FormExpose, elRef: ComponentRef<typeof ElForm>) => {
    formRef.value = ref
    elFormRef.value = elRef
  }

  const getForm = async () => {
    await nextTick()
    const form = unref(formRef)
    if (!form) {
      console.error('The form is not registered. Please use the register method to register')
    }
    return form
  }

  // 일부 내장 메서드
  const methods = {
    /**
     * @description form 컴포넌트의 props 설정
     * @param props form 컴포넌트의 props
     */
    setProps: async (props: FormProps = {}) => {
      const form = await getForm()
      form?.setProps(props)
      if (props.model) {
        form?.setValues(props.model)
      }
    },

    /**
     * @description form의 값 설정
     * @param data 설정할 데이터
     */
    setValues: async (data: Recordable) => {
      const form = await getForm()
      form?.setValues(data)
    },

    /**
     * @description schema 설정
     * @param schemaProps 설정할 schemaProps
     */
    setSchema: async (schemaProps: FormSetProps[]) => {
      const form = await getForm()
      form?.setSchema(schemaProps)
    },

    /**
     * @description schema 추가
     * @param formSchema 추가할 데이터
     * @param index 어디에 추가할지
     */
    addSchema: async (formSchema: FormSchema, index?: number) => {
      const form = await getForm()
      form?.addSchema(formSchema, index)
    },

    /**
     * @description schema 삭제
     * @param field 삭제할 데이터
     */
    delSchema: async (field: string) => {
      const form = await getForm()
      form?.delSchema(field)
    },

    /**
     * @description 폼 데이터 가져오기
     * @returns form data
     */
    getFormData: async <T = Recordable>(filterEmptyVal = true): Promise<T> => {
      const form = await getForm()
      const model = form?.formModel as any
      if (filterEmptyVal) {
        // reduce를 사용하여 빈 값을 필터링하고 새 객체 반환
        return Object.keys(model).reduce((prev, next) => {
          const value = model[next]
          if (!isEmptyVal(value)) {
            if (isObject(value)) {
              if (Object.keys(value).length > 0) {
                prev[next] = value
              }
            } else {
              prev[next] = value
            }
          }
          return prev
        }, {}) as T
      } else {
        return model as T
      }
    },

    /**
     * @description 폼 컴포넌트의 인스턴스 가져오기
     * @param field 폼 항목 고유 식별자
     * @returns component instance
     */
    getComponentExpose: async (field: string) => {
      const form = await getForm()
      return form?.getComponentExpose(field)
    },

    /**
     * @description formItem 컴포넌트의 인스턴스 가져오기
     * @param field 폼 항목 고유 식별자
     * @returns formItem instance
     */
    getFormItemExpose: async (field: string) => {
      const form = await getForm()
      return form?.getFormItemExpose(field) as ComponentRef<typeof ElFormItem>
    },

    /**
     * @description ElForm 컴포넌트의 인스턴스 가져오기
     * @returns ElForm instance
     */
    getElFormExpose: async () => {
      await getForm()
      return unref(elFormRef)
    },

    getFormExpose: async () => {
      await getForm()
      return unref(formRef)
    }
  }

  return {
    formRegister: register,
    formMethods: methods
  }
}
