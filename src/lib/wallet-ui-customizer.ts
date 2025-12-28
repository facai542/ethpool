/**
 * 钱包UI定制器
 * 用于动态隐藏钱包连接弹窗中的特定文字内容
 */

// 需要隐藏的文字内容列表
const textToHide = [
  "Haven't got a wallet?",
  "Get started",
  "UX by",
  "reown",
  "Powered by WalletConnect",
  "Powered by Reown",
  "Powered by",
  "WalletConnect",
  "Reown"
];

// 需要隐藏的元素选择器
const selectorsToHide = [
  // W3M Modal 选择器
  'w3m-modal *[data-testid*="footer"]',
  'w3m-modal *[data-testid*="brand"]',
  'w3m-modal *[data-testid*="powered"]',
  'w3m-modal *[data-testid*="reown"]',
  'w3m-modal *[data-testid*="get-started"]',
  'w3m-modal *[data-testid*="help"]',
  'w3m-modal *[data-testid*="legal"]',
  'w3m-modal *[data-testid*="info"]',
  'w3m-modal .w3m-modal-footer',
  'w3m-modal .w3m-info-footer',
  'w3m-modal .w3m-legal-footer',
  'w3m-modal .w3m-footer',
  'w3m-modal .w3m-help-footer',
  'w3m-modal .w3m-wallet-get-started',
  'w3m-modal .w3m-get-started',
  'w3m-modal .w3m-qr-code-footer',
  'w3m-modal .w3m-brand-footer',
  'w3m-modal .w3m-brand-logo',
  'w3m-modal .w3m-powered-by',
  'w3m-modal .w3m-reown-logo',
  'w3m-modal .w3m-wallet-connect-logo',
  'w3m-modal a[href*="reown"]',
  'w3m-modal a[href*="walletconnect"]',
  'w3m-modal a[href*="cloud.reown"]',
  'w3m-modal a[href*="cloud.walletconnect"]',
  
  // AppKit Modal 选择器
  'appkit-modal *[data-testid*="footer"]',
  'appkit-modal *[data-testid*="brand"]',
  'appkit-modal *[data-testid*="powered"]',
  'appkit-modal *[data-testid*="reown"]',
  'appkit-modal *[data-testid*="get-started"]',
  'appkit-modal .appkit-modal-footer',
  'appkit-modal .appkit-info-footer',
  'appkit-modal .appkit-legal-footer',
  'appkit-modal .appkit-brand-footer',
  'appkit-modal .appkit-powered-by',
  'appkit-modal .appkit-get-started',
  'appkit-modal a[href*="reown"]',
  'appkit-modal a[href*="walletconnect"]',
  
  // 通用选择器
  '[data-testid*="footer"]',
  '[data-testid*="brand"]',
  '[data-testid*="powered"]',
  '[data-testid*="reown"]',
  '[data-testid*="get-started"]',
  '[data-testid*="help"]',
  '[data-testid*="legal"]',
  '[data-testid*="info"]'
];

// 隐藏元素的函数
function hideElement(element: Element) {
  if (element instanceof HTMLElement && element.parentNode) {
    try {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
      element.style.height = '0';
      element.style.margin = '0';
      element.style.padding = '0';
      element.style.border = 'none';
      element.style.overflow = 'hidden';
    } catch (error) {
      // 忽略DOM操作错误，避免removeChild错误
      console.debug('DOM操作错误已忽略:', error);
    }
  }
}

// 检查文本内容并隐藏包含特定文字的元素
function hideElementsWithText() {
  try {
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      // 检查元素是否仍然在DOM中
      if (!element.parentNode) return;
      
      const textContent = element.textContent?.toLowerCase() || '';
      
      // 检查是否包含需要隐藏的文字
      const shouldHide = textToHide.some(text => 
        textContent.includes(text.toLowerCase())
      );
      
      if (shouldHide) {
        hideElement(element);
      }
    });
  } catch (error) {
    // 忽略DOM查询错误
    console.debug('DOM查询错误已忽略:', error);
  }
}

// 通过选择器隐藏元素
function hideElementsBySelector() {
  selectorsToHide.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // 检查元素是否仍然在DOM中
        if (element.parentNode) {
          hideElement(element);
        }
      });
    } catch (error) {
      // 忽略选择器错误
      console.debug('Selector error:', selector, error);
    }
  });
}

// 主要的隐藏函数
function hideWalletUIElements() {
  hideElementsBySelector();
  hideElementsWithText();
}

// 创建观察器来监听DOM变化
function createObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldHide = false;
    
    try {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // 检查元素是否仍然在DOM中
              if (!element.parentNode) return;
              
              // 检查是否是钱包相关的元素
              if (element.tagName?.toLowerCase().includes('w3m') || 
                  element.tagName?.toLowerCase().includes('appkit') ||
                  element.getAttribute('data-testid')?.includes('w3m') ||
                  element.getAttribute('data-testid')?.includes('appkit') ||
                  element.className?.includes('w3m') ||
                  element.className?.includes('appkit')) {
                shouldHide = true;
              }
              
              // 检查子元素
              if (element.querySelectorAll) {
                try {
                  const walletElements = element.querySelectorAll('*[class*="w3m"], *[class*="appkit"], *[data-testid*="w3m"], *[data-testid*="appkit"]');
                  if (walletElements.length > 0) {
                    shouldHide = true;
                  }
                } catch (error) {
                  // 忽略查询错误
                  console.debug('子元素查询错误已忽略:', error);
                }
              }
            }
          });
        }
      });
      
      if (shouldHide) {
        // 延迟执行以确保DOM完全加载
        setTimeout(() => {
          try {
            hideWalletUIElements();
          } catch (error) {
            console.debug('延迟隐藏操作错误已忽略:', error);
          }
        }, 100);
      }
    } catch (error) {
      // 忽略观察器回调错误
      console.debug('MutationObserver回调错误已忽略:', error);
    }
  });
  
  // 开始观察
  try {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (error) {
    console.debug('观察器启动错误已忽略:', error);
  }
  
  return observer;
}

// 初始化函数
export function initWalletUICustomizer() {
  try {
    // 立即隐藏已存在的元素
    hideWalletUIElements();
    
    // 创建观察器监听新添加的元素
    const observer = createObserver();
    
    // 定期检查并隐藏元素
    const interval = setInterval(() => {
      try {
        hideWalletUIElements();
      } catch (error) {
        console.debug('定期隐藏操作错误已忽略:', error);
      }
    }, 1000);
    
    // 返回清理函数
    return () => {
      try {
        observer.disconnect();
        clearInterval(interval);
      } catch (error) {
        console.debug('清理函数错误已忽略:', error);
      }
    };
  } catch (error) {
    console.debug('初始化函数错误已忽略:', error);
    return () => {}; // 返回空的清理函数
  }
}

// 在页面加载完成后自动初始化
if (typeof window !== 'undefined') {
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try {
          initWalletUICustomizer();
        } catch (error) {
          console.debug('DOMContentLoaded初始化错误已忽略:', error);
        }
      });
    } else {
      initWalletUICustomizer();
    }
  } catch (error) {
    console.debug('自动初始化错误已忽略:', error);
  }
} 