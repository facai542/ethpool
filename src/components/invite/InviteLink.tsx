"use client";

import { Copy, Share2, QrCode, Check } from 'lucide-react';
import { useState } from 'react';
import { CardCanvas, Card } from './animated-glow-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InviteLinkProps {
  inviteCode: string;
  inviteLink: string;
}

export function InviteLink({ inviteCode, inviteLink }: InviteLinkProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    // 尝试使用 Web Share API（移动端和部分桌面浏览器支持）
    if (navigator.share) {
      try {
        await navigator.share({
          title: '邀请您加入挖矿',
          text: `邀请您使用我的邀请链接加入挖矿：${inviteLink}`,
          url: inviteLink,
        });
      } catch (err) {
        // 用户取消分享或其他错误，回退到复制
        console.log('Share cancelled or failed:', err);
        await copyToClipboard(inviteLink, 'link');
      }
    } else {
      // 不支持 Web Share API，使用复制功能
      await copyToClipboard(inviteLink, 'link');
    }
  };

  const handleShowQrCode = () => {
    setShowQrCode(true);
  };

  // 使用在线二维码API生成二维码图片
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}`;

  return (
    <CardCanvas>
      <Card className="p-4 md:p-6">
        <h2 className="text-white mb-4 text-lg md:text-xl">我的邀请链接</h2>
        
        <div className="space-y-4">
          {/* Invite Link */}
          <div>
            <label className="text-purple-200 mb-2 block text-sm md:text-base">邀请链接</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-slate-800/50 border border-purple-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base min-w-0"
              />
              <button
                onClick={() => copyToClipboard(inviteLink, 'link')}
                className="copy-button"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">复制</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Code */}
          <div>
            <label className="text-purple-200 mb-2 block text-sm md:text-base">邀请码</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="flex-1 bg-slate-800/50 border border-purple-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white tracking-wider text-sm md:text-base min-w-0"
              />
              <button
                onClick={() => copyToClipboard(inviteCode, 'code')}
                className="copy-button"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">复制</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              className="luxury-button"
              onClick={handleShare}
            >
              <span className="button-text">
                <Share2 className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
                <span className="text-xs md:text-sm">分享链接</span>
              </span>
              <span className="velvet-sheen" />
            </button>
            <button 
              className="luxury-button"
              onClick={handleShowQrCode}
            >
              <span className="button-text">
                <QrCode className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
                <span className="text-xs md:text-sm">生成二维码</span>
              </span>
              <span className="velvet-sheen" />
            </button>
          </div>
        </div>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="bg-[#0C0E0D] border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">邀请链接二维码</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="邀请链接二维码" 
                className="w-64 h-64"
              />
            </div>
            <p className="text-purple-200 text-sm text-center break-all">
              {inviteLink}
            </p>
            <button
              onClick={() => copyToClipboard(inviteLink, 'link')}
              className="copy-button"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">已复制链接</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">复制链接</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CardCanvas>
  );
}

