import ArticleGenerator from './components/ArticleGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center">
      <div className="container mx-auto p-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            SEO 文章生成器
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            使用先進的 AI 技術，快速生成高品質、SEO 優化的文章內容。輸入您的關鍵字，我們將為您創建獨特且吸引人的文章。
          </p>
        </div>
        <ArticleGenerator />
      </div>
    </main>
  )
}
