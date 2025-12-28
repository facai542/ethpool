"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, MessageCircle, Heart, Repeat2, Share } from "lucide-react";

interface XCardProps {
  authorName: string;
  authorHandle: string;
  authorImage: string;
  content: string[];
  isVerified?: boolean;
  timestamp: string;
  reply?: {
    authorName: string;
    authorHandle: string;
    authorImage: string;
    content: string;
    isVerified?: boolean;
    timestamp: string;
  };
  className?: string;
}

export const XCard = ({
  authorName,
  authorHandle,
  authorImage,
  content,
  isVerified = false,
  timestamp,
  reply,
  className
}: XCardProps) => {
  return (
    <div className={cn(
      "w-full max-w-2xl bg-black/90 border border-gray-800 rounded-2xl p-6 text-white",
      className
    )}>
      {/* 主推文 */}
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <img 
            src={authorImage} 
            alt={authorName}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white">{authorName}</span>
            {isVerified && (
              <Check className="w-5 h-5 text-blue-400 bg-blue-400 rounded-full p-1" />
            )}
            <span className="text-gray-400">@{authorHandle}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">{timestamp}</span>
          </div>
          <div className="space-y-2">
            {content.map((text, index) => (
              <p key={index} className="text-white leading-relaxed">
                {text}
              </p>
            ))}
          </div>
          
          {/* 交互按钮 */}
          <div className="flex items-center justify-between max-w-md mt-4 text-gray-500">
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">24</span>
            </button>
            <button className="flex items-center gap-2 hover:text-green-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-sm">12</span>
            </button>
            <button className="flex items-center gap-2 hover:text-red-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-red-400/10 transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm">89</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <Share className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 回复推文 */}
      {reply && (
        <div className="mt-4 ml-15 border-l-2 border-gray-700 pl-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <img 
                src={reply.authorImage} 
                alt={reply.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-sm">{reply.authorName}</span>
                {reply.isVerified && (
                  <Check className="w-4 h-4 text-blue-400 bg-blue-400 rounded-full p-0.5" />
                )}
                <span className="text-gray-400 text-sm">@{reply.authorHandle}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-400 text-sm">{reply.timestamp}</span>
              </div>
              <p className="text-white text-sm leading-relaxed">
                {reply.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
