import { LucideIcon } from 'lucide-react';

export type WidgetType = 
  | 'label' 
  | 'button' 
  | 'textbox' 
  | 'textarea' 
  | 'checkbox' 
  | 'radio' 
  | 'listbox' 
  | 'combobox' 
  | 'slider' 
  | 'progressbar' 
  | 'frame';

export interface Widget {
  id: number;
  type: WidgetType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  borderWidth: number;
  borderColor: string;
  zIndex: number;
  eventCode: string;
  placeholder?: string;
  maxLength?: number;
  checked?: boolean;
  group?: string;
  items?: string[];
  selectedIndex?: number;
  min?: number;
  max?: number;
  value?: number;
  step?: number;
}

export interface ToolboxItem {
  type: WidgetType;
  icon: LucideIcon;
  name: string;
  color: string;
}

export interface Template {
  name: string;
  widgets: Omit<Widget, 'id' | 'zIndex' | 'eventCode'>[];
}

export interface CodeSnippet {
  name: string;
  code: string;
}

export interface ColorPreset {
  name: string;
  bg: string;
  text: string;
}

export interface RuntimeValue {
  text: string;
  value: string | number;
  checked: boolean;
}

export interface MsgBox {
  id: number;
  message: string;
  title: string;
  type: 'info' | 'warning' | 'error' | 'question';
}

export interface ConsoleLog {
  type: 'log' | 'error';
  message: string;
}

export interface Project {
  formTitle: string;
  formSize: { width: number; height: number };
  widgets: Widget[];
}


