# 리팩토링 제안

이 문서는 프로젝트의 코드 품질 향상을 위한 리팩토링 제안을 담고 있습니다.

## 현재 상태

프로젝트는 이미 잘 구조화되어 있습니다:
- ✅ 컴포넌트 분리 (Toolbox, WidgetRenderer, CodeEditor)
- ✅ 커스텀 훅 분리 (useHistory, useWidgets)
- ✅ 타입 정의 분리
- ✅ 유틸리티 함수 분리
- ✅ 상수 데이터 분리

## 개선 제안

### 1. 속성 패널 컴포넌트 분리 (우선순위: 중)

**현재 상태**: `VisualPythonIDE.tsx`에 약 300줄의 속성 패널 코드가 포함되어 있음

**제안**: `components/PropertiesPanel.tsx`로 분리

**이점**:
- 메인 컴포넌트의 가독성 향상
- 속성 패널 로직의 재사용성 증가
- 테스트 용이성 향상

**구현 예시**:
```typescript
// components/PropertiesPanel.tsx
interface PropertiesPanelProps {
  widget: Widget | null;
  darkMode: boolean;
  onPropertyChange: (prop: string, value: any) => void;
  onPropertyBlur: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  widget,
  darkMode,
  onPropertyChange,
  onPropertyBlur,
}) => {
  // 속성 패널 렌더링 로직
};
```

### 2. 코드 실행 로직 분리 (우선순위: 중)

**현재 상태**: `executeWidgetCode` 함수가 `VisualPythonIDE.tsx`에 포함되어 있음

**제안**: `utils/codeExecutor.ts`로 분리

**이점**:
- 코드 실행 로직의 독립성 확보
- 단위 테스트 작성 용이
- 다른 컴포넌트에서 재사용 가능

**구현 예시**:
```typescript
// utils/codeExecutor.ts
export interface CodeExecutorContext {
  setWidget: (name: string, prop: string, value: any) => void;
  getWidget: (name: string, prop: string) => any;
  msgBox: (message: string, title?: string, type?: string) => void;
  console: { log: (...args: any[]) => void; error: (...args: any[]) => void };
}

export const executeCode = (
  code: string,
  context: CodeExecutorContext
): void => {
  // 코드 실행 로직
};
```

### 3. 런타임 상태 관리 훅 (우선순위: 낮)

**현재 상태**: 런타임 관련 상태가 `VisualPythonIDE.tsx`에 분산되어 있음

**제안**: `hooks/useRuntime.ts`로 분리

**이점**:
- 런타임 상태 관리의 일관성
- 상태 로직의 재사용성
- 메인 컴포넌트의 복잡도 감소

**구현 예시**:
```typescript
// hooks/useRuntime.ts
export const useRuntime = () => {
  const [runtimeValues, setRuntimeValues] = useState<Record<string, RuntimeValue>>({});
  const [consoleOutput, setConsoleOutput] = useState<ConsoleLog[]>([]);
  const [msgBoxQueue, setMsgBoxQueue] = useState<MsgBox[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runApplication = (widgets: Widget[]) => { /* ... */ };
  const stopApplication = () => { /* ... */ };
  const addConsoleLog = (type: 'log' | 'error', message: string) => { /* ... */ };

  return {
    runtimeValues,
    consoleOutput,
    msgBoxQueue,
    isRunning,
    runApplication,
    stopApplication,
    addConsoleLog,
    // ...
  };
};
```

### 4. 상수 파일 분리 (우선순위: 낮)

**현재 상태**: 모든 상수가 `constants/index.ts`에 포함되어 있음

**제안**: 기능별로 파일 분리

**구조 예시**:
```
constants/
├── index.ts          # 재export
├── toolbox.ts        # TOOLBOX_ITEMS
├── templates.ts      # TEMPLATES
├── snippets.ts       # CODE_SNIPPETS
├── colors.ts         # COLOR_PRESETS
└── defaults.ts       # WIDGET_DEFAULTS, GRID_SIZE
```

### 5. 이벤트 핸들러 분리 (우선순위: 낮)

**현재 상태**: 많은 이벤트 핸들러가 `VisualPythonIDE.tsx`에 포함되어 있음

**제안**: 관련된 이벤트 핸들러를 커스텀 훅으로 그룹화

**예시**:
```typescript
// hooks/useWidgetInteraction.ts
export const useWidgetInteraction = (
  widgets: Widget[],
  selectedWidget: number | null,
  // ...
) => {
  const handleWidgetClick = (id: number, e: React.MouseEvent) => { /* ... */ };
  const handleWidgetDoubleClick = (id: number, e: React.MouseEvent) => { /* ... */ };
  const handleWidgetMouseDown = (id: number, e: React.MouseEvent) => { /* ... */ };
  
  return {
    handleWidgetClick,
    handleWidgetDoubleClick,
    handleWidgetMouseDown,
  };
};
```

## 리팩토링 우선순위

1. **속성 패널 컴포넌트 분리** - 가장 큰 코드 블록, 명확한 경계
2. **코드 실행 로직 분리** - 독립적인 기능, 테스트 가능
3. **런타임 상태 관리 훅** - 상태 관리 일관성
4. **상수 파일 분리** - 유지보수성 향상
5. **이벤트 핸들러 분리** - 코드 구조 개선

## 주의사항

- 리팩토링 시 기존 기능이 정상 작동하는지 충분히 테스트
- 한 번에 하나씩 단계적으로 진행
- 각 리팩토링 후 커밋하여 롤백 가능하도록 유지

