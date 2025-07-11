const https = require('https');
const { parseString } = require('xml2js');

// 모니터링할 키워드들
const KEYWORDS = ['AI', 'artificial intelligence', 'machine learning'];

exports.handler = async function(event, context) {
  try {
    console.log('News monitoring function triggered at:', new Date().toISOString());
    
    const results = [];
    
    for (const keyword of KEYWORDS) {
      try {
        const newsData = await fetchGoogleNews(keyword);
        results.push({
          keyword: keyword,
          articles: newsData,
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
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          parseString(data, (err, result) => {
            if (err) {
              reject(new Error(`XML parsing error: ${err.message}`));
              return;
            }
            
            try {
              const articles = result.rss.channel[0].item || [];
              const processedArticles = articles.slice(0, 5).map(item => ({
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