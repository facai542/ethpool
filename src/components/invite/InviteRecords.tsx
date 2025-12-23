"use client";

import { User, Calendar, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InviteRecord {
  wallet_address: string;
  date: string;
  status: string;
  earned?: string;
  tier?: string;
}

interface InviteRecordsProps {
  records: InviteRecord[];
}

export function InviteRecords({ records }: InviteRecordsProps) {
  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white">邀请记录</h2>
        <span className="text-purple-300">共 {records.length} 人</span>
      </div>

      {/* Card Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((record, index) => (
          <Card key={index} className="bg-[#0C0E0D] border-border/50 hover:border-purple-500/50 transition-all">
            <div className="py-6 px-4">
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="font-mono text-white">{formatAddress(record.wallet_address)}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  record.status === 'Active' || record.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {record.status === 'Active' || record.status === 'active' ? '活跃' : '待激活'}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-purple-200">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(record.date)}</span>
                </div>
                {record.earned && (
                  <div className="flex items-center gap-2 text-purple-300">
                    <Coins className="w-4 h-4" />
                    <span>奖励: {record.earned}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {records.length === 0 && (
        <Card className="bg-[#0C0E0D] border-border/50">
          <div className="text-center py-12 px-4">
            <User className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <p className="text-purple-200">暂无邀请记录</p>
            <p className="text-purple-300 mt-2">快去邀请好友加入挖矿吧！</p>
          </div>
        </Card>
      )}
    </div>
  );
}


