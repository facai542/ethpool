/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// JSR模块声明
declare module 'jsr:@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

declare module 'jsr:@supabase/functions-js/edge-runtime.d.ts' {
  // Edge Runtime类型声明
}

export {}; 