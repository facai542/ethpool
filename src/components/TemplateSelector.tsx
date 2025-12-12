'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Eye, Image } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Template {
  id: number
  name: string
  description: string
  style: string
  config: any
  preview_image: string
  is_default: boolean
}

interface TemplateSelectorProps {
  selectedTemplateId?: number
  onTemplateSelect: (template: Template) => void
  onPreview?: (template: Template) => void
}

// 模板编号映射
const getTemplateNumber = (templateId: number) => {
  const numberMap: { [key: number]: string } = {
    5: '一',
    6: '二', 
    7: '三',
    8: '四',
    9: '五',
    10: '六',
    11: '七'
  }
  return numberMap[templateId] || '未知'
}

export function TemplateSelector({ 
  selectedTemplateId, 
  onTemplateSelect,
  onPreview 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/announcement-templates')
      if (response.ok) {
        const data = await response.json()
        // 确保data是数组并且每个元素都有必要的属性
        if (Array.isArray(data)) {
          const validTemplates = data.filter(template => 
            template && 
            typeof template.id === 'number' && 
            typeof template.name === 'string'
          )
          const sortedTemplates = validTemplates.sort((a: Template, b: Template) => a.id - b.id)
          setTemplates(sortedTemplates)
        } else {
          console.error('Invalid templates data format:', data)
          setTemplates([])
        }
      } else {
        console.error('Failed to fetch templates:', response.status)
        setTemplates([])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template)
    setShowPreview(true)
    onPreview?.(template)
  }

  const handleSelect = (template: Template) => {
    onTemplateSelect(template)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-40 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Image size={20} />
          选择公告模板样式
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => {
            if (!template || !template.id) return null
            
            const templateNumber = getTemplateNumber(template.id)
            const isSelected = selectedTemplateId === template.id
            
            return (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' 
                    : 'hover:ring-1 hover:ring-gray-300 border-gray-200 hover:border-blue-200'
                }`}
              >
                <CardContent className="p-3">
                  {/* 模板编号标识 */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={isSelected ? "default" : "secondary"}
                      className={`text-xs font-medium ${
                        isSelected ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    >
                      模板{templateNumber}
                    </Badge>
                    {isSelected && (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  {/* 模板预览图 */}
                  <div className="relative mb-3">
                    <img
                      src={template.preview_image || '/icons/index/index1.png'}
                      alt={template.name || '模板'}
                      className="w-full h-32 object-cover rounded border shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/icons/index/index1.png'
                      }}
                    />
                    {template.is_default && (
                      <Badge className="absolute top-1 left-1 bg-green-500 text-xs">
                        推荐
                      </Badge>
                    )}
                  </div>

                  {/* 模板信息 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">{template.name || '未命名模板'}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{template.description || '暂无描述'}</p>
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(template)}
                        className="flex-1 text-xs"
                      >
                        <Eye size={12} className="mr-1" />
                        预览
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelect(template)}
                        className="flex-1 text-xs"
                        variant={isSelected ? "default" : "outline"}
                      >
                        {isSelected ? '已选择' : '选择'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }).filter(Boolean)}
        </div>

        {selectedTemplateId && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">当前选择:</span> {templates.find(t => t.id === selectedTemplateId)?.name}
            </p>
          </div>
        )}
      </div>

      {/* 预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image size={20} />
              模板预览 - {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              {/* 预览图片 */}
              <div className="text-center">
                <img
                  src={previewTemplate.preview_image || '/icons/index/index1.png'}
                  alt={previewTemplate.name || '模板预览'}
                  className="w-full max-h-96 object-contain rounded-lg border shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/icons/index/index1.png'
                  }}
                />
              </div>

              {/* 模板详细信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-1">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">模板编号:</span> 
                      <span className="font-medium">模板{getTemplateNumber(previewTemplate.id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">模板名称:</span> 
                      <span className="font-medium">{previewTemplate.name || '未知模板'}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600">描述:</span> 
                      <p className="mt-1 text-gray-800">{previewTemplate.description || '暂无描述'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-1">样式配置</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">标题字体:</span> 
                      <span className="font-medium">{previewTemplate.config?.title_font_size || '默认'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">内容字体:</span> 
                      <span className="font-medium">{previewTemplate.config?.font_size || '默认'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">文字颜色:</span> 
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{previewTemplate.config?.text_color || '#000000'}</span>
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: previewTemplate.config?.text_color || '#000000' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => {
                    handleSelect(previewTemplate)
                    setShowPreview(false)
                  }}
                  className="flex-1"
                >
                  选择此模板
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                >
                  关闭预览
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 