const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const path = require('path');

// 환경변수에서 설정 가져오기
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;
const KEYWORDS = process.env.KEYWORDS ? process.env.KEYWORDS.split(',') : ['AI', '블록체인'];
const SENT_ARTICLES_FILE = path.join(__dirname, 'sent-articles.json');

// 이메일 전송기 설정
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// 이미 전송된 기사 목록 로드
async function loadSentArticles() {
  try {
    const data = await fs.readFile(SENT_ARTICLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 전송된 기사 목록 저장
async function saveSentArticles(articles) {
  await fs.writeFile(SENT_ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

// NewsAPI에서 뉴스 가져오기
async function fetchNews(keyword) {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: keyword,
        language: 'ko',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      }
    });
    
    return response.data.articles || [];
  } catch (error) {
    console.error(`Error fetching news for ${keyword}:`, error.message);
    return [];
  }
}

// 새 기사 필터링
function filterNewArticles(allArticles, sentArticles) {
  return allArticles.filter(article => {
    const articleId = article.url || article.title;
    return !sentArticles.includes(articleId);
  });
}

// 이메일 생성
function createEmailContent(newArticles) {
  let html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .article { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
          .title { color: #007bff; text-decoration: none; font-weight: bold; }
          .title:hover { text-decoration: underline; }
          .description { color: #666; margin-top: 10px; }
          .meta { color: #999; font-size: 0.9em; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📰 최신 뉴스 알림</h2>
          <p>새로운 기사 ${newArticles.length}개를 발견했습니다!</p>
        </div>
  `;

  newArticles.forEach(article => {
    html += `
      <div class="article">
        <a href="${article.url}" class="title" target="_blank">${article.title}</a>
        <div class="description">${article.description || '설명 없음'}</div>
        <div class="meta">
          📅 ${new Date(article.publishedAt).toLocaleString('ko-KR')} | 
          📰 ${article.source.name || '알 수 없음'}
        </div>
      </div>
    `;
  });

  html += `
      </body>
    </html>
  `;

  return html;
}

// 이메일 전송
async function sendEmail(newArticles) {
  if (newArticles.length === 0) {
    console.log('새로운 기사가 없습니다.');
    return;
  }

  const emailContent = createEmailContent(newArticles);
  
  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: `📰 최신 뉴스 알림 - ${newArticles.length}개의 새 기사`,
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`이메일 전송 완료: ${newArticles.length}개 기사`);
  } catch (error) {
    console.error('이메일 전송 실패:', error.message);
  }
}

// 메인 함수
exports.handler = async (event, context) => {
  try {
    // 환경변수 검증
    if (!NEWS_API_KEY || !EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
      throw new Error('필수 환경변수가 설정되지 않았습니다.');
    }

    console.log('뉴스 알림 시스템 시작...');
    
    // 전송된 기사 목록 로드
    const sentArticles = await loadSentArticles();
    
    // 모든 키워드에 대해 뉴스 수집
    let allNewArticles = [];
    
    for (const keyword of KEYWORDS) {
      console.log(`키워드 "${keyword}" 검색 중...`);
      const articles = await fetchNews(keyword);
      const newArticles = filterNewArticles(articles, sentArticles);
      
      // 새 기사에 키워드 정보 추가
      newArticles.forEach(article => {
        article.keyword = keyword;
      });
      
      allNewArticles = allNewArticles.concat(newArticles);
    }

    // 중복 제거 (같은 URL이 여러 키워드에서 나올 수 있음)
    const uniqueArticles = allNewArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );

    if (uniqueArticles.length > 0) {
      // 이메일 전송
      await sendEmail(uniqueArticles);
      
      // 전송된 기사 목록 업데이트
      const newSentArticles = sentArticles.concat(uniqueArticles.map(article => article.url));
      await saveSentArticles(newSentArticles);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '뉴스 알림 처리 완료',
        newArticlesCount: uniqueArticles.length,
        keywords: KEYWORDS
      })
    };

  } catch (error) {
    console.error('오류 발생:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}; 