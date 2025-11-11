import React from 'react';
import { Widget, RuntimeValue } from '../types/widget';

interface WidgetRendererProps {
  widget: Widget;
  runtimeValue?: RuntimeValue;
  isDesignMode: boolean;
  onEvent?: (widget: Widget) => void;
  onPropertyChange?: (widgetName: string, property: string, value: any) => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  runtimeValue,
  isDesignMode,
  onEvent,
  onPropertyChange,
}) => {
  const defaultRuntimeValue: RuntimeValue = runtimeValue || {
    text: widget.text,
    value: widget.type === 'slider' ? (widget.value || 50) : widget.type === 'progressbar' ? (widget.value || 0) : '',
    checked: widget.checked || false,
  };

  const baseStyle = {
    backgroundColor: widget.bgColor,
    color: widget.textColor,
    fontSize: widget.fontSize,
    fontWeight: widget.fontWeight,
    fontStyle: widget.fontStyle,
    textAlign: widget.textAlign,
  };

  if (widget.type === 'label') {
    return (
      <div 
        className="px-2 py-1 text-sm flex items-center h-full"
        style={baseStyle}
      >
        {defaultRuntimeValue.text}
      </div>
    );
  }

  if (widget.type === 'button') {
    return (
      <button 
        onClick={() => !isDesignMode && onEvent?.(widget)}
        className={`w-full h-full border-2 border-gray-400 shadow-sm hover:brightness-95 ${isDesignMode ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={baseStyle}
        disabled={isDesignMode}
      >
        {defaultRuntimeValue.text}
      </button>
    );
  }

  if (widget.type === 'textbox') {
    return (
      <input
        type="text"
        value={defaultRuntimeValue.value as string}
        onChange={(e) => !isDesignMode && onPropertyChange?.(widget.name, 'value', e.target.value)}
        className={`w-full h-full border-2 border-gray-400 px-2 ${isDesignMode ? 'pointer-events-none' : ''}`}
        placeholder={widget.placeholder || widget.text}
        maxLength={widget.maxLength || 100}
        style={baseStyle}
        disabled={isDesignMode}
      />
    );
  }

  if (widget.type === 'textarea') {
    return (
      <textarea
        value={defaultRuntimeValue.value as string}
        onChange={(e) => !isDesignMode && onPropertyChange?.(widget.name, 'value', e.target.value)}
        className={`w-full h-full border-2 border-gray-400 p-2 resize-none ${isDesignMode ? 'pointer-events-none' : ''}`}
        placeholder={widget.placeholder || widget.text}
        maxLength={widget.maxLength || 500}
        style={baseStyle}
        disabled={isDesignMode}
      />
    );
  }

  if (widget.type === 'checkbox') {
    return (
      <label 
        className={`flex items-center gap-2 px-2 h-full ${isDesignMode ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={baseStyle}
      >
        <input 
          type="checkbox" 
          checked={defaultRuntimeValue.checked}
          onChange={(e) => !isDesignMode && onPropertyChange?.(widget.name, 'checked', e.target.checked)}
          disabled={isDesignMode}
        />
        {defaultRuntimeValue.text}
      </label>
    );
  }

  if (widget.type === 'radio') {
    return (
      <label 
        className={`flex items-center gap-2 px-2 h-full ${isDesignMode ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={baseStyle}
      >
        <input 
          type="radio" 
          name={widget.group || 'radioGroup'} 
          checked={defaultRuntimeValue.checked}
          disabled={isDesignMode}
        />
        {defaultRuntimeValue.text}
      </label>
    );
  }

  if (widget.type === 'slider') {
    return (
      <input
        type="range"
        min={widget.min || 0}
        max={widget.max || 100}
        step={widget.step || 1}
        value={defaultRuntimeValue.value as number}
        onChange={(e) => !isDesignMode && onPropertyChange?.(widget.name, 'value', parseInt(e.target.value))}
        className={`w-full h-full ${isDesignMode ? 'pointer-events-none' : 'cursor-pointer'}`}
        disabled={isDesignMode}
      />
    );
  }

  if (widget.type === 'progressbar') {
    const percentage = Math.min(100, Math.max(0, 
      ((defaultRuntimeValue.value as number - (widget.min || 0)) / ((widget.max || 100) - (widget.min || 0))) * 100
    ));
    return (
      <div className="w-full h-full bg-gray-200 rounded overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }

  if (widget.type === 'listbox') {
    return (
      <select 
        multiple 
        className={`w-full h-full border-2 border-gray-400 p-1 ${isDesignMode ? 'pointer-events-none' : ''}`}
        style={baseStyle}
        disabled={isDesignMode}
      >
        {(widget.items || ['Item 1', 'Item 2', 'Item 3']).map((item, idx) => (
          <option key={idx}>{item}</option>
        ))}
      </select>
    );
  }

  if (widget.type === 'combobox') {
    return (
      <select 
        className={`w-full h-full border-2 border-gray-400 px-2 ${isDesignMode ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={baseStyle}
        disabled={isDesignMode}
      >
        {(widget.items || ['Option 1', 'Option 2', 'Option 3']).map((item, idx) => (
          <option key={idx}>{item}</option>
        ))}
      </select>
    );
  }

  if (widget.type === 'frame') {
    return (
      <div 
        className="w-full h-full"
        style={{ 
          backgroundColor: widget.bgColor,
          border: `${widget.borderWidth}px solid ${widget.borderColor}`,
        }}
      />
    );
  }

  return null;
};


