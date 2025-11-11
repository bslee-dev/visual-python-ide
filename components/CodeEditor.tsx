import React, { useEffect, useRef, useState } from 'react';
import { X, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { Widget } from '../types/widget';

interface CodeEditorProps {
  widget: Widget | null;
  code: string;
  darkMode: boolean;
  onCodeChange: (code: string) => void;
  onSave: (code?: string) => void;
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
      const currentCode = editor.getValue();
      onCodeChange(currentCode);
      onSave(currentCode);
    });

    // Esc 키로 저장 후 닫기
    editor.addCommand(window.monaco.KeyCode.Escape, () => {
      // 최신 코드를 직접 전달하여 저장
      const currentCode = editor.getValue();
      console.log('Esc 키 눌림, 코드 저장 시도:', currentCode.substring(0, 50));
      onCodeChange(currentCode);
      onSave(currentCode);
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
  const headerTextColor = darkMode ? 'text-white' : 'text-gray-900'; // 화이트모드에서 더 진한 색상
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className={`fixed inset-0 ${bgColor} z-[9999] flex flex-col`} style={{ isolation: 'isolate' }}>
      {/* 헤더 */}
      <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
        <div className="flex items-center gap-3">
          <Code size={20} className={headerTextColor} />
          <div>
            <h2 className={`font-bold ${headerTextColor}`}>
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
            onClick={() => {
              // 최신 코드를 저장 (handleCodeEditorSave가 이미 닫기까지 처리함)
              if (monacoEditorRef.current) {
                const currentCode = monacoEditorRef.current.getValue();
                onCodeChange(currentCode);
                onSave(currentCode);
              } else {
                onSave();
              }
            }}
            className={`p-1.5 rounded ${
              darkMode 
                ? 'hover:bg-gray-700 text-white' 
                : 'hover:bg-gray-200 text-gray-900 bg-gray-100'
            }`}
            title="Esc"
          >
            <X size={20} className={darkMode ? 'text-white' : 'text-gray-900'} />
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
      </div>
    </div>
  );
};
