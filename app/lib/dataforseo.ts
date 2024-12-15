import DataForSEOAPI from 'dataforseo-client';

// 檢查環境變數
const login = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!login || !password) {
  console.error('DataForSEO credentials missing:', {
    hasLogin: !!login,
    hasPassword: !!password
  });
  throw new Error('DataForSEO 憑證未在環境變數中設置');
}

// 創建客戶端實例
const client = new DataForSEOAPI({
  login,
  password
});

// 測試連接
client.serp.google.organic.taskGet({ id: "test" })
  .catch(error => {
    console.error('DataForSEO API 初始化測試失敗:', error);
  });

export default client;
