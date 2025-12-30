# 🚀 가로경관 인식 조사 시스템 - 완전 구현 가이드

## 📌 핵심 내용 요약

이 프로젝트는 **성별+연령대 기반 라운드 로빈 방식의 이미지 그룹 배정**과 **리커트 척도 다중 지표 평가**를 특징으로 하는 연구용 웹 설문 시스템입니다.

### 특징
- ✅ **100개 이미지** → **10개 그룹** (그룹당 10개 이미지)
- ✅ **성별 + 연령대 기반** 자동 이미지 그룹 배정
- ✅ **라운드 로빈 방식** (동일 cohort 내 순차적 배정)
- ✅ **4개 리커트 척도** (심미성, 우울함, 활력, 안정감)
- ✅ **Google Sheets 자동 저장**
- ✅ **GitHub Pages 무료 배포**
- ✅ **sessionStorage 상태 유지** (새로고침 후에도 복구)

---

## 🎯 5분 빠른 시작

### 1단계: 파일 준비 (2분)

이 프로젝트에서 제공되는 파일:
```
✓ index.html      → 3개 페이지 UI
✓ style.css       → 반응형 디자인
✓ config.js       → 설정 (척도, API URL 등)
✓ app.js          → 메인 로직
✓ apps_script.gs  → Google Apps Script 코드
✓ README.md       → 설치 가이드
```

### 2단계: Google 설정 (2분)

```javascript
// 1. Google Sheets 생성
   → 3개 시트: Responses, Counter, Respondents
   
// 2. Google Apps Script 생성
   → apps_script.gs 코드 복사
   → SPREADSHEET_ID 설정
   → 웹 앱으로 배포 → URL 복사
   
// 3. config.js 업데이트
   APPS_SCRIPT_URL = "복사한 URL"
```

### 3단계: GitHub 배포 (1분)

```bash
git add .
git commit -m "Initial survey"
git push origin main
# GitHub Pages → 자동 배포됨
```

---

## 🏗️ 시스템 아키텍처

### 전체 플로우

```
사용자 입력 (성별, 연령대, 직업)
    ↓
[앞엔드] assignImageGroup() 호출
    ↓
[백엔드] Apps Script
├─ cohortKey 생성 (M_20s)
├─ Counter 시트에서 count 조회
├─ groupIndex = count % 10
├─ count 증가
└─ imageIds[] 반환
    ↓
[앞엔드] 10개 이미지 로드 및 평가
    ↓
각 이미지마다 4개 척도 평가 (1~5점)
응답 저장 (로컬)
    ↓
모두 완료 시 submitAllResponses()
    ↓
[백엔드] Google Sheets 저장
└─ Responses 시트에 10행 추가
    ↓
완료!
```

### 페이지별 화면

```
Page 1: 기본 정보 입력
┌──────────────────────┐
│ 가로경관 인식 조사     │
│                      │
│ 성별: ○남 ○여        │
│ 연령: [드롭다운]      │
│ 직업: [드롭다운]      │
│ □ 동의               │
│                      │
│ [설문 시작]          │
└──────────────────────┘

Page 2-11: 이미지 평가 (각 페이지마다 1개 이미지)
┌──────────────────────┐
│ █████░░░░ 5/10       │
│                      │
│ [이미지 표시]        │
│                      │
│ 1. 심미적이다         │
│    ○1 ○2 ○3 ○4 ○5  │
│                      │
│ 2. 우울하게 느껴진다   │
│    ○1 ○2 ○3 ○4 ○5  │
│                      │
│ ... (척도 계속)      │
│                      │
│ [이전] [다음]        │
└──────────────────────┘

Page 12: 완료
┌──────────────────────┐
│        ✅             │
│ 설문 완료            │
│                      │
│ 참여해주셔서 감사합니다 │
│                      │
│ [다시 시작]          │
└──────────────────────┘
```

---

## 📊 데이터 구조

### 응답 흐름

```
Request 1: assignImageGroup
{
  action: "assignGroup",
  gender: "M",
  age: "20s",
  occupation: "student"
}
    ↓
Response 1:
{
  success: true,
  respondentId: "uuid-xxx",
  imageGroupId: "group03",
  imageIds: ["image021", "image022", ..., "image030"]
}

Request 2: submitResponses (10개 이미지 모두 평가 후)
{
  action: "submitResponses",
  respondentId: "uuid-xxx",
  responses: [
    {
      timestamp: "2024-01-15T10:30:00Z",
      imageId: "image021",
      imageGroupId: "group03",
      respondent: { gender: "M", age: "20s", occupation: "student" },
      scores: { aesthetic: 4, depressing: 2, vitality: 4, stability: 3 }
    },
    ...
  ]
}
    ↓
Response 2:
{
  success: true,
  message: "10개의 응답이 저장되었습니다",
  savedCount: 10
}
```

### Google Sheets 스키마

```sql
-- Responses (응답 데이터)
respondentId | timestamp | imageId | imageGroupId | gender | age | occupation | aesthetic | depressing | vitality | stability
uuid-1       | 2024-01-15T10:30:00Z | image021 | group03 | M | 20s | student | 4 | 2 | 4 | 3
uuid-1       | 2024-01-15T10:31:00Z | image022 | group03 | M | 20s | student | 3 | 3 | 5 | 4
...

-- Counter (라운드 로빈 카운터)
cohortKey | count
M_10s    | 5
M_20s    | 23    (→ 23 % 10 = 3 → group04 할당)
F_30s    | 18
...

-- Respondents (응답자 메타)
respondentId | timestamp | gender | age | occupation | cohortKey | assignedGroup
uuid-1       | 2024-01-15T10:15:00Z | M | 20s | student | M_20s | group03
uuid-2       | 2024-01-15T10:45:00Z | F | 30s | office_worker | F_30s | group09
...
```

---

## 🔧 주요 함수 설명

### Frontend (app.js)

```javascript
// 1. 이미지 그룹 할당 요청
assignImageGroup(respondent)
  → POST /assignGroup
  ← { respondentId, imageGroupId, imageIds[] }

// 2. 페이지 로드
loadImagePage()
  → 진행 상황 표시
  → 척도 폼 렌더링
  → 이미지 로드

// 3. 다음 이미지
handleNextQuestion()
  → 응답 수집 (collectScores)
  → 응답 저장 (로컬)
  → 모두 완료? → 제출 : 다음 페이지

// 4. 모든 응답 제출
submitAllResponses()
  → POST /submitResponses
  ← { success: true, savedCount: 10 }
  → 완료 페이지
```

### Backend (apps_script.gs)

```javascript
// 1. 이미지 그룹 할당
handleAssignGroup(requestData)
  1. cohortKey 생성 (gender_age)
  2. Counter 시트에서 count 조회
  3. groupIndex = count % 10 계산
  4. count 증가
  5. imageIds[] 반환

// 2. 응답 제출
handleSubmitResponses(requestData)
  1. 응답 데이터 검증
  2. Responses 시트에 10행 추가
  3. 성공 응답 반환
```

---

## 🎨 UI/UX 특징

### 반응형 디자인

```css
/* Desktop (1024px+) */
- 전체 너비 900px
- 라운드한 카드 스타일

/* Tablet (768px) */
- 패딩 감소
- 버튼 전체 너비

/* Mobile (480px 이하) */
- 텍스트 크기 감소
- 척도 옵션 최소화
- 버튼 스택 레이아웃
```

### 사용성

```
✓ 진행 상태 시각화 (진행 바 + 숫자)
✓ 로딩 표시 (스피너)
✓ 오류 메시지 (인라인)
✓ 무료 네비게이션 (이전/다음)
✓ 상태 자동 저장 (새로고침 후 복구)
✓ 접근성 고려 (키보드 네비게이션, 스크린 리더)
```

---

## 🔐 보안 & 개인정보

### 수집 정보

```
✓ 성별 (M/F)
✓ 연령대 (10s ~ 60s_plus)
✓ 직업 (9가지 선택지)
✓ 이미지 평가 점수
✓ 응답 시간

✗ 이름, 이메일, 전화번호 등 개인식별 정보 안 함
✗ 비밀번호, 신용카드 등 민감 정보 안 함
```

### 데이터 저장

```
로컬 (sessionStorage)
├─ 응답자 정보 (일시적)
├─ 응답 점수 (일시적)
└─ 진행 상태 (새로고침 후 자동 삭제)

서버 (Google Sheets)
└─ 응답 점수만 저장 (영구)
```

### 프라이버시

```
✓ 응답자 ID는 UUID (익명)
✓ 개인 식별 불가능
✓ HTTPS 자동 적용 (GitHub Pages)
✓ Google Sheets 권한 제한 (본인만 접근)
```

---

## 📈 확장 방법

### 1. 척도 추가

```javascript
// config.js의 SCALES 배열에 추가
const SCALES = [
  // ... 기존 척도들 ...
  {
    id: 'crowded',
    label: '붐빈다',
    description: '이 거리가 붐비는가?',
    min_label: '한산함',
    max_label: '매우 붐빔'
  }
];

// apps_script.gs의 헤더에 컬럼 추가
const headers = [..., 'crowded'];

// index.html은 자동 생성됨 (renderScaleForm 함수)
```

### 2. 이미지 수 변경

```javascript
// config.js
const CONFIG = {
  TOTAL_IMAGES: 200,        // 100 → 200
  IMAGES_PER_GROUP: 10,     // 그대로
  TOTAL_GROUPS: 20,         // 10 → 20
};

// apps_script.gs
const groupIndex = currentCount % 20;  // % 10 → % 20
```

### 3. 그룹당 이미지 변경

```javascript
// config.js
const CONFIG = {
  TOTAL_IMAGES: 100,        // 그대로
  IMAGES_PER_GROUP: 20,     // 10 → 20
  TOTAL_GROUPS: 5,          // 10 → 5
  SURVEY_IMAGES: 20,        // 10 → 20
};

// 주의: apps_script.gs의 groupIndex 계산에 영향 없음
// (자동으로 올바른 이미지 개수 반환)
```

---

## 🐛 일반적인 오류 및 해결

### "이미지 그룹을 할당할 수 없습니다"

```
원인: Apps Script URL 오류 또는 스프레드시트 권한 문제

해결:
1. config.js의 APPS_SCRIPT_URL 확인
2. 맨 뒤의 "/exec" 확인
3. Google Apps Script 배포 재확인
4. 스프레드시트 ID 정확성 확인
```

### "이미지를 로드할 수 없습니다"

```
원인: 이미지 파일 경로 오류

해결:
1. assets/images/image001.jpg ~ image100.jpg 확인
2. 파일명 대소문자 확인 (소문자 권장)
3. 파일 크기 확인 (각 500KB 이하)
4. 이미지 형식 확인 (JPG, PNG, WebP)
```

### Google Sheets에 데이터가 저장되지 않음

```
원인: Apps Script 권한 또는 스프레드시트 접근 오류

해결:
1. SPREADSHEET_ID 정확성 확인
2. Apps Script 배포 권한 재확인
3. 구글 계정으로 스프레드시트 접근 가능 확인
4. Apps Script 로그 확인 (Google Apps Script 에디터에서)
```

---

## 📚 관련 문서

본 패키지에 포함된 문서:

| 문서 | 용도 |
|------|------|
| **README.md** | 전체 설치 및 배포 가이드 |
| **SYSTEM_DESIGN.md** | 시스템 설계 및 아키텍처 |
| **DATA_ANALYSIS_GUIDE.md** | Google Sheets 데이터 분석 방법 |
| **TESTING_GUIDE.md** | 배포 전 테스트 체크리스트 |
| **이 문서** | 빠른 시작 및 요약 |

---

## 📞 지원

### 기술 지원

```
1. 콘솔 로그 확인 (F12 → Console)
2. Network 탭에서 API 호출 확인
3. Google Apps Script 로그 확인
4. 위의 "일반적인 오류" 섹션 참고
```

### 추가 커스터마이징

```
1. 척도 변경 → config.js의 SCALES
2. 이미지 경로 변경 → config.js의 getImagePath()
3. UI 스타일 변경 → style.css
4. 배포 URL 변경 → config.js의 APPS_SCRIPT_URL
```

---

## ✅ 배포 체크리스트 (30초)

```
□ index.html: 3개 페이지 모두 있음
□ style.css: 반응형 스타일 있음
□ config.js: SCALES, APPS_SCRIPT_URL 설정
□ app.js: 모든 함수 정의됨
□ assets/images/: image001.jpg ~ image100.jpg
□ Google Sheets: 3개 시트 (Responses, Counter, Respondents)
□ Google Apps Script: 배포 완료, URL 복사
□ config.js: APPS_SCRIPT_URL 업데이트
□ GitHub: 파일 푸시, Pages 활성화

배포 완료! 🎉
```

---

**프로젝트 버전**: 1.0.0  
**최종 업데이트**: 2024년 1월  
**상태**: 프로덕션 준비 완료
