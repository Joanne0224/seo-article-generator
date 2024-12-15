'use client'

import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { generateArticle } from '../actions/generateArticle'
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"

interface GeneratedArticle {
  title: string
  metaDescription: string
  content: {
    subtitle: string
    paragraphs: string[]
  }[]
  longTailKeywords: string[]
}

export default function ArticleGenerator() {
  const [mainKeyword, setMainKeyword] = useState('')
  const [secondaryKeywords, setSecondaryKeywords] = useState([''])
  const [wordCount, setWordCount] = useState(500)
  const [tone, setTone] = useState('專業')
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleAddKeyword = () => {
    setSecondaryKeywords([...secondaryKeywords, ''])
  }

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...secondaryKeywords]
    newKeywords[index] = value
    setSecondaryKeywords(newKeywords)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setGeneratedArticle(null)
    try {
      const result = await generateArticle({
        mainKeyword,
        secondaryKeywords: secondaryKeywords.filter(k => k.trim() !== ''),
        wordCount,
        tone
      })
      if (typeof result === 'string') {
        setError(result)
      } else {
        setGeneratedArticle(result)
      }
    } catch (error) {
      console.error('Error generating article:', error)
      setError('生成文章時發生未知錯誤，請稍後再試。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="main-keyword" className="text-gray-300 block text-center">主要關鍵字</Label>
            <Input
              id="main-keyword"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              required
              placeholder="例如：感情挽回"
              className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="word-count" className="text-gray-300 block text-center">文章字數</Label>
            <Input
              id="word-count"
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              min={100}
              max={2000}
              required
              className="mt-2 bg-gray-700 border-gray-600 text-white text-center"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300 block text-center">次要關鍵字</Label>
          <div className="space-y-2">
            {secondaryKeywords.map((keyword, index) => (
              <Input
                key={index}
                value={keyword}
                onChange={(e) => handleKeywordChange(index, e.target.value)}
                placeholder={index === 0 ? "例如：如何挽回前男友" : `次要關鍵字 ${index + 1}`}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-center"
              />
            ))}
          </div>
          <div className="text-center">
            <Button 
              type="button" 
              onClick={handleAddKeyword} 
              className="mt-2 bg-gray-700 hover:bg-gray-600"
              variant="outline"
            >
              + 新增關鍵字
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone" className="text-gray-300 block text-center">文章語氣</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white text-center">
              <SelectValue placeholder="選擇文章語氣" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600 text-white">
              <SelectItem value="專業">專業</SelectItem>
              <SelectItem value="溫暖">溫暖</SelectItem>
              <SelectItem value="中立">中立</SelectItem>
              <SelectItem value="勵志">勵志</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8"
          >
            {isLoading ? '生成中...' : '生成文章'}
          </Button>

          {generatedArticle && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isPreviewMode ? '返回編輯' : '預覽文章'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 text-red-400 font-bold text-center bg-red-900/50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {generatedArticle && !isPreviewMode && (
        <Card className="mt-8 bg-gray-800 border-gray-700">
          <CardHeader className="text-center border-b border-gray-700">
            <CardTitle className="text-2xl text-white">{generatedArticle.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Meta Description</h3>
                <p className="text-gray-400">{generatedArticle.metaDescription}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">文章內容</h3>
                {generatedArticle.content.map((section, index) => (
                  <div key={index} className="mt-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-3 text-center">{section.subtitle}</h4>
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-400 mb-4 leading-relaxed text-justify">{paragraph}</p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">長尾關鍵字</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {generatedArticle.longTailKeywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedArticle && isPreviewMode && (
        <div className="mt-8 prose prose-invert max-w-none bg-gray-800 p-8 rounded-lg">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              {generatedArticle.title}
            </h1>
            
            {/* Meta Description Preview */}
            <div className="mb-8 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Meta Description 預覽</h3>
              <p className="text-gray-300 text-sm">{generatedArticle.metaDescription}</p>
            </div>

            {/* Article Content */}
            <div className="space-y-8">
              {generatedArticle.content.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-center text-gray-200 bg-gradient-to-r from-blue-400/10 to-purple-500/10 py-2">
                    {section.subtitle}
                  </h2>
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-400 leading-relaxed text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Keywords Tags */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">相關關鍵字</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {generatedArticle.longTailKeywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full text-sm text-gray-300 border border-gray-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
