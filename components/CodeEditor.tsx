import React, { useEffect, useRef, useState } from 'react';
import { Play, Save, X, Code, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Widget } from '../types/widget';

interface CodeEditorProps {
  widget: Widget | null;
  code: string;
  darkMode: boolean;
  onCodeChange: (code: string) => void;
  onSave: () => void;
  onClose: () => void;
  onRun?: () => void;
}

// Monaco Editor 타입 정의
declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  widget,
  code,
  darkMode,
  onCodeChange,
  onSave,
  onClose,
  onRun,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<any>(null);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);
  const [errors, setErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Monaco Editor 로드
  useEffect(() => {
    if (window.monaco) {
      setIsMonacoLoaded(true);
      return;
    }

    // Monaco Editor CDN 로드
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
    script.async = true;
    script.onload = () => {
      window.require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs',
        },
      });

      window.require(['vs/editor/editor.main'], () => {
        setIsMonacoLoaded(true);
      });
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Monaco Editor 초기화
  useEffect(() => {
    if (!isMonacoLoaded || !editorRef.current || monacoEditorRef.current) return;

    // Python 언어 설정 강화
    if (window.monaco?.languages?.python?.conf) {
      window.monaco.languages.python.conf.wordPattern = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g;
    }

    // 커스텀 자동완성 제공자 등록
    const completionProvider = window.monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // 위젯 이름 목록 (실제로는 props에서 전달받아야 함)
        const widgetNames = widget ? [widget.name] : [];

        const suggestions = [
          // setWidget 함수
          {
            label: 'setWidget',
            kind: window.monaco.languages.CompletionItemKind.Function,
            documentation: '위젯의 속성을 변경합니다',
            insertText: 'setWidget("${1:widgetName}", "${2:property}", ${3:value})',
            insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          // getWidget 함수
          {
            label: 'getWidget',
            kind: window.monaco.languages.CompletionItemKind.Function,
            documentation: '위젯의 속성 값을 가져옵니다',
            insertText: 'getWidget("${1:widgetName}", "${2:property}")',
            insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          // msgBox 함수
          {
            label: 'msgBox',
            kind: window.monaco.languages.CompletionItemKind.Function,
            documentation: '메시지 박스를 표시합니다',
            insertText: 'msgBox("${1:message}", "${2:title}", "${3|info,warning,error,question|}")',
            insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          // print 함수
          {
            label: 'print',
            kind: window.monaco.languages.CompletionItemKind.Function,
            documentation: '콘솔에 출력합니다',
            insertText: 'print(${1:value})',
            insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          // 속성 제안
          {
            label: '"text"',
            kind: window.monaco.languages.CompletionItemKind.Property,
            documentation: '위젯의 텍스트 속성',
            insertText: '"text"',
            range,
          },
          {
            label: '"value"',
            kind: window.monaco.languages.CompletionItemKind.Property,
            documentation: '위젯의 값 속성',
            insertText: '"value"',
            range,
          },
          {
            label: '"checked"',
            kind: window.monaco.languages.CompletionItemKind.Property,
            documentation: '체크박스/라디오 버튼의 체크 상태',
            insertText: '"checked"',
            range,
          },
          {
            label: '"bgColor"',
            kind: window.monaco.languages.CompletionItemKind.Property,
            documentation: '배경색',
            insertText: '"bgColor"',
            range,
          },
          {
            label: '"textColor"',
            kind: window.monaco.languages.CompletionItemKind.Property,
            documentation: '텍스트 색상',
            insertText: '"textColor"',
            range,
          },
        ];

        // 위젯 이름 자동완성 추가
        widgetNames.forEach((name) => {
          suggestions.push({
            label: `"${name}"`,
            kind: window.monaco.languages.CompletionItemKind.Variable,
            documentation: `위젯: ${name}`,
            insertText: `"${name}"`,
            range,
          });
        });

        return { suggestions };
      },
    });

    // 에디터 생성
    const editor = window.monaco.editor.create(editorRef.current, {
      value: code,
      language: 'python',
      theme: darkMode ? 'vs-dark' : 'vs',
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 4,
      insertSpaces: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
    });

    // 코드 변경 이벤트
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onCodeChange(value);
      validateCode(value);
    });

    // Ctrl+S로 저장
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Ctrl+Enter로 실행
    if (onRun) {
      editor.addCommand(
        window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter,
        () => {
          onRun();
        }
      );
    }

    monacoEditorRef.current = editor;

    return () => {
      completionProvider.dispose();
      editor.dispose();
    };
  }, [isMonacoLoaded, darkMode]);

  // 테마 변경
  useEffect(() => {
    if (monacoEditorRef.current && isMonacoLoaded) {
      window.monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs');
    }
  }, [darkMode, isMonacoLoaded]);

  // 코드 유효성 검사
  const validateCode = (code: string) => {
    const errors: Array<{ line: number; message: string }> = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // 간단한 문법 체크
      if (trimmed && !trimmed.startsWith('#')) {
        // setWidget 문법 체크
        if (trimmed.includes('setWidget') && !trimmed.match(/setWidget\s*\(\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*.+\s*\)/)) {
          errors.push({
            line: index + 1,
            message: 'setWidget 문법 오류: setWidget("위젯이름", "속성", 값) 형식이어야 합니다',
          });
        }

        // getWidget 문법 체크
        if (trimmed.includes('getWidget') && !trimmed.match(/getWidget\s*\(\s*"[^"]*"\s*,\s*"[^"]*"\s*\)/)) {
          errors.push({
            line: index + 1,
            message: 'getWidget 문법 오류: getWidget("위젯이름", "속성") 형식이어야 합니다',
          });
        }

        // 괄호 짝 체크
        const openParen = (line.match(/\(/g) || []).length;
        const closeParen = (line.match(/\)/g) || []).length;
        if (openParen !== closeParen) {
          errors.push({
            line: index + 1,
            message: '괄호가 맞지 않습니다',
          });
        }
      }
    });

    setErrors(errors);

    // Monaco에 에러 마커 표시
    if (monacoEditorRef.current && isMonacoLoaded) {
      const model = monacoEditorRef.current.getModel();
      const markers = errors.map((error) => ({
        severity: window.monaco.MarkerSeverity.Error,
        startLineNumber: error.line,
        startColumn: 1,
        endLineNumber: error.line,
        endColumn: model.getLineMaxColumn(error.line),
        message: error.message,
      }));
      window.monaco.editor.setModelMarkers(model, 'owner', markers);
    }
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className={`fixed inset-0 ${bgColor} z-50 flex flex-col`}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
        <div className="flex items-center gap-3">
          <Code size={20} />
          <div>
            <h2 className={`font-bold ${textColor}`}>
              {widget ? `${widget.name} - 이벤트 코드` : '코드 편집기'}
            </h2>
            {widget && (
              <p className="text-xs text-gray-500">
                타입: {widget.type} | 더블클릭: 코드 편집
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Info size={16} />
            도움말
          </button>

          {onRun && (
            <button
              onClick={onRun}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 text-sm"
              title="Ctrl+Enter"
            >
              <Play size={16} />
              실행
            </button>
          )}

          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 text-sm"
            title="Ctrl+S"
          >
            <Save size={16} />
            저장
          </button>

          <button
            onClick={onClose}
            className={`p-1.5 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : ''}`}
            title="Esc"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 에디터 영역 */}
        <div className="flex-1 flex flex-col">
          <div ref={editorRef} className="flex-1" />

          {/* 에러 표시 */}
          {errors.length > 0 && (
            <div className={`border-t ${borderColor} p-3 max-h-32 overflow-y-auto`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-red-500">
                  {errors.length}개의 문제가 발견되었습니다
                </span>
              </div>
              {errors.map((error, idx) => (
                <div
                  key={idx}
                  className="text-xs text-red-600 dark:text-red-400 py-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 px-2 rounded"
                  onClick={() => {
                    if (monacoEditorRef.current) {
                      monacoEditorRef.current.revealLineInCenter(error.line);
                      monacoEditorRef.current.setPosition({
                        lineNumber: error.line,
                        column: 1,
                      });
                      monacoEditorRef.current.focus();
                    }
                  }}
                >
                  줄 {error.line}: {error.message}
                </div>
              ))}
            </div>
          )}

          {errors.length === 0 && code.trim() && (
            <div className={`border-t ${borderColor} p-2 flex items-center gap-2 text-sm`}>
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-green-600 dark:text-green-400">문제 없음</span>
            </div>
          )}
        </div>

        {/* 도움말 패널 */}
        {showHelp && (
          <div className={`w-80 border-l ${borderColor} p-4 overflow-y-auto`}>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Info size={18} />
              API 참조
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  setWidget(위젯이름, 속성, 값)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  위젯의 속성을 변경합니다
                </p>
                <pre className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
{`setWidget("label1", "text", "안녕")
setWidget("textbox1", "value", "텍스트")
setWidget("button1", "bgColor", "#ff0000")`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  getWidget(위젯이름, 속성)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  위젯의 속성 값을 가져옵니다
                </p>
                <pre className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
{`value = getWidget("textbox1", "value")
text = getWidget("label1", "text")
checked = getWidget("checkbox1", "checked")`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  msgBox(메시지, 제목, 타입)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  메시지 박스를 표시합니다
                </p>
                <pre className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
{`msgBox("안녕하세요!", "인사", "info")
msgBox("주의하세요", "경고", "warning")
msgBox("에러 발생", "오류", "error")
msgBox("계속할까요?", "확인", "question")`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  사용 가능한 속성
                </h4>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <code>text</code> - 텍스트</li>
                  <li>• <code>value</code> - 값 (textbox, slider)</li>
                  <li>• <code>checked</code> - 체크 상태</li>
                  <li>• <code>bgColor</code> - 배경색</li>
                  <li>• <code>textColor</code> - 텍스트 색상</li>
                  <li>• <code>fontSize</code> - 글자 크기</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  단축키
                </h4>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <kbd>Ctrl+S</kbd> - 저장</li>
                  <li>• <kbd>Ctrl+Enter</kbd> - 실행</li>
                  <li>• <kbd>Ctrl+Space</kbd> - 자동완성</li>
                  <li>• <kbd>F1</kbd> - 명령 팔레트</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
