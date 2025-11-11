import { useCallback } from 'react';
import { Widget, RuntimeValue, MsgBox } from '../types/widget';

interface CodeExecutionContext {
  widgets: Widget[];
  setWidgetProperty: (widgetName: string, property: string, value: any) => void;
  getWidgetProperty: (widgetName: string, property: string) => any;
  showMsgBox: (message: string, title: string, type: 'info' | 'warning' | 'error' | 'question') => void;
  addConsoleLog: (type: 'log' | 'error', message: string) => void;
}

/**
 * 위젯 이벤트 코드 실행을 관리하는 커스텀 훅
 */
export const useCodeExecution = (context: CodeExecutionContext) => {
  const { widgets, setWidgetProperty, getWidgetProperty, showMsgBox, addConsoleLog } = context;

  const executeWidgetCode = useCallback((widget: Widget, code: string) => {
    addConsoleLog('log', `Executing ${widget.name}...`);
    
    try {
      const setWidget = (name: string, prop: string, value: any) => {
        setWidgetProperty(name, prop, value);
        addConsoleLog('log', `setWidget("${name}", "${prop}", ${JSON.stringify(value)})`);
      };

      const getWidget = (name: string, prop: string) => {
        return getWidgetProperty(name, prop);
      };

      const msgBox = (message: string, title: string = 'Message', type: 'info' | 'warning' | 'error' | 'question' = 'info') => {
        showMsgBox(message, title, type);
        addConsoleLog('log', `msgBox("${message}", "${title}", "${type}")`);
      };

      const customConsole = {
        log: (...args: any[]) => {
          addConsoleLog('log', args.join(' '));
        },
        error: (...args: any[]) => {
          addConsoleLog('error', args.join(' '));
        }
      };

      // 주석 제거
      const cleanCode = code
        .split('\n')
        .filter(line => !line.trim().startsWith('#'))
        .join('\n');
      
      // 코드 실행
      const func = new Function('setWidget', 'getWidget', 'msgBox', 'console', 'alert', cleanCode);
      func(setWidget, getWidget, msgBox, customConsole, alert);
    } catch (error: any) {
      addConsoleLog('error', `Error: ${error.message}`);
    }
  }, [setWidgetProperty, getWidgetProperty, showMsgBox, addConsoleLog]);

  return {
    executeWidgetCode,
  };
};

