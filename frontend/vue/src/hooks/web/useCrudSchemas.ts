import { reactive } from 'vue'
import { eachTree, treeMap, filter } from '@/utils/tree'
import { FormSchema } from '@/components/Form'
import { TableColumn } from '@/components/Table'
import { DescriptionsSchema } from '@/components/Descriptions'

export type CrudSchema = Omit<TableColumn, 'children'> & {
  search?: CrudSearchParams
  table?: CrudTableParams
  form?: CrudFormParams
  detail?: CrudDescriptionsParams
  children?: CrudSchema[]
}

interface CrudSearchParams extends Omit<FormSchema, 'field'> {
  // 검색 항목에서 숨길지 여부
  hidden?: boolean
}

interface CrudTableParams extends Omit<TableColumn, 'field'> {
  // 테이블 헤더를 숨길지 여부
  hidden?: boolean
}

interface CrudFormParams extends Omit<FormSchema, 'field'> {
  // 폼 항목을 숨길지 여부
  hidden?: boolean
}

interface CrudDescriptionsParams extends Omit<DescriptionsSchema, 'field'> {
  // 폼 항목을 숨길지 여부
  hidden?: boolean
}

interface AllSchemas {
  searchSchema: FormSchema[]
  tableColumns: TableColumn[]
  formSchema: FormSchema[]
  detailSchema: DescriptionsSchema[]
}

/**
 * @deprecated 사용을 권장하지 않습니다. 너무 복잡하고 유연하지 않다고 느껴집니다. 향후 버전에서 삭제될 수 있습니다.
 */
export const useCrudSchemas = (
  crudSchema: CrudSchema[]
): {
  allSchemas: AllSchemas
} => {
  // 모든 구조 데이터
  const allSchemas = reactive<AllSchemas>({
    searchSchema: [],
    tableColumns: [],
    formSchema: [],
    detailSchema: []
  })

  const searchSchema = filterSearchSchema(crudSchema)
  // @ts-ignore
  allSchemas.searchSchema = searchSchema || []

  const tableColumns = filterTableSchema(crudSchema)
  allSchemas.tableColumns = tableColumns || []

  const formSchema = filterFormSchema(crudSchema)
  allSchemas.formSchema = formSchema

  const detailSchema = filterDescriptionsSchema(crudSchema)
  allSchemas.detailSchema = detailSchema

  return {
    allSchemas
  }
}

// 검색 구조 필터링
const filterSearchSchema = (crudSchema: CrudSchema[]): FormSchema[] => {
  const searchSchema: FormSchema[] = []
  const length = crudSchema.length

  for (let i = 0; i < length; i++) {
    const schemaItem = crudSchema[i]
    if (schemaItem.search?.hidden === true) {
      continue
    }
    // 숨김 여부 판단
    const searchSchemaItem = {
      component: schemaItem?.search?.component || 'Input',
      ...schemaItem.search,
      field: schemaItem.field,
      label: schemaItem.search?.label || schemaItem.label
    }

    searchSchema.push(searchSchemaItem)
  }

  return searchSchema
}

// 테이블 구조 필터링
const filterTableSchema = (crudSchema: CrudSchema[]): TableColumn[] => {
  const tableColumns = treeMap<CrudSchema>(crudSchema, {
    conversion: (schema: CrudSchema) => {
      if (!schema?.table?.hidden) {
        return {
          ...schema,
          ...schema.table
        }
      }
    }
  })

  // 첫 번째 필터링에서 undefined가 있을 수 있으므로 두 번째 필터링이 필요합니다
  return filter<TableColumn>(tableColumns as TableColumn[], (data) => {
    if (data.children === void 0) {
      delete data.children
    }
    return !!data.field
  })
}

// 폼 구조 필터링
const filterFormSchema = (crudSchema: CrudSchema[]): FormSchema[] => {
  const formSchema: FormSchema[] = []
  const length = crudSchema.length

  for (let i = 0; i < length; i++) {
    const formItem = crudSchema[i]
    const formSchemaItem = {
      component: formItem?.form?.component || 'Input',
      ...formItem.form,
      field: formItem.field,
      label: formItem.form?.label || formItem.label
    }

    formSchema.push(formSchemaItem)
  }

  return formSchema
}

// 설명 구조 필터링
const filterDescriptionsSchema = (crudSchema: CrudSchema[]): DescriptionsSchema[] => {
  const descriptionsSchema: FormSchema[] = []

  eachTree(crudSchema, (schemaItem: CrudSchema) => {
    // 숨김 여부 판단
    if (!schemaItem?.detail?.hidden) {
      const descriptionsSchemaItem = {
        ...schemaItem.detail,
        field: schemaItem.field,
        label: schemaItem.detail?.label || schemaItem.label
      }

      // 삭제할 필요 없는 필드
      delete descriptionsSchemaItem.hidden

      descriptionsSchema.push(descriptionsSchemaItem)
    }
  })

  return descriptionsSchema
}
