/**
 * 요청 성공 상태 코드
 */
export const SUCCESS_CODE = 0

/**
 * 요청 contentType
 */
export const CONTENT_TYPE: AxiosContentType = 'application/json'

/**
 * 요청 타임아웃 시간
 */
export const REQUEST_TIMEOUT = 60000

/**
 * 리다이렉트하지 않는 화이트리스트
 */
export const NO_REDIRECT_WHITE_LIST = [
  '/catalog',
  '/login',
  '/ent01/vdi',
  '/ent01/vdo',
  '/videocall'
]

/**
 * 라우트를 재설정하지 않는 화이트리스트
 */
export const NO_RESET_WHITE_LIST = [
  'Redirect',
  'Login',
  'NoFind',
  'Root',
  'Catalog',
  'VirualDigitalInput',
  'VirualDigitalOutput',
  'VideoCall'
]

/**
 * 테이블 기본 필터 열 설정 필드
 */
export const DEFAULT_FILTER_COLUMN = ['expand', 'selection']

/**
 * headers->content-type에 따라 데이터 형식을 자동 변환할지 여부
 */
export const TRANSFORM_REQUEST_DATA = true

/**
 * 전역 아이콘 접두사
 */
export const ICON_PREFIX = 'vi-'
