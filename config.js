/**
 * config.js - 설문 시스템 설정
 * 이 파일에서 주요 파라미터를 수정합니다.
 */

// ✅ 사용자 설정 영역
const CONFIG = {
  // Google Apps Script Web App URL (필수)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  
  // GitHub 저장소 설정 (로컬 이미지 사용 시)
  GITHUB_RAW: "https://raw.githubusercontent.com/your-username/your-repo/main/assets/images",
  
  // 이미지 그룹 설정
  TOTAL_IMAGES: 100,           // 전체 이미지 수
  IMAGES_PER_GROUP: 10,        // 그룹당 이미지 수
  TOTAL_GROUPS: 10,            // 전체 그룹 수
  SURVEY_IMAGES: 10,           // 한 응답자가 평가할 이미지 수
  
  // 타임아웃 설정
  TIMEOUT_FETCH: 10000,        // 10초
  TIMEOUT_IMAGE_LOAD: 8000,    // 8초
};

// 리커트 척도 정의 (쉽게 추가/수정 가능)
const SCALES = [
  {
    id: 'aesthetic',
    label: '심미적이다',
    description: '이 거리는 시각적으로 매력적인가?',
    min_label: '전혀 아님',
    max_label: '매우 그러함'
  },
  {
    id: 'depressing',
    label: '우울하게 느껴진다',
    description: '이 거리가 우울하거나 답답하게 느껴지는가?',
    min_label: '전혀 아님',
    max_label: '매우 그러함'
  },
  {
    id: 'vitality',
    label: '활력이 느껴진다',
    description: '이 거리에서 활기와 에너지를 느끼는가?',
    min_label: '전혀 아님',
    max_label: '매우 그러함'
  },
  {
    id: 'stability',
    label: '안정감이 느껴진다',
    description: '이 거리에서 안정감과 편안함을 느끼는가?',
    min_label: '전혀 아님',
    max_label: '매우 그러함'
  }
];

// 성별 및 연령대 옵션
const GENDER_OPTIONS = {
  'M': '남성',
  'F': '여성'
};

const AGE_OPTIONS = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s_plus': '60대 이상'
};

const OCCUPATION_OPTIONS = {
  'student': '학생',
  'office_worker': '직장인',
  'self_employed': '자영업자',
  'service_worker': '서비스/현장 노동자',
  'freelancer': '프리랜서',
  'homemaker': '주부',
  'unemployed': '무직',
  'retired': '은퇴',
  'other': '기타'
};

/**
 * 이미지 ID 생성 함수
 * @param {number} index - 이미지 인덱스 (0~99)
 * @returns {string} 이미지 ID (image001 ~ image100)
 */
function getImageId(index) {
  return `image${String(index + 1).padStart(3, '0')}`;
}

/**
 * 이미지 그룹 ID 생성 함수
 * @param {number} groupIndex - 그룹 인덱스 (0~9)
 * @returns {string} 그룹 ID (group01 ~ group10)
 */
function getGroupId(groupIndex) {
  return `group${String(groupIndex + 1).padStart(2, '0')}`;
}

/**
 * 이미지 경로 생성 함수 (로컬 또는 GitHub)
 * @param {string} imageId - 이미지 ID
 * @returns {string} 이미지 경로
 */
function getImagePath(imageId) {
  // 로컬 경로 사용 (상대경로)
  return `assets/images/${imageId}.jpg`;
  
  // 또는 GitHub에서 로드 (아래 주석 해제)
  // return `${CONFIG.GITHUB_RAW}/${imageId}.jpg`;
}

/**
 * 그룹 내 이미지 ID 목록 반환
 * @param {number} groupIndex - 그룹 인덱스 (0~9)
 * @returns {string[]} 이미지 ID 배열
 */
function getImagesByGroup(groupIndex) {
  const startIndex = groupIndex * CONFIG.IMAGES_PER_GROUP;
  const endIndex = startIndex + CONFIG.IMAGES_PER_GROUP;
  const imageIds = [];
  
  for (let i = startIndex; i < endIndex; i++) {
    imageIds.push(getImageId(i));
  }
  
  return imageIds;
}

/**
 * Cohort 키 생성 (성별 + 연령대)
 * @param {string} gender - 성별 ("M" or "F")
 * @param {string} age - 연령대 ("10s", "20s", ... "60s_plus")
 * @returns {string} Cohort 키
 */
function generateCohortKey(gender, age) {
  return `${gender}_${age}`;
}

/**
 * 응답자 UUID 생성
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 로컬 스토리지 헬퍼 함수
 */
const StorageManager = {
  setRespondent(respondent) {
    sessionStorage.setItem('survey_respondent', JSON.stringify(respondent));
  },
  
  getRespondent() {
    const data = sessionStorage.getItem('survey_respondent');
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentState(state) {
    sessionStorage.setItem('survey_state', JSON.stringify(state));
  },
  
  getCurrentState() {
    const data = sessionStorage.getItem('survey_state');
    return data ? JSON.parse(data) : null;
  },
  
  setResponses(responses) {
    sessionStorage.setItem('survey_responses', JSON.stringify(responses));
  },
  
  getResponses() {
    const data = sessionStorage.getItem('survey_responses');
    return data ? JSON.parse(data) : [];
  },
  
  clear() {
    sessionStorage.removeItem('survey_respondent');
    sessionStorage.removeItem('survey_state');
    sessionStorage.removeItem('survey_responses');
  }
};

/**
 * 로깅 유틸리티
 */
const Logger = {
  log(message, data = null) {
    console.log(`[Survey] ${message}`, data || '');
  },
  
  error(message, error = null) {
    console.error(`[Survey Error] ${message}`, error || '');
  },
  
  warn(message, data = null) {
    console.warn(`[Survey Warning] ${message}`, data || '');
  }
};
