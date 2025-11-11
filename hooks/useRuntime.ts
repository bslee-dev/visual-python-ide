import { useState, useCallback } from 'react';
import { Widget, RuntimeValue, MsgBox, ConsoleLog } from '../types/widget';

/**
 * 실행 모드 관련 상태 및 로직을 관리하는 커스텀 훅
 */
export const useRuntime = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [runtimeValues, setRuntimeValues] = useState<Record<string, RuntimeValue>>({});
  const [consoleOutput, setConsoleOutput] = useState<ConsoleLog[]>([]);
  const [msgBoxQueue, setMsgBoxQueue] = useState<MsgBox[]>([]);

  const initializeRuntime = useCallback((widgets: Widget[]) => {
    const initialValues: Record<string, RuntimeValue> = {};
    widgets.forEach(w => {
      initialValues[w.name] = {
        text: w.text,
        value: w.type === 'slider' ? (w.value || 50) : w.type === 'progressbar' ? (w.value || 0) : '',
        checked: w.checked || false,
      };
    });
    setRuntimeValues(initialValues);
    setConsoleOutput([]);
    setMsgBoxQueue([]);
    setIsRunning(true);
  }, []);

  const stopRuntime = useCallback(() => {
    setIsRunning(false);
    setRuntimeValues({});
    setMsgBoxQueue([]);
  }, []);

  const addConsoleLog = useCallback((type: 'log' | 'error', message: string) => {
    setConsoleOutput(prev => [...prev, { type, message }]);
  }, []);

  const closeMsgBox = useCallback((id: number) => {
    setMsgBoxQueue(prev => prev.filter(m => m.id !== id));
  }, []);

  const showMsgBox = useCallback((message: string, title: string, type: 'info' | 'warning' | 'error' | 'question' = 'info') => {
    const newMsgBox: MsgBox = {
      id: Date.now(),
      message,
      title,
      type,
    };
    setMsgBoxQueue(prev => [...prev, newMsgBox]);
  }, []);

  return {
    isRunning,
    runtimeValues,
    consoleOutput,
    msgBoxQueue,
    initializeRuntime,
    stopRuntime,
    addConsoleLog,
    closeMsgBox,
    showMsgBox,
    setRuntimeValues,
    setConsoleOutput,
    setMsgBoxQueue,
  };
};

