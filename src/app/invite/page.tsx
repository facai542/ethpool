"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { InviteHeader } from '@/components/invite/InviteHeader';
import { InviteStats } from '@/components/invite/InviteStats';
import { InviteLink } from '@/components/invite/InviteLink';
import { InviteRecords } from '@/components/invite/InviteRecords';
import { RewardRules } from '@/components/invite/RewardRules';
import { ChevronLeftIcon } from '@/components/ChevronLeftIcon';

export default function InvitePage() {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const [activeTab, setActiveTab] = useState<'invite' | 'records'>('invite');
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<{
    referralCode: string;
    referralLink: string;
    stats: {
      totalReferrals: number;
      activeReferrals: number;
      totalEarned: string;
      thisMonthEarned: string;
    };
    recentReferrals: any[];
  } | null>(null);

  useEffect(() => {
    async function fetchInviteData() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/referrals?wallet_address=${address.toLowerCase()}`);
        const result = await response.json();
        
        if (result.success) {
          setInviteData(result.data);
        }
      } catch (error) {
        console.error('获取邀请数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInviteData();
  }, [address]);

  // 生成邀请链接（根据前端当前域名动态生成）
  const inviteCode = inviteData?.referralCode || '';
  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}?ref=${inviteCode}` 
    : '';

  // 统计数据（适配InviteStats组件的格式）
  const stats = inviteData ? {
    totalInvites: inviteData.stats.totalReferrals || 0,
    activeMiners: inviteData.stats.activeReferrals || 0,
    totalRewards: parseFloat(inviteData.stats.totalEarned || '0'),
    pendingRewards: parseFloat(inviteData.stats.thisMonthEarned || '0')
  } : {
    totalInvites: 0,
    activeMiners: 0,
    totalRewards: 0,
    pendingRewards: 0
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{ backgroundColor: '#0C0E0D' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors bg-transparent border-none outline-none p-0"
        >
          <ChevronLeftIcon size={20} className="text-current" />
          <span>返回首页</span>
        </button>
        
        <InviteHeader />
        
        {loading ? (
          <div className="text-center text-white py-12">
            <p>加载中...</p>
          </div>
        ) : (
          <>
            <InviteStats stats={stats} />
            
            <div className="mt-6 flex justify-center">
              <div className="filter-switch">
                <input
                  type="radio"
                  id="invite-tab"
                  name="invite-tabs"
                  checked={activeTab === 'invite'}
                  onChange={() => setActiveTab('invite')}
                />
                <label className="option" htmlFor="invite-tab">
                  邀请好友
                </label>
                <input
                  type="radio"
                  id="records-tab"
                  name="invite-tabs"
                  checked={activeTab === 'records'}
                  onChange={() => setActiveTab('records')}
                />
                <label className="option" htmlFor="records-tab">
                  邀请记录
                </label>
                <span className="background" />
              </div>
            </div>

            <div className="mt-6">
              {activeTab === 'invite' ? (
                <div className="space-y-6">
                  {address ? (
                    inviteCode ? (
                      <InviteLink inviteCode={inviteCode} inviteLink={inviteLink} />
                    ) : (
                      <div className="p-6 rounded-lg border border-purple-500/30 bg-purple-950/20 backdrop-blur-sm">
                        <div className="text-center text-white">
                          <h3 className="text-xl mb-2">正在生成邀请链接...</h3>
                          <p className="text-purple-300 text-sm">请稍候，我们正在为您生成专属邀请链接</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-6 rounded-lg border border-purple-500/30 bg-purple-950/20 backdrop-blur-sm">
                      <div className="text-center text-white">
                        <h3 className="text-xl mb-2">连接钱包查看邀请链接</h3>
                        <p className="text-purple-300 text-sm">连接钱包后即可生成您的专属邀请链接，邀请好友一起挖矿获得奖励</p>
                      </div>
                    </div>
                  )}
                  <RewardRules />
                </div>
              ) : (
                <>
                  {address ? (
                    <InviteRecords records={inviteData?.recentReferrals || []} />
                  ) : (
                    <div className="p-6 rounded-lg border border-purple-500/30 bg-purple-950/20 backdrop-blur-sm text-center">
                      <p className="text-white mb-2">连接钱包查看邀请记录</p>
                      <p className="text-purple-300 text-sm">连接钱包后即可查看您邀请的好友记录和奖励详情</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

