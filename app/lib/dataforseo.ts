const DataForSEOAPI = require('dataforseo-client');

// 設定 DataForSEO 憑證
const login = 'guest@getlove.com.tw';
const password = 'd471643183f49cc0';

// 創建客戶端實例
const client = new DataForSEOAPI.RestClient(login, password);

// 測試連接
client.serp.google.organic.taskGet({ id: "test" })
  .catch(error => {
    console.error('DataForSEO API 初始化測試失敗:', error);
  });

module.exports = client;
