module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새 기능(feature)
        'fix', // 버그 수정
        'docs', // 문서(documentation)
        'style', // 형식, 스타일(코드 실행에 영향을 주지 않는 변경)
        'refactor', // 리팩토링(새 기능 추가나 버그 수정이 아닌 코드 변경)
        'perf', // 성능 개선 관련, 예를 들어 성능이나 사용자 경험 향상
        'test', // 테스트 추가
        'ci', // 지속적 통합 수정
        'chore', // 빌드 프로세스 또는 보조 도구 변경
        'revert', // 이전 버전으로 롤백
        'workflow', // 작업 흐름 개선
        'mod', // 분류가 확실하지 않은 수정
        'wip', // 개발 중
        'types', // 타입 수정
        'release' // 버전 출시
      ]
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
}
