import { 
  Type, 
  Square, 
  CheckSquare, 
  List, 
  ChevronDown, 
  AlignLeft, 
  Layout, 
  Minus, 
  Radio 
} from 'lucide-react';
import { ToolboxItem, Template, CodeSnippet, ColorPreset } from '../types/widget';

export const TOOLBOX_ITEMS: ToolboxItem[] = [
  { type: 'label', icon: Type, name: 'Label', color: 'bg-gray-200' },
  { type: 'button', icon: Square, name: 'Button', color: 'bg-blue-200' },
  { type: 'textbox', icon: Square, name: 'TextBox', color: 'bg-white border-2' },
  { type: 'checkbox', icon: CheckSquare, name: 'CheckBox', color: 'bg-gray-100' },
  { type: 'radio', icon: Radio, name: 'RadioButton', color: 'bg-gray-100' },
  { type: 'listbox', icon: List, name: 'ListBox', color: 'bg-white border-2' },
  { type: 'combobox', icon: ChevronDown, name: 'ComboBox', color: 'bg-white border-2' },
  { type: 'textarea', icon: AlignLeft, name: 'TextArea', color: 'bg-white border-2' },
  { type: 'slider', icon: Minus, name: 'Slider', color: 'bg-gray-100' },
  { type: 'progressbar', icon: Minus, name: 'ProgressBar', color: 'bg-green-200' },
  { type: 'frame', icon: Layout, name: 'Frame', color: 'bg-gray-50 border-2' },
];

export const TEMPLATES: Template[] = [
  {
    name: '로그인 폼',
    widgets: [
      { type: 'label', name: 'lblTitle', x: 200, y: 50, width: 200, height: 40, text: '로그인', fontSize: 24, fontWeight: 'bold', fontStyle: 'normal', textAlign: 'center', bgColor: '#f0f0f0', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'label', name: 'lblUsername', x: 150, y: 120, width: 80, height: 30, text: '아이디:', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', bgColor: '#f0f0f0', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'textbox', name: 'txtUsername', x: 240, y: 120, width: 200, height: 30, text: '', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', bgColor: '#ffffff', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db', placeholder: '아이디를 입력하세요', maxLength: 100 },
      { type: 'label', name: 'lblPassword', x: 150, y: 170, width: 80, height: 30, text: '비밀번호:', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', bgColor: '#f0f0f0', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'textbox', name: 'txtPassword', x: 240, y: 170, width: 200, height: 30, text: '', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', bgColor: '#ffffff', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db', placeholder: '비밀번호를 입력하세요', maxLength: 100 },
      { type: 'button', name: 'btnLogin', x: 240, y: 230, width: 200, height: 40, text: '로그인', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
    ]
  },
  {
    name: '계산기',
    widgets: [
      { type: 'textbox', name: 'txtDisplay', x: 150, y: 50, width: 300, height: 50, text: '0', fontSize: 24, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'right', bgColor: '#ffffff', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db', placeholder: '', maxLength: 100 },
      { type: 'button', name: 'btn7', x: 150, y: 120, width: 70, height: 60, text: '7', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn8', x: 230, y: 120, width: 70, height: 60, text: '8', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn9', x: 310, y: 120, width: 70, height: 60, text: '9', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btnPlus', x: 390, y: 120, width: 60, height: 60, text: '+', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#fb923c', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn4', x: 150, y: 190, width: 70, height: 60, text: '4', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn5', x: 230, y: 190, width: 70, height: 60, text: '5', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn6', x: 310, y: 190, width: 70, height: 60, text: '6', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btnMinus', x: 390, y: 190, width: 60, height: 60, text: '-', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#fb923c', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn1', x: 150, y: 260, width: 70, height: 60, text: '1', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn2', x: 230, y: 260, width: 70, height: 60, text: '2', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn3', x: 310, y: 260, width: 70, height: 60, text: '3', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btnMultiply', x: 390, y: 260, width: 60, height: 60, text: '*', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#fb923c', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btn0', x: 150, y: 330, width: 150, height: 60, text: '0', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#3b82f6', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btnEquals', x: 310, y: 330, width: 70, height: 60, text: '=', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#10b981', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btnDivide', x: 390, y: 330, width: 60, height: 60, text: '/', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#fb923c', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'button', name: 'btnClear', x: 150, y: 400, width: 300, height: 40, text: 'Clear', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#ef4444', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
    ]
  },
  {
    name: 'To-Do 리스트',
    widgets: [
      { type: 'label', name: 'lblTitle', x: 200, y: 40, width: 200, height: 35, text: 'My Tasks', fontSize: 20, fontWeight: 'bold', fontStyle: 'normal', textAlign: 'center', bgColor: '#f0f0f0', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'textbox', name: 'txtTask', x: 50, y: 100, width: 400, height: 35, text: '', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', bgColor: '#ffffff', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db', placeholder: '할 일을 입력하세요', maxLength: 100 },
      { type: 'button', name: 'btnAdd', x: 460, y: 100, width: 90, height: 35, text: '추가', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#10b981', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
      { type: 'listbox', name: 'lstTasks', x: 50, y: 150, width: 500, height: 200, text: '', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', bgColor: '#ffffff', textColor: '#000000', borderWidth: 0, borderColor: '#d1d5db', items: [] },
      { type: 'button', name: 'btnDelete', x: 50, y: 360, width: 120, height: 35, text: '삭제', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', bgColor: '#ef4444', textColor: '#ffffff', borderWidth: 0, borderColor: '#d1d5db' },
    ]
  }
];

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    name: '텍스트 변경',
    code: 'setWidget("label1", "text", "새로운 텍스트")'
  },
  {
    name: '입력값 가져오기',
    code: 'value = getWidget("textbox1", "value")\nsetWidget("label1", "text", value)'
  },
  {
    name: 'MsgBox 사용',
    code: 'msgBox("안녕하세요!", "인사", "info")\n# 타입: info, warning, error, question'
  },
  {
    name: '카운터',
    code: 'current = getWidget("label1", "text")\ncount = int(current) if current.isdigit() else 0\nsetWidget("label1", "text", str(count + 1))'
  },
  {
    name: '계산기',
    code: 'num1 = float(getWidget("textbox1", "value"))\nnum2 = float(getWidget("textbox2", "value"))\nresult = num1 + num2\nsetWidget("label1", "text", str(result))'
  },
  {
    name: 'ProgressBar 업데이트',
    code: 'current = getWidget("progressbar1", "value")\nnew_value = min(100, current + 10)\nsetWidget("progressbar1", "value", new_value)'
  }
];

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Blue', bg: '#3b82f6', text: '#ffffff' },
  { name: 'Green', bg: '#10b981', text: '#ffffff' },
  { name: 'Red', bg: '#ef4444', text: '#ffffff' },
  { name: 'Purple', bg: '#8b5cf6', text: '#ffffff' },
  { name: 'Orange', bg: '#f97316', text: '#ffffff' },
  { name: 'Gray', bg: '#6b7280', text: '#ffffff' },
];

export const GRID_SIZE = 10;

export const WIDGET_DEFAULTS = {
  button: { width: 80, height: 30 },
  textbox: { width: 120, height: 30, placeholder: '', maxLength: 100 },
  textarea: { width: 200, height: 100, placeholder: '', maxLength: 500 },
  listbox: { width: 100, height: 80, items: ['Item 1', 'Item 2', 'Item 3'] },
  combobox: { width: 120, height: 30, items: ['Option 1', 'Option 2', 'Option 3'], selectedIndex: 0 },
  label: { width: 60, height: 30 },
  checkbox: { width: 100, height: 25, checked: false },
  radio: { width: 100, height: 25, checked: false, group: 'group1' },
  frame: { width: 200, height: 150 },
  slider: { width: 200, height: 30, min: 0, max: 100, value: 50, step: 1 },
  progressbar: { width: 200, height: 25, min: 0, max: 100, value: 0 },
};


