# Visual Python IDE

시각적으로 Python Tkinter GUI 애플리케이션을 만들 수 있는 웹 기반 IDE입니다. 드래그 앤 드롭으로 위젯을 배치하고, 이벤트 코드를 작성하여 인터랙티브한 GUI 애플리케이션을 만들 수 있습니다.

## ✨ 주요 기능

- 🎨 **시각적 디자이너**: 드래그 앤 드롭으로 위젯 배치
- 📝 **코드 에디터**: Monaco Editor 기반의 Python 코드 편집
- 🎯 **다양한 위젯**: 버튼, 텍스트박스, 체크박스, 라디오버튼, 슬라이더 등
- 🚀 **실행 모드**: 작성한 GUI를 브라우저에서 직접 실행 및 테스트
- 💾 **프로젝트 저장/로드**: JSON 형식으로 프로젝트 저장 및 불러오기
- 📤 **Python 코드 생성**: Tkinter 코드로 자동 변환 및 다운로드
- 🔄 **Undo/Redo**: 작업 히스토리 관리
- 🌙 **다크 모드**: 다크 테마 지원
- 📋 **템플릿 & 스니펫**: 미리 만들어진 템플릿과 코드 스니펫 제공

## 🛠️ 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor (VS Code 에디터)

## 📦 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 모드로 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
# 프로덕션 빌드 생성
npm run build

# 프로덕션 서버 실행
npm start
```

## 🎮 사용 방법

### 1. 위젯 추가하기

왼쪽 툴박스에서 원하는 위젯을 드래그하여 캔버스에 놓습니다.

### 2. 위젯 편집하기

- **선택**: 위젯을 클릭하여 선택
- **이동**: 위젯을 드래그하여 이동
- **크기 조절**: 선택된 위젯의 모서리 핸들을 드래그하여 크기 조절
- **속성 편집**: 오른쪽 속성 패널에서 위젯의 속성을 편집

### 3. 이벤트 코드 작성하기

위젯을 더블클릭하면 코드 에디터가 열립니다. 다음과 같은 함수를 사용할 수 있습니다:

```javascript
// 위젯 속성 설정
setWidget("위젯이름", "속성", 값)
setWidget("button1", "text", "클릭됨!")

// 위젯 속성 가져오기
getWidget("위젯이름", "속성")
const value = getWidget("textbox1", "value")

// 메시지 박스 표시
msgBox("메시지", "제목", "타입")  // 타입: info, warning, error, question

// 콘솔 출력
console.log("Hello World")
print("Hello World")  // console.log와 동일
```

### 4. 실행하기

상단 툴바의 "실행" 버튼을 클릭하여 작성한 GUI를 실행합니다.

### 5. 프로젝트 저장/로드

- **저장**: 상단 툴바의 "Save" 버튼을 클릭하여 프로젝트를 JSON 파일로 저장
- **로드**: "Open" 버튼을 클릭하여 저장된 프로젝트 파일을 불러오기

### 6. Python 코드 내보내기

"Export" 버튼을 클릭하면 Tkinter Python 코드가 생성되어 다운로드됩니다.

## ⌨️ 키보드 단축키

- `Ctrl + Z`: Undo
- `Ctrl + Y`: Redo
- `Delete`: 선택된 위젯 삭제
- `Ctrl + D`: 선택된 위젯 복제
- `화살표 키`: 위젯을 1px 이동
- `Shift + 화살표 키`: 위젯을 10px 이동

## 📁 프로젝트 구조

```
visual-python-ide/
├── components/              # React 컴포넌트
│   ├── VisualPythonIDE.tsx  # 메인 IDE 컴포넌트
│   ├── Toolbox.tsx          # 툴박스 컴포넌트
│   ├── WidgetRenderer.tsx    # 위젯 렌더링 컴포넌트
│   └── CodeEditor.tsx       # 코드 에디터 컴포넌트
├── hooks/                   # 커스텀 React 훅
│   ├── useHistory.ts        # Undo/Redo 훅
│   ├── useWidgets.ts       # 위젯 관리 훅
│   ├── useRuntime.ts       # 실행 모드 상태 관리 훅
│   └── useCodeExecution.ts # 코드 실행 훅
├── types/                   # TypeScript 타입 정의
│   └── widget.ts            # 위젯 관련 타입
├── constants/               # 상수 데이터
│   ├── index.ts            # 위젯 타입, 템플릿, 스니펫 등
│   └── defaults.ts         # 기본값 상수
├── utils/                   # 유틸리티 함수
│   ├── helpers.ts           # 헬퍼 함수들
│   └── templateEvents.ts    # 템플릿 이벤트 코드 생성
├── pages/                   # Next.js 페이지
│   ├── _app.tsx
│   └── index.tsx
└── styles/                  # 스타일 파일
    └── globals.css
```

## 🏗️ 아키텍처

프로젝트는 다음과 같이 모듈화되어 있습니다:

- **컴포넌트**: UI 렌더링 및 사용자 인터랙션 처리
- **훅**: 상태 관리 및 비즈니스 로직 분리
- **유틸리티**: 재사용 가능한 헬퍼 함수
- **상수**: 설정값 및 기본값 관리
- **타입**: TypeScript 타입 안정성 보장

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request를 환영합니다!

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 등록해주세요.

