const axios = require('axios');

// 스케줄된 함수 - 정기적으로 실행됨
exports.handler = async (event, context) => {
  try {
    console.log('스케줄된 뉴스 알림 시작...');
    
    // 뉴스 알림 함수 호출
    const response = await axios.post(`${process.env.URL}/.netlify/functions/news-notification`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('뉴스 알림 함수 실행 완료:', response.data);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '스케줄된 뉴스 알림 실행 완료',
        result: response.data
      })
    };
    
  } catch (error) {
    console.error('스케줄된 뉴스 알림 오류:', error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}; 