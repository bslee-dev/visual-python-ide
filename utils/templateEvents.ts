/**
 * 템플릿별 위젯 이벤트 코드 생성 유틸리티
 */

export const getTemplateEventCode = (widgetName: string, templateName: string): string => {
  // 로그인 폼
  if (templateName === '로그인 폼') {
    if (widgetName === 'btnLogin') {
      return `# 로그인 버튼 클릭 이벤트
var username = getWidget("txtUsername", "value");
var password = getWidget("txtPassword", "value");

if (username == "" || password == "") {
    msgBox("아이디와 비밀번호를 입력하세요.", "로그인 실패", "warning");
} else {
    // 간단한 로그인 검증 (예제)
    if (username == "admin" && password == "1234") {
        msgBox("로그인 성공!", "환영합니다", "info");
        setWidget("lblTitle", "text", "환영합니다, " + username + "님!");
    } else {
        msgBox("아이디 또는 비밀번호가 올바르지 않습니다.", "로그인 실패", "error");
    }
}`;
    }
  }
  
  // 계산기
  if (templateName === '계산기') {
    const numButtons = ['btn0', 'btn1', 'btn2', 'btn3', 'btn4', 'btn5', 'btn6', 'btn7', 'btn8', 'btn9'];
    if (numButtons.includes(widgetName)) {
      const digit = widgetName.replace('btn', '');
      return `# 숫자 버튼 클릭
var current = getWidget("txtDisplay", "value");
if (current == "0" || current == "") {
    setWidget("txtDisplay", "value", "${digit}");
} else {
    setWidget("txtDisplay", "value", current + "${digit}");
}`;
    }
    
    if (widgetName === 'btnPlus') {
      return `# 더하기 버튼
var current = getWidget("txtDisplay", "value");
if (current != "" && current != null) {
    setWidget("txtDisplay", "value", current + "+");
}`;
    }
    
    if (widgetName === 'btnMinus') {
      return `# 빼기 버튼
var current = getWidget("txtDisplay", "value");
if (current != "" && current != null) {
    setWidget("txtDisplay", "value", current + "-");
}`;
    }
    
    if (widgetName === 'btnMultiply') {
      return `# 곱하기 버튼
var current = getWidget("txtDisplay", "value");
if (current != "" && current != null) {
    setWidget("txtDisplay", "value", current + "*");
}`;
    }
    
    if (widgetName === 'btnDivide') {
      return `# 나누기 버튼
var current = getWidget("txtDisplay", "value");
if (current != "" && current != null) {
    setWidget("txtDisplay", "value", current + "/");
}`;
    }
    
    if (widgetName === 'btnEquals') {
      return `# 등호 버튼 - 계산 실행
var expression = getWidget("txtDisplay", "value");
try {
    var result = eval(expression);
    setWidget("txtDisplay", "value", String(result));
} catch(e) {
    msgBox("계산 오류가 발생했습니다.", "오류", "error");
    setWidget("txtDisplay", "value", "0");
}`;
    }
    
    if (widgetName === 'btnClear') {
      return `# Clear 버튼
setWidget("txtDisplay", "value", "0");`;
    }
  }
  
  // To-Do 리스트
  if (templateName === 'To-Do 리스트') {
    if (widgetName === 'btnAdd') {
      return `# 할 일 추가 버튼
var task = getWidget("txtTask", "value");
if (task == "" || task == null) {
    msgBox("할 일을 입력하세요.", "알림", "warning");
} else {
    var current_items = getWidget("lstTasks", "items");
    var items_list = [];
    if (current_items && current_items != "" && Array.isArray(current_items)) {
        items_list = current_items;
    } else if (typeof current_items == "string" && current_items != "") {
        try {
            items_list = JSON.parse(current_items);
        } catch(e) {
            items_list = [];
        }
    }
    items_list.push(task);
    setWidget("lstTasks", "items", items_list);
    setWidget("txtTask", "value", "");
    console.log("할 일이 추가되었습니다: " + task);
}`;
    }
    
    if (widgetName === 'btnDelete') {
      return `# 할 일 삭제 버튼
var selected_index = getWidget("lstTasks", "selectedIndex");
if (selected_index == "" || selected_index == null || selected_index == -1 || selected_index < 0) {
    msgBox("삭제할 항목을 선택하세요.", "알림", "warning");
} else {
    var current_items = getWidget("lstTasks", "items");
    var items_list = [];
    if (current_items && current_items != "" && Array.isArray(current_items)) {
        items_list = current_items;
    } else if (typeof current_items == "string" && current_items != "") {
        try {
            items_list = JSON.parse(current_items);
        } catch(e) {
            items_list = [];
        }
    }
    if (typeof selected_index == "string") {
        selected_index = parseInt(selected_index);
    }
    if (selected_index >= 0 && selected_index < items_list.length) {
        var deleted_task = items_list[selected_index];
        items_list.splice(selected_index, 1);
        setWidget("lstTasks", "items", items_list);
        setWidget("lstTasks", "selectedIndex", -1);
        console.log("할 일이 삭제되었습니다: " + deleted_task);
    }
}`;
    }
  }
  
  return '';
};

