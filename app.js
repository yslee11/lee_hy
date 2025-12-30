/**
 * app.js - 가로경관 인식 조사 메인 애플리케이션
 */

// 전역 상태
const AppState = {
  currentPage: 'intro',
  respondent: null,
  respondentId: null,
  imageGroupId: null,
  imageIds: [],
  currentImageIndex: 0,
  responses: [],
  isLoading: false,
  error: null
};

// ==========================================
// 초기화
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  Logger.log('애플리케이션 초기화 시작');
  
  // 로컬 상태 복구
  restoreState();
  
  // 이벤트 리스너 등록
  setupEventListeners();
  
  // 체크박스로 시작 버튼 활성화
  document.querySelector('input[name="agreement"]').addEventListener('change', updateStartButton);
  
  Logger.log('애플리케이션 초기화 완료');
});

/**
 * 로컬 상태 복구
 */
function restoreState() {
  const savedRespondent = StorageManager.getRespondent();
  const savedState = StorageManager.getCurrentState();
  
  if (savedRespondent && savedState) {
    AppState.respondent = savedRespondent;
    AppState.respondentId = savedState.respondentId;
    AppState.imageGroupId = savedState.imageGroupId;
    AppState.imageIds = savedState.imageIds;
    AppState.currentImageIndex = savedState.currentImageIndex;
    AppState.currentPage = savedState.currentPage;
    AppState.responses = StorageManager.getResponses();
    
    Logger.log('상태 복구 완료', {
      respondent: AppState.respondent,
      currentImageIndex: AppState.currentImageIndex
    });
    
    // 복구된 페이지로 이동
    showPage(AppState.currentPage);
  }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 페이지 1: 시작 버튼
  document.getElementById('btn-start').addEventListener('click', handleStartSurvey);
  
  // 페이지 2: 다음/이전 버튼
  document.getElementById('btn-next').addEventListener('click', handleNextQuestion);
  document.getElementById('btn-prev').addEventListener('click', handlePrevQuestion);
  
  // 페이지 3: 다시 시작 버튼
  document.getElementById('btn-restart').addEventListener('click', handleRestart);
}

/**
 * 시작 버튼 활성화 상태 업데이트
 */
function updateStartButton() {
  const gender = document.querySelector('input[name="gender"]:checked');
  const age = document.getElementById('intro-age').value;
  const occupation = document.getElementById('intro-occupation').value;
  const agreement = document.querySelector('input[name="agreement"]:checked');
  
  const isValid = gender && age && occupation && agreement;
  document.getElementById('btn-start').disabled = !isValid;
}

// ==========================================
// 페이지 전환
// ==========================================

/**
 * 페이지 표시
 */
function showPage(pageId) {
  // 모든 페이지 숨기기
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 선택한 페이지 표시
  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
    AppState.currentPage = pageId;
    
    // 페이지별 초기화
    if (pageId === 'survey') {
      loadImagePage();
    }
  }
}

// ==========================================
// 페이지 1: 기본 정보 입력
// ==========================================

/**
 * 설문 시작 처리
 */
async function handleStartSurvey() {
  Logger.log('설문 시작 처리');
  
  try {
    // 응답자 정보 수집
    const respondent = {
      gender: document.querySelector('input[name="gender"]:checked').value,
      age: document.getElementById('intro-age').value,
      occupation: document.getElementById('intro-occupation').value
    };
    
    Logger.log('응답자 정보', respondent);
    
    // 로딩 표시
    setLoading(true);
    
    // 서버에서 이미지 그룹 할당
    const assignmentResult = await assignImageGroup(respondent);
    
    if (assignmentResult.success) {
      AppState.respondent = respondent;
      AppState.respondentId = assignmentResult.respondentId;
      AppState.imageGroupId = assignmentResult.imageGroupId;
      AppState.imageIds = assignmentResult.imageIds;
      AppState.currentImageIndex = 0;
      AppState.responses = [];
      
      // 상태 저장
      saveState();
      
      Logger.log('이미지 그룹 할당 완료', {
        respondentId: AppState.respondentId,
        imageGroupId: AppState.imageGroupId,
        imageCount: AppState.imageIds.length
      });
      
      // 설문 페이지로 이동
      showPage('survey');
    } else {
      showError('이미지 그룹을 할당할 수 없습니다. 다시 시도해주세요.');
    }
  } catch (error) {
    Logger.error('설문 시작 오류', error);
    showError('시작 중에 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    setLoading(false);
  }
}

/**
 * 이미지 그룹 할당 요청
 */
async function assignImageGroup(respondent) {
  try {
    const payload = {
      action: 'assignGroup',
      gender: respondent.gender,
      age: respondent.age,
      occupation: respondent.occupation
    };
    
    Logger.log('그룹 할당 요청', payload);
    
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }
    
    const result = await response.json();
    
    Logger.log('그룹 할당 응답', result);
    
    if (result.success) {
      return {
        success: true,
        respondentId: result.respondentId,
        imageGroupId: result.imageGroupId,
        imageIds: result.imageIds
      };
    } else {
      throw new Error(result.message || '그룹 할당 실패');
    }
  } catch (error) {
    Logger.error('그룹 할당 요청 오류', error);
    throw error;
  }
}

// ==========================================
// 페이지 2: 이미지 평가
// ==========================================

/**
 * 이미지 페이지 로드
 */
async function loadImagePage() {
  Logger.log(`이미지 페이지 로드: ${AppState.currentImageIndex + 1} / ${AppState.imageIds.length}`);
  
  try {
    // 진행 상태 업데이트
    updateProgress();
    
    // 척도 폼 생성
    renderScaleForm();
    
    // 이미지 로드
    await loadImage();
    
    // 버튼 상태 업데이트
    updateNavigationButtons();
    
  } catch (error) {
    Logger.error('이미지 페이지 로드 오류', error);
    showError('이미지를 로드할 수 없습니다. 다시 시도해주세요.');
  }
}

/**
 * 진행 상태 업데이트
 */
function updateProgress() {
  const current = AppState.currentImageIndex + 1;
  const total = AppState.imageIds.length;
  
  document.getElementById('progress-text').textContent = `${current} / ${total}`;
  
  const progressPercent = (current / total) * 100;
  document.getElementById('progress-fill').style.width = `${progressPercent}%`;
}

/**
 * 척도 폼 렌더링
 */
function renderScaleForm() {
  const container = document.getElementById('scales-container');
  container.innerHTML = '';
  
  SCALES.forEach((scale, index) => {
    const scaleElement = document.createElement('div');
    scaleElement.className = 'scale-item';
    scaleElement.innerHTML = `
      <label class="scale-label">
        <span class="scale-title">${index + 1}. ${scale.label}</span>
        <span class="scale-description">${scale.description}</span>
      </label>
      <div class="scale-options">
        <label class="scale-option">
          <input type="radio" name="${scale.id}" value="1" required>
          <span class="scale-value">1</span>
          <span class="scale-text">${scale.min_label}</span>
        </label>
        <label class="scale-option">
          <input type="radio" name="${scale.id}" value="2">
          <span class="scale-value">2</span>
        </label>
        <label class="scale-option">
          <input type="radio" name="${scale.id}" value="3">
          <span class="scale-value">3</span>
        </label>
        <label class="scale-option">
          <input type="radio" name="${scale.id}" value="4">
          <span class="scale-value">4</span>
        </label>
        <label class="scale-option">
          <input type="radio" name="${scale.id}" value="5" required>
          <span class="scale-value">5</span>
          <span class="scale-text">${scale.max_label}</span>
        </label>
      </div>
    `;
    
    container.appendChild(scaleElement);
  });
  
  // 라디오 버튼 변경 감지
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', updateNavigationButtons);
  });
}

/**
 * 이미지 로드
 */
async function loadImage() {
  return new Promise((resolve, reject) => {
    const imageId = AppState.imageIds[AppState.currentImageIndex];
    const imagePath = getImagePath(imageId);
    
    const img = document.getElementById('survey-image');
    const spinner = document.getElementById('loading-spinner');
    
    // 로딩 표시
    spinner.style.display = 'block';
    img.style.display = 'none';
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      spinner.style.display = 'none';
      reject(new Error('이미지 로드 타임아웃'));
    }, CONFIG.TIMEOUT_IMAGE_LOAD);
    
    img.onload = function() {
      clearTimeout(timeoutId);
      spinner.style.display = 'none';
      img.style.display = 'block';
      clearErrorMessage();
      resolve();
    };
    
    img.onerror = function() {
      clearTimeout(timeoutId);
      spinner.style.display = 'none';
      reject(new Error(`이미지 로드 실패: ${imagePath}`));
    };
    
    img.src = imagePath;
  });
}

/**
 * 네비게이션 버튼 상태 업데이트
 */
function updateNavigationButtons() {
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  
  // 이전 버튼: 첫 번째 이미지일 때 비활성화
  prevBtn.disabled = AppState.currentImageIndex === 0;
  
  // 다음 버튼: 모든 척도에 응답할 때만 활성화
  const allAnswered = SCALES.every(scale => {
    return document.querySelector(`input[name="${scale.id}"]:checked`);
  });
  nextBtn.disabled = !allAnswered;
}

/**
 * 척도 응답 수집
 */
function collectScores() {
  const scores = {};
  
  SCALES.forEach(scale => {
    const selectedValue = document.querySelector(`input[name="${scale.id}"]:checked`);
    scores[scale.id] = parseInt(selectedValue.value);
  });
  
  return scores;
}

/**
 * 다음 이미지 처리
 */
async function handleNextQuestion() {
  Logger.log(`다음 이미지 처리: ${AppState.currentImageIndex + 1}`);
  
  try {
    // 응답 수집
    const scores = collectScores();
    const imageId = AppState.imageIds[AppState.currentImageIndex];
    
    const response = {
      timestamp: new Date().toISOString(),
      respondentId: AppState.respondentId,
      imageId: imageId,
      imageGroupId: AppState.imageGroupId,
      imageIndex: AppState.currentImageIndex,
      respondent: AppState.respondent,
      scores: scores
    };
    
    AppState.responses.push(response);
    StorageManager.setResponses(AppState.responses);
    
    Logger.log('응답 저장', response);
    
    // 마지막 이미지 체크
    if (AppState.currentImageIndex >= AppState.imageIds.length - 1) {
      // 모든 응답 제출
      await submitAllResponses();
    } else {
      // 다음 이미지 로드
      AppState.currentImageIndex++;
      saveState();
      await loadImagePage();
    }
  } catch (error) {
    Logger.error('다음 이미지 처리 오류', error);
    showError('오류가 발생했습니다. 다시 시도해주세요.');
  }
}

/**
 * 이전 이미지 처리
 */
async function handlePrevQuestion() {
  Logger.log(`이전 이미지 처리: ${AppState.currentImageIndex}`);
  
  if (AppState.currentImageIndex > 0) {
    // 현재 응답 삭제
    AppState.responses.pop();
    StorageManager.setResponses(AppState.responses);
    
    AppState.currentImageIndex--;
    saveState();
    await loadImagePage();
  }
}

/**
 * 모든 응답 제출
 */
async function submitAllResponses() {
  Logger.log('모든 응답 제출 시작', {
    totalResponses: AppState.responses.length
  });
  
  try {
    setLoading(true);
    
    const payload = {
      action: 'submitResponses',
      respondentId: AppState.respondentId,
      responses: AppState.responses
    };
    
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }
    
    const result = await response.json();
    
    Logger.log('응답 제출 결과', result);
    
    if (result.success) {
      // 완료 페이지로 이동
      StorageManager.clear();
      AppState.currentPage = 'complete';
      saveState();
      showPage('complete');
    } else {
      throw new Error(result.message || '응답 제출 실패');
    }
  } catch (error) {
    Logger.error('응답 제출 오류', error);
    showError('응답을 제출할 수 없습니다. 다시 시도해주세요.');
  } finally {
    setLoading(false);
  }
}

// ==========================================
// 페이지 3: 완료
// ==========================================

/**
 * 다시 시작 처리
 */
function handleRestart() {
  Logger.log('설문 다시 시작');
  
  // 상태 초기화
  StorageManager.clear();
  
  AppState.respondent = null;
  AppState.respondentId = null;
  AppState.imageGroupId = null;
  AppState.imageIds = [];
  AppState.currentImageIndex = 0;
  AppState.responses = [];
  AppState.currentPage = 'intro';
  
  // 폼 초기화
  document.getElementById('form-intro').reset();
  document.getElementById('btn-start').disabled = true;
  
  // 첫 페이지로 이동
  showPage('intro');
}

// ==========================================
// 유틸리티 함수
// ==========================================

/**
 * 상태 저장
 */
function saveState() {
  StorageManager.setRespondent(AppState.respondent);
  
  const state = {
    respondentId: AppState.respondentId,
    imageGroupId: AppState.imageGroupId,
    imageIds: AppState.imageIds,
    currentImageIndex: AppState.currentImageIndex,
    currentPage: AppState.currentPage
  };
  
  StorageManager.setCurrentState(state);
}

/**
 * 로딩 상태 설정
 */
function setLoading(isLoading) {
  AppState.isLoading = isLoading;
  
  if (isLoading) {
    document.body.style.opacity = '0.6';
    document.body.style.pointerEvents = 'none';
  } else {
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
  }
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  } else {
    alert(message);
  }
}

/**
 * 에러 메시지 제거
 */
function clearErrorMessage() {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}
