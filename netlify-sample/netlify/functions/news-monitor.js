const https = require('https');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { parseString } = require('xml2js');

// 모니터링할 키워드들
const KEYWORDS = ['AI', 'artificial intelligence', 'machine learning'];
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async function(event, context) {
  try {
    console.log('News monitoring function triggered at:', new Date().toISOString());
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not set. Please set GEMINI_API_KEY environment variable.');
    }
    const results = [];
    for (const keyword of KEYWORDS) {
      try {
        const newsData = await fetchGoogleNews(keyword);
        // 각 기사에 대해 요약 추가
        const articlesWithSummary = await Promise.all(newsData.map(async (article) => {
          let summary = '';
          try {
            const articleText = await fetchArticleText(article.link);
            summary = await summarizeWithGemini(articleText, GEMINI_API_KEY);
          } catch (err) {
            summary = `요약 실패: ${err.message}`;
          }
          return { ...article, summary };
        }));
        results.push({
          keyword: keyword,
          articles: articlesWithSummary,
          timestamp: new Date().toISOString()
        });
        console.log(`Found ${newsData.length} articles for keyword: ${keyword}`);
      } catch (error) {
        console.error(`Error fetching news for keyword "${keyword}":`, error.message);
        results.push({
          keyword: keyword,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'News monitoring completed',
        results: results,
        totalKeywords: KEYWORDS.length,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

function fetchGoogleNews(keyword) {
  return new Promise((resolve, reject) => {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          parseString(data, (err, result) => {
            if (err) {
              reject(new Error(`XML parsing error: ${err.message}`));
              return;
            }
            try {
              const articles = result.rss.channel[0].item || [];
              const processedArticles = articles.slice(0, 3).map(item => ({
                title: item.title[0],
                link: item.link[0],
                pubDate: item.pubDate[0],
                description: item.description ? item.description[0] : ''
              }));
              resolve(processedArticles);
            } catch (parseError) {
              reject(new Error(`Data parsing error: ${parseError.message}`));
            }
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Request error: ${err.message}`));
    });
  });
}

async function fetchArticleText(url) {
  // 구글 뉴스 링크는 실제 기사로 redirect되므로, 첫 번째 redirect를 따라가서 본문을 추출
  const res = await fetch(url, { redirect: 'follow' });
  const html = await res.text();
  const $ = cheerio.load(html);
  // 가장 단순하게 body 전체 텍스트를 추출 (실제 서비스에서는 더 정교한 추출 필요)
  let text = $('body').text();
  text = text.replace(/\s+/g, ' ').trim();
  // Gemini API 입력 제한(4,000자 내외) 고려
  return text.slice(0, 4000);
}

async function summarizeWithGemini(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  debugger
  const body = {
    contents: [
      {
        parts: [
          { text: `다음 뉴스 기사 내용을 요약해줘:\n${text}` }
        ]
      }
    ]
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '요약 결과 없음';
} 