# 📊 데이터 분석 가이드

## 개요

이 문서는 Google Sheets에 저장된 설문 데이터를 분석하는 방법을 설명합니다.

---

## 1. 기초 통계

### 1.1 응답자 수

```javascript
// Google Sheets 함수
= COUNTA(Responses!A:A) - 1  // 헤더 제외

또는

= COUNTIF(Responses!A:A, "<>")  // 빈 셀 제외
```

### 1.2 그룹별 응답자 수

```javascript
= COUNTIF(Responses!C:C, "M_20s")
// C 컬럼은 cohortKey
```

### 1.3 이미지별 평가 수

```javascript
= COUNTIF(Responses!D:D, "image001")
// D 컬럼은 imageId
```

---

## 2. 평균 점수 계산

### 2.1 전체 척도별 평균

```javascript
// 심미성 평균
= AVERAGE(Responses!H:H)

// 우울함 평균
= AVERAGE(Responses!I:I)

// 활력 평균
= AVERAGE(Responses!J:J)

// 안정감 평균
= AVERAGE(Responses!K:K)
```

### 2.2 그룹별 평균

```javascript
// 남성 20대의 심미성 평균
= AVERAGEIF(Responses!F:F, "M_20s", Responses!H:H)

// 여성 30대의 활력 평균
= AVERAGEIF(Responses!F:F, "F_30s", Responses!J:J)
```

### 2.3 이미지별 평균

```javascript
// image001의 심미성 평균
= AVERAGEIF(Responses!D:D, "image001", Responses!H:H)

// image001의 모든 척도 평균
= AVERAGEIF(Responses!D:D, "image001", Responses!H:H)  // 심미
= AVERAGEIF(Responses!D:D, "image001", Responses!I:I)  // 우울
= AVERAGEIF(Responses!D:D, "image001", Responses!J:J)  // 활력
= AVERAGEIF(Responses!D:D, "image001", Responses!K:K)  // 안정
```

---

## 3. 테이블 만들기

### 3.1 응답자 그룹별 평균 분석

**분석 시트 생성**:

1. 새 시트 생성: "Analysis"
2. 다음 테이블 작성:

```
Group | Sample Size | Aesthetic Avg | Depressing Avg | Vitality Avg | Stability Avg
---|---|---|---|---|---
M_10s | =COUNTIF(Responses!F:F,"M_10s") | =AVERAGEIF(...) | ... | ... | ...
M_20s | | | | | |
M_30s | | | | | |
...
F_10s | | | | | |
F_20s | | | | | |
```

### 3.2 이미지별 평균 분석

```
ImageId | Group | Aesthetic | Depressing | Vitality | Stability | Count
---|---|---|---|---|---|---
image001 | group01 | 3.5 | 2.3 | 4.1 | 3.8 | 15
image002 | group01 | 3.2 | 2.5 | 4.3 | 3.6 | 14
image003 | group01 | 3.8 | 2.0 | 4.5 | 4.0 | 13
```

---

## 4. 차트 생성

### 4.1 그룹별 척도 평균 비교 (막대 그래프)

1. 분석 테이블 선택
2. **삽입** → **차트**
3. 차트 종류: "막대 그래프"
4. 가로축: Group
5. 세로축: Aesthetic Avg, Depressing Avg, Vitality Avg, Stability Avg

### 4.2 척도별 분포 (박스 플롯)

```javascript
// Google Sheets에는 박스 플롯이 없으므로
// 다음 방법 사용:
1. 각 척도의 Min, Q1, Median, Q3, Max 계산
2. 열 차트로 표시
```

### 4.3 이미지별 점수 비교 (산점도)

1. 좌표축: X = 심미성, Y = 활력
2. 각 이미지를 점으로 표시
3. 그룹별로 색상 구분

---

## 5. 고급 분석

### 5.1 척도 간 상관관계

```javascript
// 심미성과 활력의 상관계수
= CORREL(Responses!H:H, Responses!J:J)

// 우울함과 안정감의 상관계수
= CORREL(Responses!I:I, Responses!K:K)
```

**해석**:
- 1에 가까우면 양의 상관 (한쪽이 높으면 다른 쪽도 높음)
- -1에 가까우면 음의 상관 (한쪽이 높으면 다른 쪽은 낮음)
- 0에 가까우면 상관 없음

### 5.2 성별별 차이 분석

```javascript
// 남성과 여성의 심미성 평균 비교
남성 = AVERAGEIF(Responses!F:F, "M*", Responses!H:H)
여성 = AVERAGEIF(Responses!F:F, "F*", Responses!H:H)
차이 = 남성 - 여성
```

### 5.3 연령별 차이 분석

```javascript
// 각 연령대별 심미성 평균
10대 = AVERAGEIF(Responses!G:G, "10s", Responses!H:H)
20대 = AVERAGEIF(Responses!G:G, "20s", Responses!H:H)
30대 = AVERAGEIF(Responses!G:G, "30s", Responses!H:H)
...
```

### 5.4 직업별 차이 분석

```javascript
// 학생의 활력 평균
= AVERAGEIF(Responses!H:H, "student", Responses!J:J)

// 직장인의 우울함 평균
= AVERAGEIF(Responses!H:H, "office_worker", Responses!I:I)
```

---

## 6. 통계 검증

### 6.1 신뢰도 분석 (Cronbach's Alpha)

여러 척도가 같은 개념을 측정하는지 확인:

```javascript
// 심미성과 활력의 신뢰도
= CORREL(Responses!H:H, Responses!J:J)
// 값이 0.3 이상이면 어느 정도 신뢰성 있음
```

### 6.2 표본 크기 검증

```javascript
// 각 그룹의 표본 크기 확인
= COUNTIF(Responses!F:F, "M_20s")

// 일반적으로 그룹당 30명 이상 권장
```

---

## 7. 데이터 정제

### 7.1 이상치 제거

```javascript
// 1을 많이 준 응답자 확인 (불성실 응답)
= COUNTIF(1, Responses!H:K) > 5

// 5를 많이 준 응답자 확인 (불성실 응답)
= COUNTIF(5, Responses!H:K) > 5
```

### 7.2 중복 응답 확인

```javascript
// 동일한 응답자ID가 10개 이상인지 확인
= COUNTIF(Responses!A:A, "respondent-id")

// 모든 respondentId가 정확히 10개씩인지 확인
= MODE(COUNTIF(Responses!A:A, Responses!A:A)) = 10
```

---

## 8. 보고서 템플릿

### 8.1 요약 통계

```
=== 응답자 현황 ===
전체 응답자: 120명
남성: 65명 (54%)
여성: 55명 (46%)

연령대 분포:
- 10대: 12명 (10%)
- 20대: 45명 (38%)
- 30대: 35명 (29%)
- 40대: 18명 (15%)
- 50대: 8명 (7%)
- 60대 이상: 2명 (2%)

직업 분포:
- 학생: 48명 (40%)
- 직장인: 52명 (43%)
- ...

=== 척도별 평균 점수 ===
심미성: 3.5 / 5.0 (70%)
우울함: 2.8 / 5.0 (56%)
활력: 3.8 / 5.0 (76%)
안정감: 3.6 / 5.0 (72%)

=== 그룹별 비교 ===
[테이블 삽입]

=== 이미지별 평가 ===
[테이블 삽입]

=== 주요 발견사항 ===
1. ...
2. ...
3. ...
```

---

## 9. Python을 활용한 고급 분석

### 9.1 라이브러리 설치

```bash
pip install pandas numpy scipy matplotlib seaborn
pip install gspread oauth2client  # Google Sheets 연동
```

### 9.2 데이터 로드

```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd

# Google Sheets 인증 (서비스 계정 필요)
scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name(
    'service_account.json', scope)
client = gspread.authorize(creds)

# 스프레드시트 열기
sheet = client.open('Survey Responses').worksheet('Responses')
data = sheet.get_all_records()

# Pandas DataFrame으로 변환
df = pd.DataFrame(data)
```

### 9.3 기초 통계

```python
# 척도별 기초 통계
print(df[['aesthetic', 'depressing', 'vitality', 'stability']].describe())

# 그룹별 평균
print(df.groupby('gender')[['aesthetic', 'vitality']].mean())

# 상관 행렬
print(df[['aesthetic', 'depressing', 'vitality', 'stability']].corr())
```

### 9.4 시각화

```python
import matplotlib.pyplot as plt
import seaborn as sns

# 척도별 분포
sns.violinplot(data=df[['aesthetic', 'depressing', 'vitality', 'stability']])
plt.show()

# 그룹별 비교
sns.boxplot(x='gender', y='aesthetic', data=df)
plt.show()

# 상관 행렬 히트맵
sns.heatmap(df[['aesthetic', 'depressing', 'vitality', 'stability']].corr(),
            annot=True, cmap='coolwarm')
plt.show()
```

---

## 10. 자주 하는 질문

### Q: 어떤 척도가 가장 중요한가?
**A**: 연구 목표에 따라 다릅니다. 보통 심미성(aesthetic)이 가장 중요하게 취급됩니다.

### Q: 표본 크기는 충분한가?
**A**: 일반적으로:
- 그룹당 30명 이상: 신뢰성 좋음
- 그룹당 10~30명: 중간 수준
- 그룹당 10명 미만: 신뢰성 낮음

### Q: 이상치를 어떻게 처리할까?
**A**: 
1. 먼저 이상치 여부 판단 (문맥상 타당한지 확인)
2. 불성실 응답은 제거
3. 정당한 이상치는 보관 후 분석

### Q: 어떤 통계 검정을 사용해야 하나?
**A**: 데이터와 연구 질문에 따라:
- T-검정: 두 그룹 비교 (성별)
- ANOVA: 세 개 이상 그룹 비교 (연령대)
- 상관분석: 척도 간 관계
- 회귀분석: 영향 요인 분석

---

**마지막 수정**: 2024년 1월
