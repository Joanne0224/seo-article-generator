'use server'

const dataForSeoClient = require('../lib/dataforseo');

interface GenerateArticleParams {
  mainKeyword: string
  secondaryKeywords: string[]
  wordCount: number
  tone: string
}

interface ArticleOutline {
  sections: {
    title: string
    level: 'h2' | 'h3'
    assignedKeywords: string[]
    description?: string
  }[]
}

interface GeneratedArticle {
  title: string
  metaDescription: string
  outline: ArticleOutline
  content: {
    subtitle: string
    paragraphs: string[]
  }[]
  longTailKeywords: string[]
}

function validateArticleResponse(data: any): data is GeneratedArticle {
  return (
    typeof data === 'object' &&
    typeof data.title === 'string' &&
    typeof data.metaDescription === 'string' &&
    Array.isArray(data.content) &&
    Array.isArray(data.longTailKeywords) &&
    data.content.every((section: any) =>
      typeof section.subtitle === 'string' &&
      Array.isArray(section.paragraphs) &&
      section.paragraphs.every((p: any) => typeof p === 'string')
    )
  )
}

async function getKeywordData(keyword: string) {
  try {
    // 建立一個新的 SERP 任務
    const postTask = await dataForSeoClient.serp.google.organic.taskPost({
      data: [{
        language_code: "zh_TW",
        location_code: 2158,  // Taiwan
        keyword: keyword,
        device: "desktop"
      }]
    });

    if (!postTask?.tasks?.[0]?.id) {
      throw new Error('無法創建 SERP 任務');
    }

    // 等待幾秒鐘讓任務完成
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 獲取任務結果
    const taskResult = await dataForSeoClient.serp.google.organic.taskGet({
      id: postTask.tasks[0].id
    });

    return taskResult;
  } catch (error) {
    console.error('獲取關鍵字數據時發生錯誤:', error);
    return null;
  }
}

async function generateArticleFromSERPData(
  mainKeyword: string,
  serpData: any,
  wordCount: number,
  tone: string
): Promise<GeneratedArticle> {
  // 從 SERP 數據中提取標題和描述
  const results = serpData?.tasks?.[0]?.result?.[0]?.items || [];
  const titles = results
    .filter((item: any) => item.type === 'organic')
    .map((item: any) => item.title)
    .slice(0, 5);
  const descriptions = results
    .filter((item: any) => item.type === 'organic')
    .map((item: any) => item.description)
    .slice(0, 5);

  // 生成文章標題
  const title = `${mainKeyword}完整指南：${titles[0] || '專業解析與建議'}`;

  // 生成 Meta Description
  const metaDescription = descriptions[0] || 
    `探索關於${mainKeyword}的完整指南。我們提供專業的分析和實用的建議，幫助您更好地理解這個主題。`;

  // 生成文章大綱
  const outline: ArticleOutline = {
    sections: [
      {
        title: `什麼是${mainKeyword}？`,
        level: 'h2',
        assignedKeywords: [mainKeyword],
        description: '介紹與定義'
      },
      {
        title: `${mainKeyword}的重要性`,
        level: 'h2',
        assignedKeywords: [mainKeyword],
        description: '探討主題的重要性和影響'
      },
      {
        title: `${mainKeyword}的主要特點`,
        level: 'h2',
        assignedKeywords: [mainKeyword],
        description: '分析關鍵特點和要素'
      },
      {
        title: `如何有效運用${mainKeyword}`,
        level: 'h2',
        assignedKeywords: [mainKeyword],
        description: '實用建議和方法'
      },
      {
        title: `${mainKeyword}的常見問題`,
        level: 'h2',
        assignedKeywords: [mainKeyword],
        description: '解答常見疑問'
      }
    ]
  };

  // 從 SERP 數據中提取長尾關鍵字
  const longTailKeywords = results
    .filter((item: any) => item.type === 'related_searches')
    .flatMap((item: any) => item.items || [])
    .map((item: any) => item.title)
    .slice(0, 8);

  // 生成文章內容
  const content = outline.sections.map(section => {
    const paragraphCount = Math.ceil(wordCount / (outline.sections.length * 200));
    const paragraphs = Array(paragraphCount).fill('').map(() => {
      const description = descriptions[Math.floor(Math.random() * descriptions.length)] || '';
      return description + 
        `根據研究顯示，${mainKeyword}在現代社會中扮演著重要角色。` +
        `專家建議，在處理${mainKeyword}相關議題時，應該注意以下幾點：` +
        `首先，要充分理解其核心概念；其次，要掌握正確的方法；最後，要持續學習和改進。`;
    });

    return {
      subtitle: section.title,
      paragraphs
    };
  });

  return {
    title,
    metaDescription,
    outline,
    content,
    longTailKeywords
  };
}

export async function generateArticle({
  mainKeyword,
  secondaryKeywords,
  wordCount,
  tone
}: GenerateArticleParams): Promise<GeneratedArticle | string> {
  try {
    // 首先檢查所有必要參數
    if (!mainKeyword || !secondaryKeywords || !wordCount || !tone) {
      return '錯誤：所有參數都必須提供'
    }

    // 測試 DateForSEO API 連接
    try {
      const testConnection = await dataForSeoClient.serp.google.organic.taskGet({
        id: "test"
      });
      console.log('DateForSEO API 連接成功:', testConnection);
    } catch (error) {
      console.error('DateForSEO API 連接失敗:', error);
      return '錯誤：無法連接到 DateForSEO API'
    }

    // 獲取主關鍵字的 SERP 數據
    const mainKeywordData = await getKeywordData(mainKeyword);
    if (!mainKeywordData) {
      return '錯誤：無法獲取主關鍵字的 SERP 數據'
    }

    // 生成文章
    const article = await generateArticleFromSERPData(
      mainKeyword,
      mainKeywordData,
      wordCount,
      tone
    );

    return article;

  } catch (error) {
    console.error('生成文章時發生錯誤:', error);
    return `錯誤：${error instanceof Error ? error.message : '生成文章時發生未知錯誤'}`
  }
}
