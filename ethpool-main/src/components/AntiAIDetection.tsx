'use client'

import { useEffect, useState } from 'react'

// 防AI检测和反爬虫组件
export default function AntiAIDetection() {
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  useEffect(() => {
    // 更全面的AI工具检测
    const detectAITools = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const platform = navigator.platform.toLowerCase()
      
      // 精确的AI检测模式（避免误判正常浏览器）
      const aiPatterns = [
        /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i, 
        /yandexbot/i, /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
        /chatgpt/i, /claude.*ai/i, /bard.*google/i, /openai.*gpt/i, /anthropic/i,
        /selenium/i, /webdriver/i, /puppeteer/i, /playwright/i, /phantomjs/i,
        /headlesschrome/i, /chrome\/.*headless/i, /firefox\/.*headless/i,
        /curl\/\d/i, /wget\/\d/i, /python-requests/i, /node-fetch/i,
        /postman/i, /insomnia/i, /apidog/i
      ]
      
      if (aiPatterns.some(pattern => pattern.test(userAgent))) {
        setIsBlocked(true)
        setBlockReason('AI工具检测')
        return true
      }
      
      return false
    }

    // 检测自动化工具
    const detectAutomation = () => {
      const automationSignatures = [
        'webdriver' in window,
        'callPhantom' in window,
        'phantom' in window,
        '_phantom' in window,
        'Buffer' in window,
        'emit' in window,
        'spawn' in window,
        navigator.webdriver,
        (window as any).webdriver,
        document.documentElement.getAttribute('webdriver') !== null,
        'cdc_adoQpoasnfa76pfcZLmcfl_Array' in window,
        'cdc_adoQpoasnfa76pfcZLmcfl_Promise' in window,
        'cdc_adoQpoasnfa76pfcZLmcfl_Symbol' in window,
        'cdc_adoQpoasnfa76pfcZLmcfl_JSON' in window,
        'cdc_adoQpoasnfa76pfcZLmcfl_Object' in window,
        '$chrome_asyncScriptInfo' in document,
        '$cdc_asdjflasutopfhvcZLmcfl_' in window,
        'domAutomation' in window,
        'domAutomationController' in window,
        'webdriver' in navigator,
        (navigator as any).webdriver === true,
        'outerWidth' in window && window.outerWidth === 0,
        'outerHeight' in window && window.outerHeight === 0,
        'chrome' in window && 'runtime' in (window as any).chrome,
        'fmget_targets' in window,
        'awesomium' in window,
        'CefSharp' in window,
        'persistent' in window,
        'SpynnerWebKit' in window,
        'WebKit2GTK' in window,
        'PhantomJS' in window
      ]
      
      if (automationSignatures.some(signature => signature)) {
        setIsBlocked(true)
        setBlockReason('自动化工具检测')
        return true
      }
      
      return false
    }

    // 检测开发者工具 (已禁用，允许开发者正常访问)
    const detectDevTools = () => {
      // 完全禁用开发者工具检测，允许开发者正常使用网站
      return false
    }

    // 检测虚拟机环境 (大幅简化，避免误判正常用户)
    const detectVirtualMachine = () => {
      const vmSignatures = [
        // 只检测最明显的虚拟机标识，避免误判正常用户
        navigator.plugins.length === 0 && navigator.hardwareConcurrency === 1,
        /qemu|vbox.*headless|vmware.*headless/i.test(navigator.userAgent),
        // 移除大部分检测条件，因为正常用户也可能在虚拟机中使用浏览器
      ]
      
      const vmScore = vmSignatures.filter(Boolean).length
      if (vmScore >= 2) {
        setIsBlocked(true)
        setBlockReason('虚拟机环境检测')
        return true
      }
      
      return false
    }

    // 检测网络环境 (已禁用，避免误判正常用户)
    const detectNetwork = () => {
      // 完全禁用网络检测，因为很多正常用户也可能有特殊网络配置
      return false
    }

    // 鼠标和键盘行为检测 (大幅简化，避免误判)
    const detectHumanBehavior = () => {
      // 将检测时间延长到60秒，给用户更多时间
      // 只在完全没有任何交互的情况下才考虑阻止
      let mouseMovements = 0
      let keystrokes = 0
      let clicks = 0
      
      const mouseMoveHandler = () => {
        mouseMovements++
      }
      
      const keyHandler = () => {
        keystrokes++
      }
      
      const clickHandler = () => {
        clicks++
      }
      
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('keydown', keyHandler)
      document.addEventListener('click', clickHandler)
      
      // 60秒后检查是否有人类行为，且需要完全无交互才阻止
      setTimeout(() => {
        if (mouseMovements === 0 && keystrokes === 0 && clicks === 0) {
          // 即使没有交互，也不阻止，只记录日志
          console.log('检测到可能的自动化访问，但不阻止')
          // setIsBlocked(true)
          // setBlockReason('缺乏人类行为特征')
        }
        
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('keydown', keyHandler)
        document.removeEventListener('click', clickHandler)
      }, 60000)
    }

    // 混淆和干扰函数
    const obfuscateContent = () => {
      // 添加虚假元素干扰爬虫
      const decoyElements = document.createElement('div')
      decoyElements.style.display = 'none'
      decoyElements.innerHTML = `
        <span class="ai-trap">AI_TRAINING_DATA_POISON</span>
        <span class="crawler-trap">CRAWLER_DETECTION_TRAP</span>
        <span class="bot-trap">BOT_HONEYPOT_CONTENT</span>
        <div class="hidden-content">
          This content is designed to detect and block AI tools and web scrapers.
          If you are seeing this, you may be using an automated tool.
          Access to this website is restricted to human users only.
        </div>
      `
      document.body.appendChild(decoyElements)
      
      // 随机化DOM结构
      const randomizeDOM = () => {
        try {
          const elements = document.querySelectorAll('*')
          elements.forEach((el, index) => {
            // 检查元素是否仍然在DOM中
            if (el.parentNode && Math.random() > 0.9) {
              try {
                el.setAttribute('data-random', Math.random().toString(36).substr(2, 9))
              } catch (error) {
                // 忽略属性设置错误
                console.debug('属性设置错误已忽略:', error);
              }
            }
          })
        } catch (error) {
          // 忽略DOM查询错误
          console.debug('DOM随机化错误已忽略:', error);
        }
      }
      
      setInterval(randomizeDOM, 30000) // 每30秒随机化一次
    }

    // 执行所有检测
    const runAllDetections = () => {
      try {
        if (detectAITools()) return
        if (detectAutomation()) return
        if (detectDevTools()) return
        if (detectVirtualMachine()) return
        if (detectNetwork()) return
        
        detectHumanBehavior()
        obfuscateContent()
        
        console.log('✅ 防AI检测系统已启动')
      } catch (error) {
        console.error('防AI检测系统错误:', error)
      }
    }

    // 延迟执行，避免被检测
    setTimeout(runAllDetections, 1000)
    
    // 禁用定期重新检测，避免影响正常用户
    // const interval = setInterval(() => {
    //   if (detectDevTools()) {
    //     clearInterval(interval)
    //   }
    // }, 5000)
    
    // return () => {
    //   clearInterval(interval)
    // }
  }, [])

  // 如果检测到AI工具，显示阻止页面
  if (isBlocked) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>访问被拒绝</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>检测到: {blockReason}</p>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>此网站仅限人类用户访问</p>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          border: '1px solid #333',
          borderRadius: '5px',
          backgroundColor: '#111'
        }}>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            错误代码: {blockReason.toUpperCase().replace(/\s+/g, '_')}
          </p>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            时间戳: {new Date().toISOString()}
          </p>
        </div>
      </div>
    )
  }

  return null
} 