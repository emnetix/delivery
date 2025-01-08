import * as monaco from 'monaco-editor'
import { ref, nextTick, onBeforeUnmount } from 'vue'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

export function useMonacoEditor(language: string = 'javascript') {
  // 에디터 인스턴스
  let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null
  // 대상 요소
  const monacoEditorRef = ref<HTMLElement>()

  // 인스턴스 생성
  function createEditor(editorOption: monaco.editor.IStandaloneEditorConstructionOptions = {}) {
    if (!monacoEditorRef.value) return
    monacoEditor = monaco.editor.create(monacoEditorRef.value, {
      // 초기 모델
      model: monaco.editor.createModel('', language),
      // 미니맵 활성화 여부
      minimap: { enabled: true },
      // 둥근 선택
      roundedSelection: true,
      // 테마
      theme: 'vs-dark',
      // 멀티 커서 수정자
      multiCursorModifier: 'ctrlCmd',
      // 스크롤바
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      },
      // 줄 번호
      lineNumbers: 'on',
      // 탭 크기
      tabSize: 2,
      // 글꼴 크기
      fontSize: 14,
      // 사용자가 입력, 붙여넣기, 이동 또는 들여쓰기 할 때 자동으로 들여쓰기를 조정할지 여부
      autoIndent: 'advanced',
      // 자동 레이아웃
      automaticLayout: true,
      ...editorOption
    })
    return monacoEditor
  }

  // 포맷팅
  async function formatDoc() {
    await monacoEditor?.getAction('editor.action.formatDocument')?.run()
  }

  // 데이터 업데이트
  function updateVal(val: string) {
    nextTick(() => {
      if (getOption(monaco.editor.EditorOption.readOnly)) {
        updateOptions({ readOnly: false })
      }
      monacoEditor?.setValue(val)
      setTimeout(async () => {
        await formatDoc()
      }, 10)
    })
  }

  // 설정 업데이트
  function updateOptions(opt: monaco.editor.IStandaloneEditorConstructionOptions) {
    monacoEditor?.updateOptions(opt)
  }

  // 설정 가져오기
  function getOption(name: monaco.editor.EditorOption) {
    return monacoEditor?.getOption(name)
  }

  // 인스턴스 가져오기
  function getEditor() {
    return monacoEditor
  }

  function changeLanguage(newLanguage: string) {
    const model = monacoEditor?.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }

  function changeTheme(newTheme: string) {
    monaco.editor.setTheme(newTheme)
  }

  // 페이지 이탈 시 제거
  onBeforeUnmount(() => {
    if (monacoEditor) {
      monacoEditor.dispose()
    }
  })

  return {
    monacoEditorRef,
    createEditor,
    getEditor,
    updateVal,
    updateOptions,
    getOption,
    formatDoc,
    changeLanguage,
    changeTheme
  }
}
