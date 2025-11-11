import React, { useState, useRef, useEffect } from 'react';
import { 
  Code, Play, Trash2, Copy, Download, Grip, Save, FolderOpen, Undo, Redo, 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Layers, X, Moon, Sun, 
  Zap, FileText, Terminal, AlertCircle, Info, AlertTriangle, HelpCircle 
} from 'lucide-react';
import { Widget, WidgetType, Project } from '../types/widget';
import { TOOLBOX_ITEMS, TEMPLATES, CODE_SNIPPETS, COLOR_PRESETS, GRID_SIZE } from '../constants';
import { DEFAULT_FORM_TITLE, DEFAULT_FORM_SIZE, DEFAULT_GRID_ENABLED, DEFAULT_SNAP_TO_GRID } from '../constants/defaults';
import { snapToGrid as snapToGridUtil, createWidget, generatePythonCode, downloadFile } from '../utils/helpers';
import { getTemplateEventCode } from '../utils/templateEvents';
import { useHistory } from '../hooks/useHistory';
import { useRuntime } from '../hooks/useRuntime';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { Toolbox } from './Toolbox';
import { WidgetRenderer } from './WidgetRenderer';
import { CodeEditor } from './CodeEditor';

export default function VisualPythonIDE() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<WidgetType | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [formTitle, setFormTitle] = useState(DEFAULT_FORM_TITLE);
  const [formSize, setFormSize] = useState(DEFAULT_FORM_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isFormResizing, setIsFormResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, mouseY: 0, x: 0, y: 0, width: 0, height: 0 });
  const [formResizeStart, setFormResizeStart] = useState({ mouseX: 0, mouseY: 0, width: 0, height: 0 });
  const [gridEnabled, setGridEnabled] = useState(DEFAULT_GRID_ENABLED);
  const [snapToGrid, setSnapToGrid] = useState(DEFAULT_SNAP_TO_GRID);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [widgetCode, setWidgetCode] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { addToHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory();
  
  // 실행 모드 관련 훅
  const {
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
  } = useRuntime();

  /**
   * 그리드에 맞춰 값 스냅
   */
  const snapToGridFunc = (value: number) => {
    return snapToGridUtil(value, GRID_SIZE, snapToGrid);
  };

  const handleUndo = () => {
    const prevWidgets = undo();
    if (prevWidgets) {
      setWidgets(prevWidgets);
      setSelectedWidget(null);
    }
  };

  const handleRedo = () => {
    const nextWidgets = redo();
    if (nextWidgets) {
      setWidgets(nextWidgets);
      setSelectedWidget(null);
    }
  };

  // 인쇄 방지 전역 설정
  useEffect(() => {
    // window.print 오버라이드
    const originalPrint = window.print;
    window.print = () => {
      console.log('인쇄 시도가 차단되었습니다.');
      return;
    };

    // beforeprint 이벤트 차단
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    window.addEventListener('beforeprint', handleBeforePrint, true);
    
    return () => {
      window.print = originalPrint;
      window.removeEventListener('beforeprint', handleBeforePrint, true);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P (인쇄) 방지
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        return false;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === 'Delete' && selectedWidget && !showCodeEditor) {
        e.preventDefault();
        deleteWidget();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedWidget) {
        e.preventDefault();
        duplicateWidget();
      }
      if (e.key === 'Escape') {
        // 코드 편집기가 열려있을 때는 Monaco Editor가 처리하도록 함
        if (showCodeEditor) {
          // Monaco Editor의 Esc 키 커맨드가 먼저 실행되도록 함
          // 여기서는 아무것도 하지 않음
          return;
        } else {
          e.preventDefault();
          // Esc 키로 폼 선택
          setSelectedWidget(null);
        }
      }
      if (selectedWidget && !showCodeEditor && !isResizing) {
        const widget = widgets.find(w => w.id === selectedWidget);
        if (widget) {
          let moved = false;
          let newX = widget.x;
          let newY = widget.y;
          const step = e.shiftKey ? 10 : 1;
          
          if (e.key === 'ArrowLeft') { newX -= step; moved = true; e.preventDefault(); }
          if (e.key === 'ArrowRight') { newX += step; moved = true; e.preventDefault(); }
          if (e.key === 'ArrowUp') { newY -= step; moved = true; e.preventDefault(); }
          if (e.key === 'ArrowDown') { newY += step; moved = true; e.preventDefault(); }
          
          if (moved) {
            const newWidgets = widgets.map(w =>
              w.id === selectedWidget ? { ...w, x: Math.max(0, newX), y: Math.max(0, newY) } : w
            );
            setWidgets(newWidgets);
          }
        }
      }
    };

    // capture phase에서도 등록하여 브라우저 기본 동작을 더 확실하게 막음
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedWidget, widgets, showCodeEditor, isResizing]);

  // 전역 마우스 이벤트로 부드러운 리사이즈 및 드래그 지원
  useEffect(() => {
    if (!isDragging && !isResizing && !isFormResizing) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isFormResizing && resizeHandle && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const deltaX = mouseX - formResizeStart.mouseX;
        const deltaY = mouseY - formResizeStart.mouseY;
        
        let newWidth = formResizeStart.width;
        let newHeight = formResizeStart.height;
        
        switch(resizeHandle) {
          case 'nw':
            newWidth = Math.max(200, formResizeStart.width - deltaX);
            newHeight = Math.max(150, formResizeStart.height - deltaY);
            break;
          case 'n':
            newHeight = Math.max(150, formResizeStart.height - deltaY);
            break;
          case 'ne':
            newWidth = Math.max(200, formResizeStart.width + deltaX);
            newHeight = Math.max(150, formResizeStart.height - deltaY);
            break;
          case 'e':
            newWidth = Math.max(200, formResizeStart.width + deltaX);
            break;
          case 'se':
            newWidth = Math.max(200, formResizeStart.width + deltaX);
            newHeight = Math.max(150, formResizeStart.height + deltaY);
            break;
          case 's':
            newHeight = Math.max(150, formResizeStart.height + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(200, formResizeStart.width - deltaX);
            newHeight = Math.max(150, formResizeStart.height + deltaY);
            break;
          case 'w':
            newWidth = Math.max(200, formResizeStart.width - deltaX);
            break;
        }

        const snapToGridFunc = (val: number) => snapToGridUtil(val, GRID_SIZE, snapToGrid);
        newWidth = snapToGridFunc(newWidth);
        newHeight = snapToGridFunc(newHeight);

        setFormSize({ width: newWidth, height: newHeight });
      }

      if (isResizing && selectedWidget && resizeHandle && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const deltaX = mouseX - resizeStart.mouseX;
        const deltaY = mouseY - resizeStart.mouseY;
        
        let newX = resizeStart.x;
        let newY = resizeStart.y;
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        
        switch(resizeHandle) {
          case 'nw':
            newX = resizeStart.x + deltaX;
            newY = resizeStart.y + deltaY;
            newWidth = resizeStart.width - deltaX;
            newHeight = resizeStart.height - deltaY;
            break;
          case 'n':
            newY = resizeStart.y + deltaY;
            newHeight = resizeStart.height - deltaY;
            break;
          case 'ne':
            newY = resizeStart.y + deltaY;
            newWidth = resizeStart.width + deltaX;
            newHeight = resizeStart.height - deltaY;
            break;
          case 'e':
            newWidth = resizeStart.width + deltaX;
            break;
          case 'se':
            newWidth = resizeStart.width + deltaX;
            newHeight = resizeStart.height + deltaY;
            break;
          case 's':
            newHeight = resizeStart.height + deltaY;
            break;
          case 'sw':
            newX = resizeStart.x + deltaX;
            newWidth = resizeStart.width - deltaX;
            newHeight = resizeStart.height + deltaY;
            break;
          case 'w':
            newX = resizeStart.x + deltaX;
            newWidth = resizeStart.width - deltaX;
            break;
        }

        const snapToGridFunc = (val: number) => snapToGridUtil(val, GRID_SIZE, snapToGrid);
        newWidth = Math.max(20, snapToGridFunc(newWidth));
        newHeight = Math.max(20, snapToGridFunc(newHeight));
        newX = snapToGridFunc(newX);
        newY = snapToGridFunc(newY);

        const newWidgets = widgets.map(w =>
          w.id === selectedWidget ? { ...w, x: newX, y: newY, width: newWidth, height: newHeight } : w
        );
        setWidgets(newWidgets);
      }

      if (isDragging && selectedWidget && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const snapToGridFunc = (val: number) => snapToGridUtil(val, GRID_SIZE, snapToGrid);
        const newX = snapToGridFunc(Math.max(0, mouseX - dragOffset.x));
        const newY = snapToGridFunc(Math.max(0, mouseY - dragOffset.y));

        const newWidgets = widgets.map(w =>
          w.id === selectedWidget ? { ...w, x: newX, y: newY } : w
        );
        setWidgets(newWidgets);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging || isResizing || isFormResizing) {
        if (isFormResizing) {
          addToHistory(widgets);
        } else {
          addToHistory(widgets);
        }
      }
      setIsDragging(false);
      setIsResizing(false);
      setIsFormResizing(false);
      setResizeHandle(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, isFormResizing, selectedWidget, resizeHandle, formResizeStart, resizeStart, dragOffset, widgets, snapToGrid, addToHistory]);

  const handleDragStart = (type: WidgetType) => {
    setDraggedType(type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGridFunc(e.clientX - rect.left);
    const y = snapToGridFunc(e.clientY - rect.top);

    const newWidget = createWidget(draggedType, x, y, widgets);
    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    addToHistory(newWidgets);
    setDraggedType(null);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string, widgetId: number) => {
    e.stopPropagation();
    const widget = widgets.find(w => w.id === widgetId);
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedWidget(widgetId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setResizeStart({
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top,
      x: widget.x,
      y: widget.y,
      width: widget.width,
      height: widget.height,
    });
  };

  const handleFormResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsFormResizing(true);
    setResizeHandle(handle);
    setSelectedWidget(null); // 폼 선택 시 위젯 선택 해제
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setFormResizeStart({
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top,
        width: formSize.width,
        height: formSize.height,
      });
    }
  };

  const handleFormClick = (e: React.MouseEvent) => {
    // 위젯 클릭 핸들러에서 stopPropagation을 호출하므로,
    // 이 핸들러가 실행된다는 것은 위젯이 아닌 곳을 클릭했다는 의미입니다.
    
    const target = e.target as HTMLElement;
    
    // 리사이즈 핸들을 클릭한 경우 제외
    if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
      return;
    }
    
    // 폼 선택
    setSelectedWidget(null);
  };

  const handleWidgetClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      setSelectedWidget(id);
    }
  };

  const handleWidgetDoubleClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const widget = widgets.find(w => w.id === id);
    setEditingWidget(widget);
    
    const defaultCode = `# ${widget.text} 이벤트 핸들러
# 사용 가능한 함수:
# setWidget("위젯이름", "속성", 값)
# getWidget("위젯이름", "속성")
# msgBox("메시지", "제목", "타입")  # 타입: info, warning, error, question

print("${widget.text} clicked!")`;
    
    setWidgetCode(widget.eventCode || defaultCode);
    setShowCodeEditor(true);
  };

  const handleCodeEditorSave = (code?: string) => {
    if (editingWidget) {
      const codeToSave = code !== undefined ? code : widgetCode;
      console.log('저장 시도:', { 
        editingWidget: editingWidget.name, 
        codeProvided: code !== undefined,
        codeLength: codeToSave?.length || 0,
        codePreview: codeToSave?.substring(0, 50) || ''
      });
      
      // widgetCode 상태도 업데이트 (다음에 열 때를 위해)
      if (code !== undefined) {
        setWidgetCode(code);
      }
      
      const newWidgets = widgets.map(w =>
        w.id === editingWidget.id ? { ...w, eventCode: codeToSave } : w
      );
      setWidgets(newWidgets);
      addToHistory(newWidgets);
      addConsoleLog('log', `코드가 ${editingWidget.name}에 저장되었습니다`);
    }
    setShowCodeEditor(false);
    setEditingWidget(null);
  };

  const handleCodeEditorClose = () => {
    // 닫기 전에 자동 저장
    if (editingWidget) {
      const newWidgets = widgets.map(w =>
        w.id === editingWidget.id ? { ...w, eventCode: widgetCode } : w
      );
      setWidgets(newWidgets);
      addToHistory(newWidgets);
      addConsoleLog('log', `코드가 ${editingWidget.name}에 저장되었습니다`);
    }
    setShowCodeEditor(false);
    setEditingWidget(null);
  };

  const handleCodeEditorRun = () => {
    if (editingWidget && widgetCode) {
      executeWidgetCode(editingWidget, widgetCode);
    }
  };

  const handleWidgetMouseDown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isResizing) return;
    
    setSelectedWidget(id);
    setIsDragging(true);
    
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragOffset({
      x: e.clientX - rect.left - widget.x,
      y: e.clientY - rect.top - widget.y,
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // 위젯 클릭 핸들러에서 stopPropagation을 호출하므로,
    // 이 핸들러가 실행된다는 것은 위젯이 아닌 곳을 클릭했다는 의미입니다.
    
    const target = e.target as HTMLElement;
    
    // 리사이즈 핸들을 클릭한 경우 제외
    if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
      return;
    }
    
    // 위젯 영역을 클릭한 경우는 위젯 클릭 핸들러가 처리 (stopPropagation으로 차단됨)
    // 따라서 이 핸들러가 실행된다는 것은 위젯이 아닌 곳을 클릭했다는 의미
    // 폼 선택
    setSelectedWidget(null);
  };

  // handleMouseMove와 handleMouseUp은 전역 이벤트 핸들러로 이동했습니다.
  // 캔버스의 onMouseMove와 onMouseUp은 이제 필요 없지만,
  // 호환성을 위해 빈 함수로 유지합니다.
  const handleMouseMove = () => {
    // 전역 이벤트 핸들러로 처리됨
  };

  const handleMouseUp = () => {
    // 전역 이벤트 핸들러로 처리됨
  };

  const deleteWidget = () => {
    if (selectedWidget) {
      const newWidgets = widgets.filter(w => w.id !== selectedWidget);
      setWidgets(newWidgets);
      addToHistory(newWidgets);
      setSelectedWidget(null);
    }
  };

  const duplicateWidget = () => {
    if (selectedWidget) {
      const widget = widgets.find(w => w.id === selectedWidget);
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
        const newWidgets = [...widgets, newWidget];
        setWidgets(newWidgets);
        addToHistory(newWidgets);
        setSelectedWidget(newWidget.id);
      }
    }
  };

  const bringToFront = () => {
    if (selectedWidget) {
      const maxZ = Math.max(...widgets.map(w => w.zIndex || 0));
      const newWidgets = widgets.map(w =>
        w.id === selectedWidget ? { ...w, zIndex: maxZ + 1 } : w
      );
      setWidgets(newWidgets);
      addToHistory(newWidgets);
    }
  };

  const sendToBack = () => {
    if (selectedWidget) {
      const minZ = Math.min(...widgets.map(w => w.zIndex || 0));
      const newWidgets = widgets.map(w =>
        w.id === selectedWidget ? { ...w, zIndex: minZ - 1 } : w
      );
      setWidgets(newWidgets);
      addToHistory(newWidgets);
    }
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedWidget) {
      const newWidgets = widgets.map(w =>
        w.id === selectedWidget ? { ...w, [property]: value } : w
      );
      setWidgets(newWidgets);
    }
  };

  const handlePropertyBlur = () => {
    addToHistory(widgets);
  };

  const generateCode = () => {
    const code = generatePythonCode(formTitle, formSize, widgets);
    return code;
  };

  const downloadCode = () => {
    const code = generateCode();
    downloadFile(code, `${formTitle.replace(/\s+/g, '_')}.py`, 'text/plain');
  };


  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    const newWidgets: Widget[] = template.widgets.map((w, idx) => ({
      ...w,
      id: Date.now() + idx,
      zIndex: idx,
      eventCode: getTemplateEventCode(w.name, template.name),
    }));
    setWidgets(newWidgets);
    resetHistory(newWidgets);
    setShowTemplates(false);
    addConsoleLog('log', `템플릿 "${template.name}"이 로드되었습니다.`);
  };

  const handleSnippetClick = (snippet: typeof CODE_SNIPPETS[0]) => {
    if (editingWidget && showCodeEditor) {
      setWidgetCode(prev => prev + '\n\n' + snippet.code);
    }
    setShowSnippets(false);
  };

  const saveProject = () => {
    const project: Project = {
      formTitle,
      formSize,
      widgets,
    };
    const json = JSON.stringify(project, null, 2);
    downloadFile(json, `${formTitle.replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project: Project = JSON.parse(event.target.result as string);
        setFormTitle(project.formTitle);
        setFormSize(project.formSize);
        setWidgets(project.widgets);
        resetHistory(project.widgets);
        addConsoleLog('log', 'Project loaded successfully');
      } catch (error) {
        addConsoleLog('error', `Failed to load project: ${error.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const canvasBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-300';

  const selectedWidgetData = selectedWidget ? widgets.find(w => w.id === selectedWidget) : null;

  const sortedWidgets = [...widgets].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // 실행 모드 초기화
  const runApplication = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    initializeRuntime(widgets);
  };

  const stopApplication = () => {
    stopRuntime();
  };

  const setWidgetProperty = (widgetName: string, property: string, value: any) => {
    // runtimeValues 업데이트
    setRuntimeValues(prev => ({
      ...prev,
      [widgetName]: {
        ...prev[widgetName],
        [property]: value,
      }
    }));
    
    // 위젯의 특정 속성(items, selectedIndex 등)은 widgets 상태도 업데이트
    if (property === 'items' || property === 'selectedIndex') {
      setWidgets(prev => prev.map(w => {
        if (w.name === widgetName) {
          return { ...w, [property]: value };
        }
        return w;
      }));
    }
  };

  const getWidgetProperty = (widgetName: string, property: string) => {
    // items, selectedIndex 같은 위젯 속성은 widgets에서 가져오기
    if (property === 'items' || property === 'selectedIndex') {
      const widget = widgets.find(w => w.name === widgetName);
      if (widget) {
        if (property === 'items') {
          return widget.items || [];
        }
        if (property === 'selectedIndex') {
          return widget.selectedIndex !== undefined ? widget.selectedIndex : -1;
        }
      }
    }
    
    // 그 외는 runtimeValues에서 가져오기
    const value = runtimeValues[widgetName]?.[property];
    return value !== undefined ? value : '';
  };

  // 코드 실행 훅 (setWidgetProperty, getWidgetProperty 정의 이후에 호출)
  const { executeWidgetCode } = useCodeExecution({
    widgets,
    setWidgetProperty,
    getWidgetProperty,
    showMsgBox,
    addConsoleLog,
  });

  const handleRunWidget = (widget: Widget) => {
    if (widget.eventCode) {
      executeWidgetCode(widget, widget.eventCode);
    } else {
      addConsoleLog('log', `${widget.text} clicked (no event code)`);
    }
  };

  // 실행 모드 UI
  if (isRunning) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} items-center justify-center`}>
        {/* MsgBox 표시 */}
        {msgBoxQueue.map(msg => (
          <div key={msg.id} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md">
              <div className="flex items-start gap-4 mb-4">
                {msg.type === 'info' && <Info className="text-blue-500" size={32} />}
                {msg.type === 'warning' && <AlertTriangle className="text-yellow-500" size={32} />}
                {msg.type === 'error' && <AlertCircle className="text-red-500" size={32} />}
                {msg.type === 'question' && <HelpCircle className="text-purple-500" size={32} />}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{msg.title}</h3>
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => closeMsgBox(msg.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4 w-full max-w-7xl px-4">
          <div 
            className="bg-white relative shadow-2xl flex-shrink-0"
            style={{ width: formSize.width, height: formSize.height }}
          >
            <div className="absolute top-0 left-0 right-0 bg-blue-900 text-white px-2 py-1 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grip size={14} />
                {formTitle}
              </div>
              <button 
                onClick={stopApplication}
                className="hover:bg-red-600 px-2 rounded"
              >
                <X size={16} />
              </button>
            </div>
            
            {sortedWidgets.map((widget) => {
              const runtimeValue = runtimeValues[widget.name] || { text: widget.text, value: '', checked: false };
              
              return (
                <div
                  key={widget.id}
                  className="absolute"
                  style={{
                    left: widget.x,
                    top: widget.y,
                    width: widget.width,
                    height: widget.height,
                    zIndex: widget.zIndex || 0,
                  }}
                >
                  <WidgetRenderer
                    widget={widget}
                    runtimeValue={runtimeValue}
                    isDesignMode={false}
                    onEvent={(w) => handleRunWidget(w)}
                    onPropertyChange={setWidgetProperty}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex-1 bg-gray-900 rounded-lg shadow-xl flex flex-col max-h-[600px]">
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 rounded-t-lg border-b border-gray-700">
              <Terminal size={16} className="text-green-400" />
              <span className="text-sm text-white font-semibold">Console Output</span>
            </div>
            <div className="flex-1 p-3 font-mono text-sm overflow-y-auto">
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500 italic">콘솔이 비어있습니다...</div>
              ) : (
                consoleOutput.map((log, idx) => (
                  <div 
                    key={idx}
                    className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {log.type === 'error' ? '❌' : '▶'} {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${bgColor}`}>
      {/* 코드 에디터 모달 */}
      {showCodeEditor && (
        <CodeEditor
          widget={editingWidget}
          code={widgetCode}
          darkMode={darkMode}
          onCodeChange={setWidgetCode}
          onSave={handleCodeEditorSave}
          onClose={handleCodeEditorClose}
          onRun={handleCodeEditorRun}
        />
      )}

      {/* 템플릿 모달 */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-2/3 max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <h3 className="font-bold flex items-center gap-2">
                <FileText size={18} />
                프로젝트 템플릿
              </h3>
              <button onClick={() => setShowTemplates(false)} className="hover:bg-white/20 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 overflow-y-auto">
              {TEMPLATES.map((template, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTemplateClick(template)}
                  className="border-2 border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg cursor-pointer transition"
                >
                  <div className="font-semibold text-lg mb-2">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.widgets.length} widgets</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 스니펫 모달 */}
      {showSnippets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-2/3 max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <h3 className="font-bold flex items-center gap-2">
                <Zap size={18} />
                코드 스니펫
              </h3>
              <button onClick={() => setShowSnippets(false)} className="hover:bg-white/20 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto">
              {CODE_SNIPPETS.map((snippet, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSnippetClick(snippet)}
                  className="border-2 border-gray-300 rounded-lg p-3 hover:border-orange-500 hover:shadow-lg cursor-pointer transition"
                >
                  <div className="font-semibold mb-2">{snippet.name}</div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{snippet.code}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MsgBox 큐 */}
      {msgBoxQueue.map(msg => (
        <div key={msg.id} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md">
            <div className="flex items-start gap-4 mb-4">
              {msg.type === 'info' && <Info className="text-blue-500" size={32} />}
              {msg.type === 'warning' && <AlertTriangle className="text-yellow-500" size={32} />}
              {msg.type === 'error' && <AlertCircle className="text-red-500" size={32} />}
              {msg.type === 'question' && <HelpCircle className="text-purple-500" size={32} />}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{msg.title}</h3>
                <p className="text-gray-700">{msg.message}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => closeMsgBox(msg.id)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Toolbox */}
      <Toolbox
        darkMode={darkMode}
        onDragStart={handleDragStart}
        formTitle={formTitle}
        formSize={formSize}
        gridEnabled={gridEnabled}
        snapToGrid={snapToGrid}
        onFormTitleChange={setFormTitle}
        onFormSizeChange={setFormSize}
        onGridEnabledChange={setGridEnabled}
        onSnapToGridChange={setSnapToGrid}
      />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 툴바 */}
        <div className="bg-gray-700 text-white px-4 py-2 flex gap-2 items-center flex-wrap">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                e.nativeEvent.stopImmediatePropagation();
              }
              runApplication(e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-sm font-semibold"
          >
            <Play size={16} />
            실행
          </button>
          
          <div className="w-px h-6 bg-gray-500"></div>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTemplates(true);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 text-xs"
          >
            <FileText size={14} />
            템플릿
          </button>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDarkMode(!darkMode);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 text-xs"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          
          <div className="w-px h-6 bg-gray-500"></div>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedWidget(null);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              selectedWidget === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title="폼 선택 (Esc)"
          >
            <Grip size={14} />
            Form
          </button>
          
          <div className="w-px h-6 bg-gray-500"></div>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUndo();
            }}
            disabled={!canUndo}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-30 text-xs"
          >
            <Undo size={14} />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRedo();
            }}
            disabled={!canRedo}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-30 text-xs"
          >
            <Redo size={14} />
          </button>
          
          <div className="w-px h-6 bg-gray-500"></div>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowCode(!showCode);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-xs"
          >
            <Code size={14} />
            {showCode ? 'Designer' : 'Code'}
          </button>
          
          <label className="flex items-center gap-2 px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 text-xs cursor-pointer">
            <FolderOpen size={14} />
            Open
            <input type="file" accept=".json" onChange={loadProject} className="hidden" />
          </label>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              saveProject();
            }}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-700 text-xs"
          >
            <Save size={14} />
            Save
          </button>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              downloadCode();
            }}
            className="flex items-center gap-2 px-3 py-1 bg-cyan-600 rounded hover:bg-cyan-700 text-xs"
          >
            <Download size={14} />
            Export
          </button>
          
          <div className="flex-1"></div>
          
          <button 
            onClick={duplicateWidget}
            disabled={!selectedWidget}
            className="flex items-center gap-1 px-2 py-1 bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-30 text-xs"
          >
            <Copy size={14} />
          </button>
          <button 
            onClick={deleteWidget}
            disabled={!selectedWidget}
            className="flex items-center gap-1 px-2 py-1 bg-red-600 rounded hover:bg-red-700 disabled:opacity-30 text-xs"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* 캔버스 또는 코드 뷰 */}
        {showCode ? (
          <div className="flex-1 bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-auto">
            <pre>{generateCode()}</pre>
          </div>
        ) : (
          <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-300'} p-4 overflow-auto flex gap-4`}>
            <div
              ref={canvasRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseDown={handleCanvasMouseDown}
              className={`${canvasBg} relative border-2 ${selectedWidget === null ? 'ring-2 ring-blue-500' : borderColor} shadow-lg`}
              style={{ 
                width: formSize.width, 
                height: formSize.height,
                cursor: isDragging ? 'grabbing' : (isResizing || isFormResizing) ? 'nwse-resize' : 'default',
                backgroundImage: gridEnabled ? `
                  linear-gradient(to right, ${darkMode ? '#4b5563' : '#e5e7eb'} 1px, transparent 1px),
                  linear-gradient(to bottom, ${darkMode ? '#4b5563' : '#e5e7eb'} 1px, transparent 1px)
                ` : 'none',
                backgroundSize: gridEnabled ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto',
              }}
            >
              <div 
                className="absolute top-0 left-0 right-0 bg-blue-900 text-white px-2 py-1 text-sm flex items-center gap-2 cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWidget(null); // 폼 선택
                }}
              >
                <Grip size={14} />
                {formTitle}
              </div>

              {/* 폼 리사이즈 핸들 */}
              {selectedWidget === null && (
                <>
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'nw'); }} className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'n'); }} className="resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-ns-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'ne'); }} className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'e'); }} className="resize-handle absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ew-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'se'); }} className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 's'); }} className="resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-ns-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'sw'); }} className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize" style={{ zIndex: 1000 }} />
                  <div onMouseDown={(e) => { e.stopPropagation(); handleFormResizeStart(e, 'w'); }} className="resize-handle absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-ew-resize" style={{ zIndex: 1000 }} />
                </>
              )}
              
              {sortedWidgets.map((widget) => (
                <div
                  key={widget.id}
                  onMouseDown={(e) => {
                    // 리사이즈 핸들을 클릭한 경우는 제외
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
                      return;
                    }
                    // 위젯 컨테이너를 클릭한 경우 처리
                    // pointer-events-none이 적용된 내부 요소를 클릭해도 이벤트가 여기로 버블링됨
                    e.stopPropagation(); // 폼 클릭 이벤트 차단
                    handleWidgetMouseDown(widget.id, e);
                  }}
                  onClick={(e) => {
                    // 리사이즈 핸들을 클릭한 경우는 제외
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
                      return;
                    }
                    // 폼 클릭 이벤트 차단 - 가장 먼저 호출
                    e.stopPropagation();
                    e.preventDefault();
                    handleWidgetClick(widget.id, e);
                  }}
                  onDoubleClick={(e) => {
                    // 리사이즈 핸들을 클릭한 경우는 제외
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
                      return;
                    }
                    e.stopPropagation(); // 폼 클릭 이벤트 차단
                    handleWidgetDoubleClick(widget.id, e);
                  }}
                  className={`absolute select-none ${
                    selectedWidget === widget.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: widget.x,
                    top: widget.y,
                    width: widget.width,
                    height: widget.height,
                    cursor: 'move',
                    zIndex: (widget.zIndex || 0) + 200, // 위젯이 폼 배경 클릭 영역 위에 오도록
                    pointerEvents: 'auto', // 위젯 영역은 클릭 가능하도록
                  }}
                >
                  {/* 위젯 렌더링 - pointer-events-none으로 이벤트 차단 */}
                  <div className="w-full h-full pointer-events-none">
                    <WidgetRenderer
                      widget={widget}
                      isDesignMode={true}
                    />
                  </div>

                  {/* 리사이즈 핸들 */}
                  {selectedWidget === widget.id && (
                    <>
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'nw', widget.id); }} className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'n', widget.id); }} className="resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-ns-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'ne', widget.id); }} className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'e', widget.id); }} className="resize-handle absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ew-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'se', widget.id); }} className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 's', widget.id); }} className="resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-ns-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'sw', widget.id); }} className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize" style={{ zIndex: 1000 }} />
                      <div onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'w', widget.id); }} className="resize-handle absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-ew-resize" style={{ zIndex: 1000 }} />
                    </>
                  )}
                </div>
              ))}
              
              {/* 폼 배경 클릭 영역 - 위젯 뒤에 배치, 위젯이 없는 영역만 클릭 가능 */}
              <div
                className="absolute inset-0"
                style={{ 
                  zIndex: 0,
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  
                  // 리사이즈 핸들을 클릭한 경우 제외
                  if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
                    return;
                  }
                  
                  // 위젯 영역을 클릭한 경우는 위젯 클릭 핸들러가 처리 (stopPropagation으로 차단됨)
                  // 따라서 이 핸들러가 실행된다는 것은 위젯이 아닌 곳을 클릭했다는 의미
                  // 폼 선택
                  e.stopPropagation(); // 캔버스 mousedown과 중복 방지
                  setSelectedWidget(null);
                }}
              />
            </div>

            {/* 레이어 패널 */}
            {showLayerPanel && (
              <div className={`w-48 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 border-2 ${borderColor} shadow-lg rounded`}>
                <h4 className={`font-bold text-xs mb-2 flex items-center gap-2 ${textColor}`}>
                  <Layers size={14} />
                  Layers ({widgets.length})
                </h4>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {[...widgets].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)).map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWidget(w.id)}
                      className={`px-2 py-1 text-xs rounded cursor-pointer ${
                        selectedWidget === w.id 
                          ? 'bg-blue-500 text-white' 
                          : darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {w.name} ({w.type})
                    </div>
                  ))}
                </div>
                {selectedWidget && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <button onClick={bringToFront} className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">
                      Bring to Front
                    </button>
                    <button onClick={sendToBack} className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">
                      Send to Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 속성 패널 */}
      <div className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 border-l-2 overflow-y-auto ${textColor}`}>
        <h3 className="font-bold mb-4 text-sm">⚙️ Properties</h3>
        {selectedWidget === null ? (
          // 폼 속성 편집
          <div className="space-y-3">
            <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} px-2 py-1 rounded text-xs font-semibold`}>
              FORM
            </div>
            <div>
              <label className="text-xs font-semibold">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  addToHistory(widgets);
                }}
                className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50'}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">Width</label>
                <input
                  type="number"
                  value={formSize.width}
                  onChange={(e) => {
                    const newWidth = Math.max(200, parseInt(e.target.value) || 200);
                    setFormSize(prev => ({ ...prev, width: newWidth }));
                    addToHistory(widgets);
                  }}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Height</label>
                <input
                  type="number"
                  value={formSize.height}
                  onChange={(e) => {
                    const newHeight = Math.max(150, parseInt(e.target.value) || 150);
                    setFormSize(prev => ({ ...prev, height: newHeight }));
                    addToHistory(widgets);
                  }}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Background Color</label>
              <input
                type="color"
                value={darkMode ? '#1f2937' : '#e5e7eb'}
                disabled
                className="w-full h-8 border rounded cursor-not-allowed opacity-50"
                title="폼 배경색은 다크모드 설정에 따라 자동으로 변경됩니다"
              />
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                💡 폼을 클릭하여 선택하고, 모서리 핸들을 드래그하여 크기를 변경할 수 있습니다.
              </p>
            </div>
          </div>
        ) : selectedWidgetData ? (
          <div className="space-y-3">
            <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} px-2 py-1 rounded text-xs font-semibold`}>
              {selectedWidgetData.type.toUpperCase()}
            </div>
            <div>
              <label className="text-xs font-semibold">Widget Name</label>
              <input
                type="text"
                value={selectedWidgetData.name}
                onChange={(e) => handlePropertyChange('name', e.target.value)}
                onBlur={handlePropertyBlur}
                className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50'}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Display Text</label>
              <input
                type="text"
                value={selectedWidgetData.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                onBlur={handlePropertyBlur}
                className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">X</label>
                <input
                  type="number"
                  value={Math.round(selectedWidgetData.x)}
                  onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                  onBlur={handlePropertyBlur}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedWidgetData.y)}
                  onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                  onBlur={handlePropertyBlur}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">Width</label>
                <input
                  type="number"
                  value={selectedWidgetData.width}
                  onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                  onBlur={handlePropertyBlur}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Height</label>
                <input
                  type="number"
                  value={selectedWidgetData.height}
                  onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                  onBlur={handlePropertyBlur}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Background</label>
              <input
                type="color"
                value={selectedWidgetData.bgColor}
                onChange={(e) => handlePropertyChange('bgColor', e.target.value)}
                onBlur={handlePropertyBlur}
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Text Color</label>
              <input
                type="color"
                value={selectedWidgetData.textColor}
                onChange={(e) => handlePropertyChange('textColor', e.target.value)}
                onBlur={handlePropertyBlur}
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold">Font Size</label>
              <input
                type="number"
                value={selectedWidgetData.fontSize || 12}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                onBlur={handlePropertyBlur}
                className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handlePropertyChange('fontWeight', selectedWidgetData.fontWeight === 'bold' ? 'normal' : 'bold');
                  handlePropertyBlur();
                }}
                className={`flex-1 px-2 py-1 rounded text-xs ${
                  selectedWidgetData.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}
              >
                <Bold size={14} className="mx-auto" />
              </button>
              <button
                onClick={() => {
                  handlePropertyChange('fontStyle', selectedWidgetData.fontStyle === 'italic' ? 'normal' : 'italic');
                  handlePropertyBlur();
                }}
                className={`flex-1 px-2 py-1 rounded text-xs ${
                  selectedWidgetData.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}
              >
                <Italic size={14} className="mx-auto" />
              </button>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold mb-1 block">Text Align</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handlePropertyChange('textAlign', 'left');
                    handlePropertyBlur();
                  }}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    selectedWidgetData.textAlign === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
                  title="왼쪽 정렬"
                >
                  <AlignLeft size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => {
                    handlePropertyChange('textAlign', 'center');
                    handlePropertyBlur();
                  }}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    selectedWidgetData.textAlign === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
                  title="가운데 정렬"
                >
                  <AlignCenter size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => {
                    handlePropertyChange('textAlign', 'right');
                    handlePropertyBlur();
                  }}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    selectedWidgetData.textAlign === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
                  title="오른쪽 정렬"
                >
                  <AlignRight size={14} className="mx-auto" />
                </button>
              </div>
            </div>

            {(selectedWidgetData.type === 'textbox' || selectedWidgetData.type === 'textarea') && (
              <>
                <div className="pt-2 border-t">
                  <label className="text-xs font-semibold">Placeholder</label>
                  <input
                    type="text"
                    value={selectedWidgetData.placeholder || ''}
                    onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Max Length</label>
                  <input
                    type="number"
                    value={selectedWidgetData.maxLength || 100}
                    onChange={(e) => handlePropertyChange('maxLength', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
              </>
            )}

            {selectedWidgetData.type === 'checkbox' && (
              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedWidgetData.checked || false}
                    onChange={(e) => {
                      handlePropertyChange('checked', e.target.checked);
                      handlePropertyBlur();
                    }}
                  />
                  <span className="font-semibold">Checked by default</span>
                </label>
              </div>
            )}

            {selectedWidgetData.type === 'radio' && (
              <>
                <div className="pt-2 border-t">
                  <label className="text-xs font-semibold">Radio Group</label>
                  <input
                    type="text"
                    value={selectedWidgetData.group || 'group1'}
                    onChange={(e) => handlePropertyChange('group', e.target.value)}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedWidgetData.checked || false}
                      onChange={(e) => {
                        handlePropertyChange('checked', e.target.checked);
                        handlePropertyBlur();
                      }}
                    />
                    <span className="font-semibold">Selected by default</span>
                  </label>
                </div>
              </>
            )}

            {selectedWidgetData.type === 'slider' && (
              <>
                <div className="pt-2 border-t">
                  <label className="text-xs font-semibold">Min Value</label>
                  <input
                    type="number"
                    value={selectedWidgetData.min || 0}
                    onChange={(e) => handlePropertyChange('min', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Max Value</label>
                  <input
                    type="number"
                    value={selectedWidgetData.max || 100}
                    onChange={(e) => handlePropertyChange('max', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Default Value</label>
                  <input
                    type="number"
                    value={selectedWidgetData.value || 50}
                    onChange={(e) => handlePropertyChange('value', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Step</label>
                  <input
                    type="number"
                    value={selectedWidgetData.step || 1}
                    onChange={(e) => handlePropertyChange('step', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
              </>
            )}

            {selectedWidgetData.type === 'progressbar' && (
              <>
                <div className="pt-2 border-t">
                  <label className="text-xs font-semibold">Min Value</label>
                  <input
                    type="number"
                    value={selectedWidgetData.min || 0}
                    onChange={(e) => handlePropertyChange('min', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Max Value</label>
                  <input
                    type="number"
                    value={selectedWidgetData.max || 100}
                    onChange={(e) => handlePropertyChange('max', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Current Value</label>
                  <input
                    type="number"
                    value={selectedWidgetData.value || 0}
                    onChange={(e) => handlePropertyChange('value', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
              </>
            )}

            {(selectedWidgetData.type === 'listbox' || selectedWidgetData.type === 'combobox') && (
              <div className="pt-2 border-t">
                <label className="text-xs font-semibold">Items (한 줄에 하나씩)</label>
                <textarea
                  value={(selectedWidgetData.items || []).join('\n')}
                  onChange={(e) => handlePropertyChange('items', e.target.value.split('\n').filter(s => s.trim()))}
                  onBlur={handlePropertyBlur}
                  rows={5}
                  className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            )}

            {selectedWidgetData.type === 'frame' && (
              <>
                <div className="pt-2 border-t">
                  <label className="text-xs font-semibold">Border Width</label>
                  <input
                    type="number"
                    value={selectedWidgetData.borderWidth || 0}
                    onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value))}
                    onBlur={handlePropertyBlur}
                    className={`w-full px-2 py-1 border text-sm rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Border Color</label>
                  <input
                    type="color"
                    value={selectedWidgetData.borderColor || '#d1d5db'}
                    onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                    onBlur={handlePropertyBlur}
                    className="w-full h-8 border rounded cursor-pointer"
                  />
                </div>
              </>
            )}

            <div className="pt-2 border-t">
              <label className="text-xs font-semibold">Color Presets</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {COLOR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handlePropertyChange('bgColor', preset.bg);
                      handlePropertyChange('textColor', preset.text);
                      handlePropertyBlur();
                    }}
                    className="h-8 rounded border-2 border-gray-300 hover:border-blue-500"
                    style={{ backgroundColor: preset.bg }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center mt-8">
            <p>위젯을 선택하세요</p>
            <p className="text-xs mt-2">툴박스에서 드래그하거나<br/>캔버스의 위젯을 클릭</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <div className="text-xs space-y-1">
            <p className="font-semibold mb-2">🎮 단축키</p>
            <p>• Ctrl+Z: Undo</p>
            <p>• Ctrl+Y: Redo</p>
            <p>• Del: 삭제</p>
            <p>• Ctrl+D: 복제</p>
            <p>• 화살표: 이동 (1px)</p>
            <p>• Shift+화살표: 빠른 이동 (10px)</p>
            <p>• 핸들 드래그: 크기 조절</p>
          </div>
        </div>
      </div>
    </div>
  );
}
