const Moralis = require('moralis').default

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'

// 保留最新的
const KEEP_STREAM_ID = 'ddc148ad-ca5a-4e0e-930b-a4769022c670'
// 删除旧的
const DELETE_STREAM_ID = '86753bda-fe8f-4486-a031-68e684b55390'

async function main() {
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    
    console.log('删除旧 Stream...')
    console.log('保留:', KEEP_STREAM_ID)
    console.log('删除:', DELETE_STREAM_ID)
    console.log('')
    
    await Moralis.Streams.delete({ id: DELETE_STREAM_ID })
    console.log('✅ 旧 Stream 已删除')
    console.log('')
    console.log('当前只有一个 Stream:', KEEP_STREAM_ID)
    
  } catch (error) {
    console.error('删除失败:', error.message)
  }
}

main()


