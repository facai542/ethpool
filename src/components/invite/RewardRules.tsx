"use client";

import { ImageWithFallback } from './ImageWithFallback';

export function RewardRules() {
  const rules = [
    {
      icon: 'https://cy-747263170.imgix.net/reg-18.3646c31c.png',
      title: '注册奖励',
      description: '好友通过您的邀请链接注册',
      reward: '0.001 ETH',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'https://cy-747263170.imgix.net/Step1Icon.02c8af64.png',
      title: '首次挖矿',
      description: '好友完成首次挖矿任务',
      reward: '0.005 ETH',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'https://cy-747263170.imgix.net/Step2Icon.74077fc5.png',
      title: '持续挖矿',
      description: '好友挖矿的5%永久返佣',
      reward: '5%',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: 'https://cy-747263170.imgix.net/Step3Icon.77a11acd.png',
      title: '达人奖励',
      description: '邀请满20人额外奖励',
      reward: '0.1 ETH',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div>
      <h2 className="text-white mb-6">奖励规则</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule, index) => (
          <div key={index} className="gradient-border-card">
            <div className="gradient-card-content-black">
              <div className="flex items-start gap-4 justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="shrink-0">
                    <ImageWithFallback 
                      src={rule.icon} 
                      alt={rule.title}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white mb-2">{rule.title}</h3>
                    <p className="text-gray-300 opacity-80">{rule.description}</p>
                  </div>
                </div>
                <div className="shrink-0 self-center">
                  <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    {rule.reward}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

