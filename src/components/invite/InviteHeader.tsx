"use client";

import { ImageWithFallback } from './ImageWithFallback';

export function InviteHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-[300px] h-[300px] mb-4">
        <ImageWithFallback 
          src="https://cy-747263170.imgix.net/reg-18.3646c31c.png"
          alt="Gift"
          className="w-[300px] h-[300px] object-contain"
        />
      </div>
      <h1 className="text-white mb-2">邀请好友加入</h1>
    </div>
  );
}

