import React from 'react';
import { TOOLBOX_ITEMS } from '../constants';
import { WidgetType } from '../types/widget';

interface ToolboxProps {
  darkMode: boolean;
  onDragStart: (type: WidgetType) => void;
  formTitle: string;
  formSize: { width: number; height: number };
  gridEnabled: boolean;
  snapToGrid: boolean;
  onFormTitleChange: (title: string) => void;
  onFormSizeChange: (size: { width: number; height: number }) => void;
  onGridEnabledChange: (enabled: boolean) => void;
  onSnapToGridChange: (enabled: boolean) => void;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  darkMode,
  onDragStart,
  formTitle,
  formSize,
  gridEnabled,
  snapToGrid,
  onFormTitleChange,
  onFormSizeChange,
  onGridEnabledChange,
  onSnapToGridChange,
}) => {
  const toolboxBg = darkMode ? 'bg-gray-950' : 'bg-gray-800';
  const toolboxItemBg = darkMode ? 'bg-gray-800' : 'bg-gray-700';

  return (
    <div className={`w-48 ${toolboxBg} text-white p-4 overflow-y-auto`}>
      <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
        🧰 Toolbox
      </h3>
      <div className="space-y-2">
        {TOOLBOX_ITEMS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.type}
              draggable
              onDragStart={() => onDragStart(tool.type)}
              className={`flex items-center gap-2 p-2 ${toolboxItemBg} rounded cursor-move hover:bg-gray-600 transition`}
            >
              <Icon size={16} />
              <span className="text-sm">{tool.name}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-xs font-bold mb-2">Settings</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => onFormTitleChange(e.target.value)}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Width</label>
            <input
              type="number"
              value={formSize.width}
              onChange={(e) => onFormSizeChange({ ...formSize, width: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Height</label>
            <input
              type="number"
              value={formSize.height}
              onChange={(e) => onFormSizeChange({ ...formSize, height: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
            />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={(e) => onGridEnabledChange(e.target.checked)}
              id="gridEnabled"
            />
            <label htmlFor="gridEnabled" className="text-xs">Grid</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => onSnapToGridChange(e.target.checked)}
              id="snapToGrid"
            />
            <label htmlFor="snapToGrid" className="text-xs">Snap</label>
          </div>
        </div>
      </div>
    </div>
  );
};


