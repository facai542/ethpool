'use client'

import type React from 'react'
import {
  // 基础导航图标
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  BarChart3,
  MessageSquare,
  
  // 用户和认证图标
  User,
  UserCheck,
  UserX,
  UserPlus,
  Lock,
  Key,
  
  // 数据和分析图标
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  
  // 操作图标
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Ban,
  Check,
  AlertCircle,
  Info,
  
  // 导航和箭头图标
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Home,
  
  // 功能图标
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  
  // 通信图标
  Mail,
  Phone,
  Calendar,
  Clock,
  
  // 特殊图标
  QrCode,
  Link,
  Share2,
  Star,
  Heart,
  
  // 状态图标
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  
  type LucideIcon
} from 'lucide-react'

// 定义图标映射接口
export interface AgentIconProps {
  className?: string
  size?: number
  color?: string
}

// 图标映射对象
export const AgentIcons = {
  // 基础导航
  dashboard: LayoutDashboard,
  users: Users,
  money: DollarSign,
  settings: Settings,
  logout: LogOut,
  menu: Menu,
  close: X,
  shield: Shield,
  notifications: Bell,
  analytics: BarChart3,
  announcements: MessageSquare,
  
  // 用户相关
  user: User,
  userActive: UserCheck,
  userInactive: UserX,
  userAdd: UserPlus,
  lock: Lock,
  key: Key,
  
  // 数据分析
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  activity: Activity,
  pieChart: PieChart,
  lineChart: LineChart,
  
  // 操作按钮
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  cancel: Ban,
  check: Check,
  alert: AlertCircle,
  info: Info,
  
  // 导航箭头
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  home: Home,
  
  // 功能图标
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  copy: Copy,
  show: Eye,
  hide: EyeOff,
  
  // 通信
  mail: Mail,
  phone: Phone,
  calendar: Calendar,
  clock: Clock,
  
  // 特殊功能
  qrCode: QrCode,
  link: Link,
  share: Share2,
  star: Star,
  heart: Heart,
  
  // 状态指示
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  loading: Loader2,
} as const

// 图标类型定义
export type AgentIconName = keyof typeof AgentIcons

// 统一的图标组件
interface AgentIconComponentProps extends AgentIconProps {
  name: AgentIconName
}

export const AgentIcon: React.FC<AgentIconComponentProps> = ({ 
  name, 
  className = '', 
  size = 20, 
  color,
  ...props 
}) => {
  const IconComponent = AgentIcons[name] as LucideIcon
  
  if (!IconComponent) {
    console.warn(`图标 "${name}" 不存在`)
    return null
  }
  
  return (
    <IconComponent 
      size={size}
      className={className}
      color={color}
      {...props}
    />
  )
}

// 快捷图标组件导出
export const DashboardIcon = (props: AgentIconProps) => <AgentIcon name="dashboard" {...props} />
export const UsersIcon = (props: AgentIconProps) => <AgentIcon name="users" {...props} />
export const MoneyIcon = (props: AgentIconProps) => <AgentIcon name="money" {...props} />
export const SettingsIcon = (props: AgentIconProps) => <AgentIcon name="settings" {...props} />
export const LogoutIcon = (props: AgentIconProps) => <AgentIcon name="logout" {...props} />
export const MenuIcon = (props: AgentIconProps) => <AgentIcon name="menu" {...props} />
export const CloseIcon = (props: AgentIconProps) => <AgentIcon name="close" {...props} />
export const ShieldIcon = (props: AgentIconProps) => <AgentIcon name="shield" {...props} />
export const NotificationsIcon = (props: AgentIconProps) => <AgentIcon name="notifications" {...props} />
export const AnalyticsIcon = (props: AgentIconProps) => <AgentIcon name="analytics" {...props} />
export const AnnouncementsIcon = (props: AgentIconProps) => <AgentIcon name="announcements" {...props} />
export const QrCodeIcon = (props: AgentIconProps) => <AgentIcon name="qrCode" {...props} />
export const LinkIcon = (props: AgentIconProps) => <AgentIcon name="link" {...props} />
export const DownloadIcon = (props: AgentIconProps) => <AgentIcon name="download" {...props} />
export const EditIcon = (props: AgentIconProps) => <AgentIcon name="edit" {...props} />
export const DeleteIcon = (props: AgentIconProps) => <AgentIcon name="delete" {...props} />
export const AddIcon = (props: AgentIconProps) => <AgentIcon name="add" {...props} />
export const SearchIcon = (props: AgentIconProps) => <AgentIcon name="search" {...props} />
export const FilterIcon = (props: AgentIconProps) => <AgentIcon name="filter" {...props} />
export const SuccessIcon = (props: AgentIconProps) => <AgentIcon name="success" {...props} />
export const ErrorIcon = (props: AgentIconProps) => <AgentIcon name="error" {...props} />
export const WarningIcon = (props: AgentIconProps) => <AgentIcon name="warning" {...props} />
export const LoadingIcon = (props: AgentIconProps) => <AgentIcon name="loading" {...props} />

// 默认导出
export default AgentIcon 
 
 