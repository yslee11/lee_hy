# 🏙️ 가로경관 인식 조사 시스템

**연구용 웹 설문 시스템** - 거리 이미지에 대한 인식 조사 플랫폼

- 📱 반응형 웹 디자인 (데스크톱, 태블릿, 모바일)
- 🎯 성별 + 연령대 기반 이미지 그룹 자동 배정
- 📊 Google Sheets 자동 데이터 저장
- ☁️ GitHub Pages 무료 호스팅
- 🔒 프라이버시 중심 설계

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [설치 가이드](#설치-가이드)
3. [배포 방법](#배포-방법)
4. [사용 방법](#사용-방법)
5. [데이터 구조](#데이터-구조)
6. [트러블슈팅](#트러블슈팅)

---

## 시스템 개요

### 주요 특징

| 기능 | 설명 |
|------|------|
| **이미지 그룹 배정** | 성별+연령대 조합별로 라운드로빈 방식으로 10개 그룹(100개 이미지) 자동 배정 |
| **리커트 척도** | 심미성, 우울함, 활력, 안정감 등 4개 지표를 1~5점으로 평가 |
| **데이터 저장** | 모든 응답은 Google Sheets에 자동 저장 |
| **상태 유지** | sessionStorage를 통해 새로고침 후에도 진행 상태 유지 |
| **오프라인 대응** | 로컬 임시 저장 → 네트워크 복구 시 자동 재전송 |
| **확장 가능** | 지표 추가, 이미지 수 변경 등을 config.js에서 간단히 수정 |

### 페이지 구성

```
1. 기본 정보 입력 페이지
   └─ 성별, 연령대, 직업 선택

2~11. 이미지 평가 페이지 (10개 이미지)
   └─ 각 이미지마다 4개 척도 평가 (1~5점)

12. 완료 페이지
   └─ 감사 메시지 표시
```

---

## 설치 가이드

### 요구 사항

- **Git** (또는 GitHub Desktop)
- **Google 계정** (Google Sheets, Google Apps Script 용)
- **텍스트 에디터** (VS Code, Sublime Text 등)
- **웹 브라우저** (Chrome, Firefox, Safari, Edge)

### Step 1: GitHub 저장소 생성

#### 1-1. GitHub에서 저장소 생성

1. [GitHub](https://github.com) 접속
2. **New repository** 클릭
3. 저장소 이름: `survey-project` (또는 원하는 이름)
4. **Public** 선택 (GitHub Pages 배포 필요)
5. **Create repository** 클릭

#### 1-2. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/survey-project.git
cd survey-project
```

#### 1-3. 폴더 구조 생성

```
survey-project/
├── index.html
├── style.css
├── config.js
├── app.js
├── apps_script.gs (참고용)
├── assets/
│   └── images/
│       ├── image001.jpg
│       ├── image002.jpg
│       └── ... (100개 이미지)
└── README.md
```

#### 1-4. 이미지 추가

100개의 이미지를 `assets/images/` 폴더에 다음 규칙으로 저장:
- **파일명**: `image001.jpg`, `image002.jpg`, ..., `image100.jpg`
- **형식**: JPG, PNG, WebP
- **권장 해상도**: 800x600px 이상
- **최대 파일 크기**: 각 500KB 이하 (총 100MB 이하 권장)

### Step 2: Google Sheets 생성

#### 2-1. Google Sheets 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. **새 스프레드시트 만들기** 클릭
3. 이름: `Survey Responses` (또는 원하는 이름)

#### 2-2. 시트 설정

스프레드시트에 다음 3개 시트 생성:

**시트 1: Responses** (응답 데이터)
```
respondentId | timestamp | imageId | imageGroupId | gender | age | occupation | aesthetic | depressing | vitality | stability
---|---|---|---|---|---|---|---|---|---|---
```

**시트 2: Counter** (라운드 로빈 카운터)
```
cohortKey | count
---|---
M_10s | 0
M_20s | 0
...
```

**시트 3: Respondents** (응답자 정보)
```
respondentId | timestamp | gender | age | occupation | cohortKey | assignedGroup
---|---|---|---|---|---|---
```

#### 2-3. 스프레드시트 ID 확인

URL에서 ID 추출:
```
https://docs.google.com/spreadsheets/d/1abc2def3ghi4jkl5mno6pqr7stu8vwx/edit#gid=0
                                    ↑
                          스프레드시트 ID
```

### Step 3: Google Apps Script 설정

#### 3-1. Apps Script 생성

1. [Google Apps Script](https://script.google.com) 접속
2. **새 프로젝트** 클릭
3. 프로젝트명: `Survey Web App`

#### 3-2. 코드 복사

`apps_script.gs` 파일의 내용을 Google Apps Script 에디터에 복사

#### 3-3. 스프레드시트 ID 입력

```javascript
// apps_script.gs 첫 번째 줄
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
// ↓ 실제 ID로 변경
const SPREADSHEET_ID = "1abc2def3ghi4jkl5mno6pqr7stu8vwx";
```

#### 3-4. 배포

1. **배포** 클릭
2. **새 배포** 클릭
3. **배포 유형**: 웹 앱 선택
4. **실행 대상**: "나" 선택
5. **배포 권한**: Google 계정으로 로그인
6. **배포** 클릭

#### 3-5. URL 복사

배포 완료 후 나타나는 URL 복사:
```
https://script.google.com/macros/s/AKfycbwZneOnZe0Zgq.../exec
```

### Step 4: 설정 파일 수정

#### 4-1. config.js 수정

```javascript
// config.js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  // ↓ 위에서 복사한 URL 붙여넣기
};
```

---

## 배포 방법

### GitHub Pages 배포

#### 방법 1: Git CLI 사용

```bash
# 저장소 폴더로 이동
cd survey-project

# 파일 스테이징
git add .

# 커밋
git commit -m "Initial survey deployment"

# 푸시
git push origin main
```

#### 방법 2: GitHub Desktop 사용

1. GitHub Desktop 열기
2. **Add Local Repository** 클릭
3. 저장소 선택
4. **Commit to main** 클릭
5. **Push origin** 클릭

### GitHub Pages 활성화

1. GitHub 저장소 접속
2. **Settings** 클릭
3. **Pages** 섹션 클릭
4. **Source**: `main branch` 선택
5. **Save** 클릭

### 배포 완료 확인

배포 완료 후 접속 URL:
```
https://YOUR_USERNAME.github.io/survey-project/
```

---

## 사용 방법

### 응답자 입장에서

1. 배포된 URL 접속
2. 성별, 연령대, 직업 선택
3. "설문 시작" 클릭
4. 10개 이미지 순서대로 평가 (각 이미지마다 4개 척도 평가)
5. "다음" 버튼 클릭
6. 완료 페이지 표시

### 관리자 입장에서

#### 데이터 확인

1. Google Sheets 접속
2. **Responses** 시트 확인
3. 응답 데이터 분석

#### 응답자 추적

1. **Respondents** 시트에서 응답자 ID 확인
2. 각 응답자의 할당된 이미지 그룹 확인

#### 라운드 로빈 진행 상태

1. **Counter** 시트에서 각 cohort별 응답 수 확인
2. `count % 10`으로 다음 할당 그룹 예측 가능

---

## 데이터 구조

### 이미지 그룹 배정 알고리즘

```javascript
// 예시: 남성 20대 응답자들의 배정

응답자 1: count=0 → 0%10=0 → group01 (image001~image010)
응답자 2: count=1 → 1%10=1 → group02 (image011~image020)
응답자 3: count=2 → 2%10=2 → group03 (image021~image030)
...
응답자 10: count=9 → 9%10=9 → group10 (image091~image100)
응답자 11: count=10 → 10%10=0 → group01 (다시 처음부터)
```

### Google Sheets 스키마

#### Responses 시트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| respondentId | string(UUID) | 응답자 고유 ID |
| timestamp | string(ISO 8601) | 응답 시간 |
| imageId | string | 이미지 ID (image001~image100) |
| imageGroupId | string | 이미지 그룹 ID (group01~group10) |
| gender | string | 성별 (M/F) |
| age | string | 연령대 (10s~60s_plus) |
| occupation | string | 직업 |
| aesthetic | number | 심미성 점수 (1~5) |
| depressing | number | 우울함 점수 (1~5) |
| vitality | number | 활력 점수 (1~5) |
| stability | number | 안정감 점수 (1~5) |

#### Counter 시트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| cohortKey | string | 성별_연령대 (e.g., M_20s) |
| count | number | 현재까지의 응답 수 |

#### Respondents 시트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| respondentId | string(UUID) | 응답자 고유 ID |
| timestamp | string(ISO 8601) | 등록 시간 |
| gender | string | 성별 |
| age | string | 연령대 |
| occupation | string | 직업 |
| cohortKey | string | Cohort 키 |
| assignedGroup | string | 할당받은 이미지 그룹 |

---

## 트러블슈팅

### Q1: "이미지 그룹을 할당할 수 없습니다" 오류

**원인**: Apps Script URL이 잘못되었거나 스프레드시트 ID가 없음

**해결**:
```javascript
// config.js 확인
1. APPS_SCRIPT_URL이 정확히 복사되었는지 확인
2. 맨 뒤의 "/exec" 확인
3. 공백이나 오타 없는지 확인
```

### Q2: "이미지를 로드할 수 없습니다" 오류

**원인**: 이미지 경로가 잘못되었거나 파일이 없음

**해결**:
```bash
# 이미지 폴더 구조 확인
assets/images/
├── image001.jpg
├── image002.jpg
└── ...

# 파일명 규칙 확인
- image001.jpg (O)
- image_001.jpg (X)
- image001.JPG (가능하지만 소문자 권장)
```

### Q3: CORS 오류

**원인**: 크로스 도메인 요청 차단

**해결**:
```javascript
// config.js에서 APPS_SCRIPT_URL 확인
// Google Apps Script는 CORS 지원하므로 정상 작동하면 이 오류는 없어야 함

// 만약 발생하면:
// 1. 브라우저 콘솔에서 정확한 오류 메시지 확인
// 2. Apps Script의 배포 권한 확인
// 3. 새로운 배포 생성 (기존 배포 재사용 시 오류 가능)
```

### Q4: Google Sheets에 데이터가 저장되지 않음

**원인**: Apps Script 권한 문제 또는 스프레드시트 ID 오류

**해결**:
```javascript
// 1. apps_script.gs의 SPREADSHEET_ID 확인
const SPREADSHEET_ID = "1abc2def3ghi4jkl5mno6pqr7stu8vwx";

// 2. Apps Script 실행 권한 재확인
//    - 배포 시 "나" (자신의 Google 계정) 선택
//    - 필요한 권한(Google Sheets 접근) 모두 승인

// 3. 테스트 함수 실행
//    - Google Apps Script 에디터에서 testSubmitResponse() 실행
//    - 로그 확인 (Ctrl+Enter)
```

### Q5: sessionStorage 데이터 손실

**원인**: 브라우저 설정에서 자동 삭제 또는 개인정보 보호 모드

**해결**:
```javascript
// 응답자에게 안내:
1. 개인정보 보호 모드 비활성화
2. 브라우저 쿠키/캐시 삭제 금지
3. 브라우저 자동 삭제 설정 확인
```

### Q6: 이미지 표시 속도 느림

**원인**: 큰 이미지 파일 크기

**해결**:
```bash
# 이미지 압축
1. TinyPNG, ImageOptim 등으로 압축
2. 각 이미지 파일 크기: 200~500KB 권장
3. 해상도: 800x600px 이상

# 또는 외부 CDN 사용
- GitHub에서 로드 대신 Cloudinary 등 사용
- config.js의 GITHUB_RAW 수정
```

### Q7: 새 이미지 그룹 추가하려면?

**현재**: 10개 그룹, 100개 이미지

**변경 방법**:
```javascript
// config.js 수정
const CONFIG = {
  TOTAL_IMAGES: 200,        // 변경: 100 → 200
  IMAGES_PER_GROUP: 10,     // 그대로
  TOTAL_GROUPS: 20,         // 변경: 10 → 20
  SURVEY_IMAGES: 10,        // 그대로 (응답자당 평가 수)
};

// apps_script.gs 수정
const groupIndex = currentCount % 20;  // 변경: % 10 → % 20

// 이미지 추가
assets/images/
├── ...
├── image100.jpg
├── image101.jpg           // 새 이미지들
└── image200.jpg
```

### Q8: 새 척도 추가하려면?

**현재**: 4개 척도 (심미성, 우울함, 활력, 안정감)

**변경 방법**:
```javascript
// config.js의 SCALES 배열 수정
const SCALES = [
  {
    id: 'aesthetic',
    label: '심미적이다',
    description: '이 거리는 시각적으로 매력적인가?',
    min_label: '전혀 아님',
    max_label: '매우 그러함'
  },
  // ... 기존 척도들 ...
  {
    id: 'crowded',           // 새 척도 추가
    label: '붐빈다',
    description: '이 거리가 붐비는가?',
    min_label: '한산함',
    max_label: '매우 붐빔'
  }
];

// apps_script.gs 헤더 수정
const headers = [
  'respondentId',
  'timestamp',
  'imageId',
  'imageGroupId',
  'gender',
  'age',
  'occupation',
  'aesthetic',
  'depressing',
  'vitality',
  'stability',
  'crowded'                 // 새 컬럼 추가
];
```

---

## 기술 사양

| 항목 | 사양 |
|------|------|
| **프론트엔드** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **백엔드** | Google Apps Script |
| **데이터베이스** | Google Sheets |
| **호스팅** | GitHub Pages |
| **브라우저** | Chrome, Firefox, Safari, Edge 최신 버전 |
| **모바일** | iOS Safari, Android Chrome |

---

## 보안 및 개인정보

### 데이터 수집

- ✅ 성별, 연령대, 직업 (필수)
- ✅ 응답 점수 및 응답 시간
- ❌ 이름, 이메일, 전화번호 등 개인식별 정보 수집 안 함

### 데이터 저장

- 모든 데이터는 Google Sheets에 저장
- Google의 보안 정책 준용
- sessionStorage: 로컬 브라우저에만 저장 (서버 전송 안 함)

### 개인정보 보호

- HTTPS 배포 권장
- 응답자 ID는 UUID (개인식별 불가)
- 응답 데이터만 저장 (개인정보 최소화)

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 지원

문제가 발생하면:

1. **로그 확인**: 브라우저 개발자 도구 (F12) → Console 탭
2. **테스트 함수 실행**: Google Apps Script에서 `testSubmitResponse()` 실행
3. **GitHub Issues**: 버그 리포트 또는 기능 요청

---

## 변경 로그

### v1.0.0 (2024-01-15)

- 초기 릴리스
- 성별+연령대 기반 이미지 그룹 자동 배정
- 리커트 척도 평가 시스템
- Google Sheets 자동 저장
- GitHub Pages 배포

---

**Last Updated**: 2024년 1월
