# 📰 뉴스 알림 시스템

Netlify Functions를 사용하여 특정 키워드의 최신 뉴스를 자동으로 수집하고 이메일로 알림을 보내는 시스템입니다.

## 🚀 주요 기능

- **자동 뉴스 수집**: NewsAPI를 통해 지정된 키워드의 최신 뉴스를 수집
- **중복 방지**: 이미 전송된 기사는 다시 전송하지 않음
- **이메일 알림**: 수집된 뉴스를 아름다운 HTML 이메일로 전송
- **스케줄링**: 정기적으로 자동 실행 (1시간마다)

## 📋 필수 환경변수 설정

Netlify 대시보드에서 다음 환경변수들을 설정해주세요:

### 1. NewsAPI 설정
```
NEWS_API_KEY=your_news_api_key_here
```
- [NewsAPI.org](https://newsapi.org/)에서 무료 API 키 발급
- 하루 1,000회 요청 가능 (무료 플랜)

### 2. 이메일 설정 (Gmail 사용)
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_TO=recipient@example.com
```
- Gmail 앱 비밀번호 사용 필요 (2단계 인증 활성화 후 생성)
- [Gmail 앱 비밀번호 생성 방법](https://support.google.com/accounts/answer/185833)

### 3. 키워드 설정 (선택사항)
```
KEYWORDS=AI,블록체인,머신러닝
```
- 기본값: `AI,블록체인`
- 쉼표로 구분하여 여러 키워드 설정 가능

## 🛠️ 설치 및 배포

### 1. 로컬 개발
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

### 2. Netlify 배포
1. GitHub에 코드 푸시
2. Netlify에서 새 사이트 생성 (GitHub 연결)
3. 환경변수 설정
4. 배포 완료!

## ⏰ 스케줄링 설정

### 방법 1: Netlify Scheduled Functions (권장)
`netlify.toml`에 다음 설정 추가:
```toml
[functions."scheduled-news"]
  schedule = "0 * * * *"  # 매시간 실행
```

### 방법 2: 외부 크론 서비스
- [Cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)
- URL: `https://your-site.netlify.app/.netlify/functions/scheduled-news`

## 📧 이메일 예시

수신되는 이메일은 다음과 같은 형태입니다:

```
📰 최신 뉴스 알림 - 3개의 새 기사

┌─────────────────────────────────────┐
│ AI 기술의 최신 발전 동향            │
│ 인공지능 분야에서 혁신적인 연구...  │
│ 📅 2024-01-15 14:30 | 📰 TechNews  │
└─────────────────────────────────────┘
```

## 🔧 커스터마이징

### 키워드 변경
환경변수 `KEYWORDS`에서 쉼표로 구분하여 설정:
```
KEYWORDS=AI,블록체인,머신러닝,메타버스
```

### 이메일 템플릿 수정
`netlify/functions/news-notification.js`의 `createEmailContent` 함수를 수정하여 이메일 디자인을 변경할 수 있습니다.

### 뉴스 소스 변경
현재는 NewsAPI를 사용하지만, 다른 뉴스 API로 변경 가능:
- Google News RSS
- Naver News API
- 기타 뉴스 API

## 🐛 문제 해결

### 이메일이 전송되지 않는 경우
1. Gmail 앱 비밀번호가 올바른지 확인
2. 2단계 인증이 활성화되어 있는지 확인
3. 환경변수가 올바르게 설정되었는지 확인

### 뉴스가 수집되지 않는 경우
1. NewsAPI 키가 유효한지 확인
2. 일일 요청 한도를 초과하지 않았는지 확인
3. 키워드가 올바르게 설정되었는지 확인

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트나 기능 제안은 언제든 환영합니다! 