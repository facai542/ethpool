import { cookies } from 'next/headers'

export interface AgentSession {
  id: number
  name: string
  code: string
  user_address: string
  referral_code: string
  level: number
  role: 'agent'
  loginTime: number
}

export function getAgentSession(): AgentSession | null {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('agent_session')
    
    if (!session) {
      return null
    }

    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export function clearAgentSession() {
  try {
    const cookieStore = cookies()
    cookieStore.delete('agent_session')
  } catch (error) {
    console.error('清除代理会话失败:', error)
  }
}

