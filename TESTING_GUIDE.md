# ✅ 구현 검사 및 테스트 가이드

## 배포 전 체크리스트

### 1단계: 로컬 개발 환경 검사

```bash
# 폴더 구조 확인
survey-project/
├── index.html          ✓
├── style.css           ✓
├── config.js           ✓
├── app.js              ✓
├── assets/
│   └── images/
│       ├── image001.jpg ✓
│       ├── image002.jpg ✓
│       └── ... (100개)
└── README.md           ✓
```

### 2단계: 파일 내용 검사

#### index.html
```html
✓ DOCTYPE, meta tags 있음
✓ <link rel="stylesheet" href="style.css">
✓ <script src="config.js"></script>
✓ <script src="app.js"></script>
✓ id="page-intro", id="page-survey", id="page-complete" 있음
✓ id="btn-start", id="btn-next", id="btn-prev" 있음
✓ id="survey-image" 있음
✓ 모든 폼 요소에 name, id 있음
```

#### config.js
```javascript
✓ APPS_SCRIPT_URL 설정됨
✓ SCALES 배열 정의됨 (최소 1개 이상)
✓ GENDER_OPTIONS, AGE_OPTIONS 정의됨
✓ StorageManager 객체 정의됨
✓ Logger 객체 정의됨
```

#### app.js
```javascript
✓ handleStartSurvey() 함수 정의됨
✓ assignImageGroup() 함수 정의됨
✓ loadImagePage() 함수 정의됨
✓ collectScores() 함수 정의됨
✓ handleNextQuestion() 함수 정의됨
✓ submitAllResponses() 함수 정의됨
```

#### style.css
```css
✓ :root 변수 정의됨
✓ .page, .page.active 클래스 정의됨
✓ .btn, .btn-primary, .btn-secondary 클래스 정의됨
✓ .scale-option 스타일 정의됨
✓ 반응형 미디어 쿼리 있음 (@media)
```

#### apps_script.gs
```javascript
✓ SPREADSHEET_ID 설정됨
✓ doPost(e) 함수 정의됨
✓ handleAssignGroup() 함수 정의됨
✓ handleSubmitResponses() 함수 정의됨
✓ 테스트 함수 있음 (testAssignGroup, testSubmitResponse)
```

---

## 3단계: Google Apps Script 배포 검사

### 배포 전 테스트

```javascript
// Google Apps Script 에디터에서 실행:

// 1. 할당 테스트
function runTest() {
  const result = testAssignGroup();
  console.log('할당 테스트:', JSON.stringify(result, null, 2));
}

// 2. 제출 테스트
function runTest2() {
  const result = testSubmitResponse();
  console.log('제출 테스트:', JSON.stringify(result, null, 2));
}

// 3. 권한 확인
function checkPermissions() {
  try {
    const ss = SpreadsheetApp.openById('YOUR_ID');
    console.log('스프레드시트 접근: 성공');
  } catch (e) {
    console.error('스프레드시트 접근: 실패', e.message);
  }
}
```

### 배포 후 확인

```
✓ 배포 URL 복사 완료
✓ config.js의 APPS_SCRIPT_URL 업데이트
✓ 웹 브라우저에서 배포 URL 접속 가능 (로그인 페이지 또는 오류 없음)
```

---

## 4단계: GitHub 배포 검사

### Git 명령어로 배포

```bash
# 저장소 상태 확인
git status

# 파일 스테이징
git add .

# 커밋 메시지 작성
git commit -m "Add survey files with complete implementation"

# 원격 저장소에 푸시
git push origin main

# 배포 상태 확인
git log --oneline | head -5
```

### GitHub Pages 활성화 확인

1. GitHub 저장소 → Settings → Pages
2. Source: main branch
3. Status: "Your site is published at https://..."

---

## 5단계: 브라우저 테스트

### 데스크톱 (Chrome)

```javascript
// 콘솔 열기: F12

1. 기본 정보 입력
   - 성별: 남 선택
   - 연령대: 20대 선택
   - 직업: 학생 선택
   - 동의: 체크
   - "설문 시작" 클릭
   
   ✓ 오류 메시지 없음
   ✓ 페이지 2로 전환됨
   ✓ 콘솔에 "설문 시작 처리" 로그

2. 이미지 평가
   - 이미지 로드 확인
   - 척도 선택 가능 (라디오 버튼)
   - "다음" 버튼 활성화
   
   ✓ 이미지 표시됨
   ✓ 라디오 버튼 선택 가능
   ✓ 모든 척도에 응답 후 "다음" 버튼 활성화

3. 다음 페이지 이동
   - "다음" 클릭
   - 다음 이미지 로드
   
   ✓ 진행 상태 업데이트 (2/10)
   ✓ 이전 선택지 초기화
   ✓ "이전" 버튼 활성화

4. 마지막 이미지 (10/10)
   - "다음" 클릭
   - 완료 페이지 표시
   
   ✓ 페이지 3 표시됨
   ✓ "설문 완료" 메시지 표시
   ✓ "다시 시작" 버튼 있음

5. 새로고침 테스트
   - 페이지 2에서 F5 (새로고침)
   
   ✓ 같은 페이지 유지 (상태 복구)
   ✓ 같은 이미지 표시
   ✓ 진행 상태 유지
```

### 모바일 테스트 (Chrome DevTools)

```javascript
// F12 → 반응형 모드 (Ctrl+Shift+M)

1. iPhone 12 (390x844)
   ✓ 레이아웃 이상 없음
   ✓ 텍스트 읽기 가능
   ✓ 버튼 터치 가능 (최소 44x44px)
   ✓ 이미지 표시 정상

2. iPad (768x1024)
   ✓ 모든 요소 명확함
   ✓ 척도 옵션 선택 가능

3. 다양한 크기 테스트
   ✓ 480px, 768px, 1024px 모두 정상
```

### 다양한 브라우저

```javascript
// 테스트 브라우저:
✓ Chrome (최신)
✓ Firefox (최신)
✓ Safari (최신)
✓ Edge (최신)

// 각 브라우저에서:
✓ 페이지 로드 정상
✓ 스타일 적용 정상
✓ 자바스크립트 작동 정상
✓ 폼 입력 가능
✓ 이미지 표시 정상
```

---

## 6단계: 네트워크 테스트

### 네트워크 속도 시뮬레이션

Chrome DevTools → Network → Throttling

```javascript
// 1. Fast 3G (1.6 Mbps)
   ✓ 페이지 로드 < 5초
   ✓ 첫 이미지 로드 < 3초
   ✓ API 응답 < 2초

// 2. Slow 3G (400 kbps)
   ✓ 로딩 표시 나타남
   ✓ 타임아웃 없음 (10초 제한)
   ✓ 에러 핸들링 작동

// 3. Offline
   ✓ 입력 폼 접근 가능
   ✓ API 호출 시 오류 메시지
```

---

## 7단계: Google Sheets 연동 테스트

### 데이터 저장 확인

```javascript
// 1. 완전한 응답 제출
   - 기본 정보 입력 → "설문 시작"
   - 10개 이미지 모두 평가
   - "다음" 클릭 (마지막 이미지에서)
   
   Google Sheets 확인:
   ✓ Respondents 시트에 응답자 추가됨
   ✓ Counter 시트의 카운트 증가됨
   ✓ Responses 시트에 10행 추가됨
   ✓ 모든 점수 값 범위 확인 (1~5)

// 2. 부분 응답 (새로고침)
   - 페이지 2에서 새로고침
   - 같은 응답자로 계속
   - 10개 모두 완료
   
   Google Sheets 확인:
   ✓ 응답자 ID 동일
   ✓ 중복 저장 없음

// 3. 다양한 응답자
   - 여러 성별/연령대로 테스트
   - 각각 완전한 응답 제출
   
   Google Sheets 확인:
   ✓ Counter에 다른 cohortKey 행 추가됨
   ✓ 각 cohortKey별 카운트 증가
```

### 라운드 로빈 확인

```javascript
// 같은 cohort (M_20s)로 11명 응답

응답자 1:  Counter(M_20s) = 0 → group01 할당
응답자 2:  Counter(M_20s) = 1 → group02 할당
응답자 3:  Counter(M_20s) = 2 → group03 할당
...
응답자 10: Counter(M_20s) = 9 → group10 할당
응답자 11: Counter(M_20s) = 10 → group01 할당 (다시 처음부터)

확인:
✓ Responses 시트에서 imageGroupId 확인
✓ 기대하는 그룹이 할당되었는지 확인
```

---

## 8단계: 오류 처리 테스트

### 네트워크 오류

```javascript
// 1. API 호출 실패 시뮬레이션
   - config.js의 APPS_SCRIPT_URL을 잘못된 값으로 변경
   - "설문 시작" 클릭
   
   ✓ 오류 메시지 표시
   ✓ 페이지 전환 안 됨
   ✓ 콘솔에 오류 로그

// 2. 타임아웃 테스트
   - 네트워크 느림 (DevTools에서 Slow 3G 설정)
   - API 응답 지연 (10초 초과)
   
   ✓ 타임아웃 오류 메시지
   ✓ 사용자 입력 가능 상태로 복구
```

### 입력 검증

```javascript
// 1. 필수 정보 미입력
   - 성별만 선택 후 "설문 시작"
   
   ✓ "기본 정보를 입력하세요" 경고

// 2. 척도 미선택
   - 일부 척도만 선택 후 "다음"
   
   ✓ "모든 항목을 선택하세요" 경고
   ✓ "다음" 버튼 비활성화

// 3. 잘못된 점수 범위
   - 수동으로 점수 값 1~5 범위 확인
   
   ✓ 콘솔에서 점수 유효성 검증 로그
```

---

## 9단계: 성능 테스트

### 로딩 시간

```javascript
Chrome DevTools → Performance

// 1. 초기 로드
   ✓ First Contentful Paint (FCP) < 2초
   ✓ Largest Contentful Paint (LCP) < 3초
   ✓ Cumulative Layout Shift (CLS) < 0.1

// 2. 이미지 로드
   ✓ 각 이미지 < 2초

// 3. API 응답
   ✓ 그룹 할당 API < 2초
   ✓ 응답 제출 API < 3초
```

### 메모리 사용

```javascript
Chrome DevTools → Memory

// 1. 초기 상태
   ✓ 메모리 < 50MB

// 2. 10개 이미지 모두 로드 후
   ✓ 메모리 < 100MB (캐시 포함)

// 3. 메모리 누수 확인
   - 페이지 로드 → 이동 → 로드 (반복 5회)
   ✓ 메모리 증가가 선형적이지 않음 (GC 작동)
```

---

## 10단계: 접근성 테스트

### 키보드 네비게이션

```javascript
// Tab 키로 모든 요소 접근 가능
✓ 라디오 버튼 선택 가능
✓ 드롭다운 열기 가능
✓ 버튼 활성화 가능
✓ 체크박스 선택 가능
✓ "다음", "이전" 버튼 선택 가능

// Enter로 동작 실행
✓ 버튼 클릭
✓ 라디오 버튼 선택
✓ 드롭다운 옵션 선택
```

### 스크린 리더 (NVDA, JAWS)

```javascript
✓ 페이지 제목 읽음
✓ 폼 라벨 읽음
✓ 버튼 텍스트 읽음
✓ 오류 메시지 읽음
✓ 진행 상태 읽음
```

---

## 11단계: 보안 테스트

### HTTPS 확인

```javascript
✓ GitHub Pages 자동 HTTPS 적용
✓ 주소창에 자물쇠 아이콘
✓ Mixed content 경고 없음
```

### 민감한 정보

```javascript
✓ 비밀번호 입력 없음
✓ 개인 신원 정보 수집 안 함
✓ sessionStorage만 사용 (로컬)
✓ API 응답에 민감 정보 없음
```

### XSS 방지

```javascript
✓ 사용자 입력 전부 검증
✓ innerHTML 사용 최소화
✓ querySelector 사용으로 안전
✓ JSON.parse 전 검증
```

---

## 체크리스트 (최종)

```
배포 전 확인사항:

기술 검사
□ HTML 유효성 (W3C Validator)
□ CSS 유효성
□ JavaScript 오류 없음 (콘솔)
□ 이미지 경로 정확 (100개 모두)
□ 설정 값 정확 (config.js)

Google Apps Script
□ SPREADSHEET_ID 설정
□ 테스트 함수 실행 성공
□ 배포 완료 (Web App)
□ URL 복사 (config.js 업데이트)

GitHub
□ 저장소 생성
□ 파일 푸시 완료
□ Pages 활성화
□ 배포 URL 접속 확인

기능 테스트
□ 기본 정보 입력 가능
□ 이미지 로드됨
□ 척도 선택 가능
□ "다음" 버튼 작동
□ "이전" 버튼 작동
□ 완료 페이지 표시
□ Google Sheets에 데이터 저장

반응형 테스트
□ 데스크톱 정상
□ 태블릿 정상
□ 모바일 정상

브라우저 테스트
□ Chrome 정상
□ Firefox 정상
□ Safari 정상
□ Edge 정상

성능 테스트
□ 초기 로드 < 3초
□ 이미지 로드 < 2초
□ API 응답 < 3초

보안 테스트
□ HTTPS 적용
□ 입력 검증
□ 오류 처리

배포 완료!
```

---

## 문제 해결 흐름도

```
문제 발생
  ↓
브라우저 콘솔 확인 (F12)
  ├─ 오류 메시지 있음? → 오류 읽고 수정
  └─ 오류 메시지 없음? → 다음 단계
  ↓
Network 탭 확인 (F12)
  ├─ 이미지 404? → 이미지 경로 확인
  ├─ API 실패? → APPS_SCRIPT_URL 확인
  └─ 정상? → 다음 단계
  ↓
Google Apps Script 로그 확인
  ├─ 오류 있음? → apps_script.gs 수정
  └─ 로그 없음? → API 호출 안 됨 (config 확인)
  ↓
Google Sheets 확인
  ├─ 데이터 저장 안 됨? → Apps Script 권한 확인
  └─ 정상? → 배포 완료!
```

---

**마지막 업데이트**: 2024년 1월
