import { useState, useCallback } from 'react';
import { Widget } from '../types/widget';

export const useHistory = () => {
  const [history, setHistory] = useState<Widget[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newWidgets: Widget[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newWidgets)));
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback((): Widget[] | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return JSON.parse(JSON.stringify(history[newIndex]));
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback((): Widget[] | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return JSON.parse(JSON.stringify(history[newIndex]));
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory: (widgets: Widget[]) => {
      setHistory([widgets]);
      setHistoryIndex(0);
    }
  };
};


