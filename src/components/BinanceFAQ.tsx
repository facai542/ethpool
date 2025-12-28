'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: string
  isOpen?: boolean
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Are there any rewards for inviting friends?",
    answer: "Yes, you can invite your friends to join the mining pool through your link. You can get USDT rewards from the mining pool while participating in the friend invitation chain."
  }
]

export default function BinanceFAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section className="py-3 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-8">
          {/* FAQs标题移到左上方 */}
          <div className="flex-shrink-0">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              FAQs
            </h2>
          </div>
          
          {/* FAQ内容区域 */}
          <div className="flex-1 space-y-4">
            {faqData.map((item) => {
              const isOpen = openItems.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`rounded-xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'bg-[#242424]' : 'bg-gray-800/80'
                  }`}
                >
                  <div
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-5 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {item.id}
                      </div>
                      <span className="text-white text-lg font-medium">
                        {item.question}
                      </span>
                    </div>
                    <div className="text-white transition-transform duration-300 flex-shrink-0 ml-4">
                      {isOpen ? (
                        <Minus size={24} />
                      ) : (
                        <Plus size={24} />
                      )}
                    </div>
                  </div>
                  
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6">
                      <div className="pl-12">
                        <p className="text-gray-300 leading-relaxed text-base">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
} 