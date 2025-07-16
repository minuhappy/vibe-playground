const https = require('https');
const { parseString } = require('xml2js');
// const { callGemini } = require('./gemini'); // Gemini 호출이 필요 없으니 주석 처리

const KEYWORDS = ['AI', '카카오', '네이버']; // 여러 키워드 사용 시 배열에 추가

function fetchGoogleNewsArticles(keyword) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
        parseString(data, (err, result) => {
          if (err) return reject(new Error(`XML parsing error: ${err.message}`));
          try {
            const items = result.rss.channel[0].item || [];
            const articles = items.slice(0, 20).map(item => ({
              title: item.title[0],
              link: item.link[0]
            }));
            resolve(articles);
          } catch (parseError) {
            reject(new Error(`Data parsing error: ${parseError.message}`));
          }
        });
      });
    }).on('error', err => reject(new Error(`Request error: ${err.message}`)));
  });
}

exports.handler = async function(event, context) {
  const results = [];
  for (const keyword of KEYWORDS) {
    try {
      const articles = await fetchGoogleNewsArticles(keyword);
      results.push({
        keyword,
        articles
      });
    } catch (error) {
      results.push({
        keyword,
        articles: []
      });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  };
}; 