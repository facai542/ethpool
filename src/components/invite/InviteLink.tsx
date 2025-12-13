import { Copy, Share2, QrCode, Check } from 'lucide-react';
import { useState } from 'react';
import { CardCanvas, Card } from './animated-glow-card';

interface InviteLinkProps {
  inviteCode: string;
  inviteLink: string;
}

export function InviteLink({ inviteCode, inviteLink }: InviteLinkProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
            <button className="luxury-button">
              <span className="button-text">
                <Share2 className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
                <span className="text-xs md:text-sm">分享链接</span>
              </span>
              <span className="velvet-sheen" />
            </button>
            <button className="luxury-button">
              <span className="button-text">
                <QrCode className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
                <span className="text-xs md:text-sm">生成二维码</span>
              </span>
              <span className="velvet-sheen" />
            </button>
          </div>
        </div>
      </Card>
    </CardCanvas>
  );
}

