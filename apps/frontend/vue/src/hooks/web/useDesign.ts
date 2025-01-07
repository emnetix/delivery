import variables from '@/styles/variables.module.less'

export const useDesign = () => {
  const lessVariables = variables

  /**
   * @param scope 클래스명
   * @returns 네임스페이스-클래스명 반환
   */
  const getPrefixCls = (scope: string) => {
    return `${lessVariables.namespace}-${scope}`
  }

  return {
    variables: lessVariables,
    getPrefixCls
  }
}
