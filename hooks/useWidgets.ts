import { useState, useCallback } from 'react';
import { Widget } from '../types/widget';

export const useWidgets = (initialWidgets: Widget[] = []) => {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [selectedWidget, setSelectedWidget] = useState<number | null>(null);

  const addWidget = useCallback((widget: Widget) => {
    setWidgets(prev => [...prev, widget]);
  }, []);

  const updateWidget = useCallback((id: number, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const deleteWidget = useCallback((id: number) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setSelectedWidget(null);
  }, []);

  const duplicateWidget = useCallback((id: number) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      const newWidget: Widget = {
        ...widget,
        id: Date.now(),
        x: widget.x + 20,
        y: widget.y + 20,
        name: widget.name + '_copy',
        text: widget.text + '_copy',
        zIndex: widgets.length,
      };
      addWidget(newWidget);
    }
  }, [widgets, addWidget]);

  const bringToFront = useCallback((id: number) => {
    const maxZ = Math.max(...widgets.map(w => w.zIndex || 0));
    updateWidget(id, { zIndex: maxZ + 1 });
  }, [widgets, updateWidget]);

  const sendToBack = useCallback((id: number) => {
    const minZ = Math.min(...widgets.map(w => w.zIndex || 0));
    updateWidget(id, { zIndex: minZ - 1 });
  }, [widgets, updateWidget]);

  return {
    widgets,
    selectedWidget,
    setSelectedWidget,
    addWidget,
    updateWidget,
    deleteWidget,
    duplicateWidget,
    bringToFront,
    sendToBack,
    setWidgets,
  };
};

