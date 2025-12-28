"use client";

import React, { useState } from "react";
import {
  Search,
  LayoutDashboard,
  ListTodo,
  Folder,
  Calendar,
  Users,
  BarChart3,
  FileText,
  Settings,
  User,
  ChevronDown,
  Plus,
  Filter,
  Clock,
  Loader,
  CheckCircle,
  Flag,
  Archive,
  Eye,
  TrendingUp,
  Star,
  UsersRound,
  FolderOpen,
  Share,
  CloudUpload,
  Shield,
  Bell,
  Plug,
  MessageSquare,
} from "lucide-react";

/** ======================= Local SVG paths (inline) ======================= */
const svgPaths = {
  p36880f80:
    "M0.32 0C0.20799 0 0.151984 0 0.109202 0.0217987C0.0715695 0.0409734 0.0409734 0.0715695 0.0217987 0.109202C0 0.151984 0 0.20799 0 0.32V6.68C0 6.79201 0 6.84801 0.0217987 6.8908C0.0409734 6.92843 0.0715695 6.95902 0.109202 6.9782C0.151984 7 0.207989 7 0.32 7L3.68 7C3.79201 7 3.84802 7 3.8908 6.9782C3.92843 6.95903 3.95903 6.92843 3.9782 6.8908C4 6.84801 4 6.79201 4 6.68V4.32C4 4.20799 4 4.15198 4.0218 4.1092C4.04097 4.07157 4.07157 4.04097 4.1092 4.0218C4.15198 4 4.20799 4 4.32 4L19.68 4C19.792 4 19.848 4 19.8908 4.0218C19.9284 4.04097 19.959 4.07157 19.9782 4.1092C20 4.15198 20 4.20799 20 4.32V6.68C20 6.79201 20 6.84802 20.0218 6.8908C20.041 6.92843 20.0716 6.95903 20.1092 6.9782C20.152 7 20.208 7 20.32 7L23.68 7C23.792 7 23.848 7 23.8908 6.9782C23.9284 6.95903 23.959 6.92843 23.9782 6.8908C24 6.84802 24 6.79201 24 6.68V0.32C24 0.20799 24 0.151984 23.9782 0.109202C23.959 0.0715695 23.9284 0.0409734 23.8908 0.0217987C23.848 0 23.792 0 23.68 0H0.32Z",
  p355df480:
    "M0.32 16C0.20799 16 0.151984 16 0.109202 15.9782C0.0715695 15.959 0.0409734 15.9284 0.0217987 15.8908C0 15.848 0 15.792 0 15.68V9.32C0 9.20799 0 9.15198 0.0217987 9.1092C0.0409734 9.07157 0.0715695 9.04097 0.109202 9.0218C0.151984 9 0.207989 9 0.32 9H3.68C3.79201 9 3.84802 9 3.8908 9.0218C3.92843 9.04097 3.95903 9.07157 3.9782 9.1092C4 9.15198 4 9.20799 4 9.32V11.68C4 11.792 4 11.848 4.0218 11.8908C4.04097 11.9284 4.07157 11.959 4.1092 11.9782C4.15198 12 4.20799 12 4.32 12L19.68 12C19.792 12 19.848 12 19.8908 11.9782C19.9284 11.959 19.959 11.9284 19.9782 11.8908C20 11.848 20 11.792 20 11.68V9.32C20 9.20799 20 9.15199 20.0218 9.1092C20.041 9.07157 20.0716 9.04098 20.1092 9.0218C20.152 9 20.208 9 20.32 9H23.68C23.792 9 23.848 9 23.8908 9.0218C23.9284 9.04098 23.959 9.07157 23.9782 9.1092C24 9.15199 24 9.20799 24 9.32V15.68C24 15.792 24 15.848 23.9782 15.8908C23.959 15.9284 23.9284 15.959 23.8908 15.9782C23.848 16 23.792 16 23.68 16H0.32Z",
  pfa0d600:
    "M6.32 10C6.20799 10 6.15198 10 6.1092 9.9782C6.07157 9.95903 6.04097 9.92843 6.0218 9.8908C6 9.84802 6 9.79201 6 9.68V6.32C6 6.20799 6 6.15198 6.0218 6.1092C6.04097 6.07157 6.07157 6.04097 6.1092 6.0218C6.15198 6 6.20799 6 6.32 6L17.68 6C17.792 6 17.848 6 17.8908 6.0218C17.9284 6.04097 17.959 6.07157 17.9782 6.1092C18 6.15198 18 6.20799 18 6.32V9.68C18 9.79201 18 9.84802 17.9782 9.8908C17.959 9.92843 17.9284 9.95903 17.8908 9.9782C17.848 10 17.792 10 17.68 10H6.32Z",
};

// 柔和的弹簧动画曲线
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- 品牌 / Logo ----------------------------- */

function InterfacesLogoSquare() {
  return (
    <div className="aspect-[24/24] grow min-h-px min-w-px overflow-clip relative shrink-0">
      <div className="absolute aspect-[24/16] left-0 right-0 top-1/2 -translate-y-1/2">
        <svg className="block size-full" fill="none" viewBox="0 0 24 16">
          <g>
            <path d={svgPaths.p36880f80} fill="#3B82F6" />
            <path d={svgPaths.p355df480} fill="#3B82F6" />
            <path d={svgPaths.pfa0d600} fill="#3B82F6" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function BrandBadge() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex items-center p-1 w-full">
        <div className="h-10 w-8 flex items-center justify-center pl-2">
          <InterfacesLogoSquare />
        </div>
        <div className="px-2 py-1">
          <div className="font-semibold text-[16px] text-slate-50">
            管理后台
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- 头像 -------------------------------- */

function AvatarCircle() {
  return (
    <div className="relative rounded-full shrink-0 size-8 bg-slate-900">
      <div className="flex items-center justify-center size-8">
        <User size={16} className="text-slate-50" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-slate-700 pointer-events-none"
      />
    </div>
  );
}

/* ------------------------------ 搜索输入框 ----------------------------- */

function SearchContainer({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`bg-slate-900 h-10 relative rounded-lg flex items-center transition-all duration-500 ${
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={`flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCollapsed ? "p-1" : "px-1"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="size-8 flex items-center justify-center">
            <Search size={16} className="text-slate-50" />
          </div>
        </div>

        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex flex-col justify-center size-full">
            <div className="flex flex-col gap-2 items-start justify-center pr-2 py-1 w-full">
              <input
                type="text"
                placeholder="搜索..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[14px] text-slate-50 placeholder:text-slate-400 leading-[20px]"
                tabIndex={isCollapsed ? -1 : 0}
              />
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-lg border border-slate-700 pointer-events-none"
        />
      </div>
    </div>
  );
}

/* --------------------------- 类型 / 内容映射 -------------------------- */

interface MenuItemT {
  icon?: React.ReactNode;
  label: string;
  hasDropdown?: boolean;
  isActive?: boolean;
  children?: MenuItemT[];
  path?: string;
}

interface MenuSectionT {
  title: string;
  items: MenuItemT[];
}

interface SidebarContent {
  title: string;
  sections: MenuSectionT[];
}

function getSidebarContent(activeSection: string): SidebarContent {
  const contentMap: Record<string, SidebarContent> = {
    dashboard: {
      title: "仪表板",
      sections: [
        {
          title: "主要功能",
          items: [
            { icon: <Eye size={16} className="text-slate-50" />, label: "总览", isActive: true, path: "/admin/dashboard" },
            {
              icon: <BarChart3 size={16} className="text-slate-50" />,
              label: "财务报表",
              hasDropdown: true,
              children: [
                { label: "财务概况", path: "/admin/finance" },
                { label: "交易记录", path: "/admin/finance/transactions" },
                { label: "统计报表", path: "/admin/finance/stats" },
              ],
            },
            {
              icon: <TrendingUp size={16} className="text-slate-50" />,
              label: "用户统计",
              hasDropdown: true,
              children: [
                { label: "用户增长趋势" },
                { label: "活跃用户分析" },
                { label: "用户留存率" },
              ],
            },
          ],
        },
      ],
    },

    users: {
      title: "用户管理",
      sections: [
        {
          title: "快速操作",
          items: [
            { icon: <Plus size={16} className="text-slate-50" />, label: "添加用户" },
            { icon: <Filter size={16} className="text-slate-50" />, label: "筛选用户" },
          ],
        },
        {
          title: "用户列表",
          items: [
            { icon: <Users size={16} className="text-slate-50" />, label: "所有用户", path: "/admin/users" },
            { icon: <TrendingUp size={16} className="text-slate-50" />, label: "资金记录", path: "/admin/users/funds" },
            { icon: <TrendingUp size={16} className="text-slate-50" />, label: "用户收益", path: "/admin/users/earnings" },
            { icon: <UsersRound size={16} className="text-slate-50" />, label: "归集记录", path: "/admin/users/referrals" },
            { icon: <MessageSquare size={16} className="text-slate-50" />, label: "发息记录", path: "/admin/users/messages" },
            { icon: <Clock size={16} className="text-slate-50" />, label: "提现订单", path: "/admin/users/withdrawals" },
          ],
        },
        {
          title: "奖励管理",
          items: [
            { icon: <Star size={16} className="text-slate-50" />, label: "奖励设置", path: "/admin/users/rewards" },
            { icon: <Plus size={16} className="text-slate-50" />, label: "手动发送奖励", path: "/admin/manual-rewards" },
            { icon: <Star size={16} className="text-slate-50" />, label: "每日奖励", path: "/admin/daily-rewards" },
          ],
        },
      ],
    },

    promotion: {
      title: "推广管理",
      sections: [
        {
          title: "推广统计",
          items: [
            { icon: <TrendingUp size={16} className="text-slate-50" />, label: "推广列表", path: "/admin/promotion" },
            { icon: <BarChart3 size={16} className="text-slate-50" />, label: "推广统计", path: "/admin/promotion/stats" },
            {
              icon: <UsersRound size={16} className="text-slate-50" />,
              label: "推广员管理",
              hasDropdown: true,
              children: [
                { label: "推广员列表", path: "/admin/promotion/members" },
                { label: "推广员统计", path: "/admin/promotion/members/stats" },
              ],
            },
          ],
        },
      ],
    },

    agents: {
      title: "代理管理",
      sections: [
        {
          title: "代理功能",
          items: [
            { icon: <UsersRound size={16} className="text-slate-50" />, label: "代理列表", path: "/admin/agents", isActive: true },
            { icon: <TrendingUp size={16} className="text-slate-50" />, label: "代理统计", path: "/admin/agents/stats" },
          ],
        },
        {
          title: "其他",
          items: [
            { icon: <Settings size={16} className="text-slate-50" />, label: "代理设置" },
          ],
        },
      ],
    },

    service: {
      title: "客服工作台",
      sections: [
        {
          title: "客服功能",
          items: [
            { icon: <MessageSquare size={16} className="text-slate-50" />, label: "客服工作台", path: "/admin/customer-service", isActive: true },
            { icon: <Bell size={16} className="text-slate-50" />, label: "消息中心" },
          ],
        },
        {
          title: "快速访问",
          items: [
            { icon: <Share size={16} className="text-slate-50" />, label: "打开新窗口", path: "https://chat.boltcode.vip" },
          ],
        },
      ],
    },

    files: {
      title: "文件管理",
      sections: [
        {
          title: "快速操作",
          items: [
            { icon: <CloudUpload size={16} className="text-slate-50" />, label: "上传文件" },
            { icon: <Plus size={16} className="text-slate-50" />, label: "新建文件夹" },
          ],
        },
        {
          title: "最近文件",
          items: [
            {
              icon: <FileText size={16} className="text-slate-50" />,
              label: "最近文档",
              hasDropdown: true,
              children: [
                { icon: <FileText size={14} className="text-slate-300" />, label: "项目提案.pdf" },
                { icon: <FileText size={14} className="text-slate-300" />, label: "会议记录.docx" },
              ],
            },
            { icon: <Share size={16} className="text-slate-50" />, label: "与我共享" },
          ],
        },
        {
          title: "组织",
          items: [
            { icon: <Folder size={16} className="text-slate-50" />, label: "所有文件夹" },
            { icon: <Archive size={16} className="text-slate-50" />, label: "已归档" },
          ],
        },
      ],
    },

    management: {
      title: "运营管理",
      sections: [
        {
          title: "内容管理",
          items: [
            { icon: <Bell size={16} className="text-slate-50" />, label: "公告管理", path: "/admin/announcements" },
            { icon: <Clock size={16} className="text-slate-50" />, label: "提现审核", path: "/admin/transfers" },
            { icon: <Settings size={16} className="text-slate-50" />, label: "活动配置", path: "/admin/activity-config" },
          ],
        },
        {
          title: "合约管理",
          items: [
            { icon: <Shield size={16} className="text-slate-50" />, label: "合约管理", path: "/admin/contract-admin" },
            { icon: <FileText size={16} className="text-slate-50" />, label: "签名管理", path: "/admin/signature" },
          ],
        },
      ],
    },

    system: {
      title: "系统设置",
      sections: [
        {
          title: "账户",
          items: [
            { icon: <User size={16} className="text-slate-50" />, label: "个人资料" },
            { icon: <Shield size={16} className="text-slate-50" />, label: "安全设置" },
            { icon: <Bell size={16} className="text-slate-50" />, label: "通知设置" },
          ],
        },
        {
          title: "工作区",
          items: [
            {
              icon: <Settings size={16} className="text-slate-50" />,
              label: "系统配置",
              path: "/admin/system/config",
            },
            { icon: <Plug size={16} className="text-slate-50" />, label: "集成管理" },
            {
              icon: <FileText size={16} className="text-slate-50" />,
              label: "日志管理",
              hasDropdown: true,
              children: [
                { label: "系统日志", path: "/admin/logs/system" },
                { label: "用户日志", path: "/admin/logs/users" },
              ],
            },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] || contentMap.dashboard;
}

/* ---------------------------- 左侧图标导航栏 -------------------------- */

function IconNavButton({
  children,
  isActive = false,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`relative overflow-hidden flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-300 group
        ${isActive 
          ? "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4" 
          : "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75"}`}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
    >
      <span className="bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]" />
      {children}
    </button>
  );
}

function IconNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={16} />, label: "仪表板" },
    { id: "users", icon: <Users size={16} />, label: "用户" },
    { id: "agents", icon: <UsersRound size={16} />, label: "代理" },
    { id: "promotion", icon: <TrendingUp size={16} />, label: "推广" },
    { id: "service", icon: <MessageSquare size={16} />, label: "客服" },
    { id: "management", icon: <Settings size={16} />, label: "运营" },
  ];

  return (
    <aside className="bg-slate-900 flex flex-col gap-2 items-center p-4 w-16 border-r border-slate-700 rounded-l-2xl">
      {/* Logo */}
      <div className="mb-2 size-10 flex items-center justify-center">
        <div className="size-7">
          <InterfacesLogoSquare />
        </div>
      </div>

      {/* 导航图标 */}
      <div className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      <div className="flex-1" />

      {/* 底部区域 */}
      <div className="flex flex-col gap-2 w-full items-center">
        <IconNavButton isActive={activeSection === "system"} onClick={() => onSectionChange("system")}>
          <Settings size={16} />
        </IconNavButton>
        <div className="size-8">
          <AvatarCircle />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------ 右侧边栏 ----------------------------- */

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
}: {
  title: string;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <div className="w-full flex justify-center transition-all duration-500" style={{ transitionTimingFunction: softSpringEasing }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="relative overflow-hidden flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-300 group bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75"
          style={{ transitionTimingFunction: softSpringEasing }}
          aria-label="展开侧边栏"
        >
          <span className="bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]" />
          <span className="inline-block rotate-180">
            <ChevronDown size={16} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden transition-all duration-500" style={{ transitionTimingFunction: softSpringEasing }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center h-10">
          <div className="px-2 py-1">
            <div className="font-semibold text-[18px] text-slate-50 leading-[27px]">
              {title}
            </div>
          </div>
        </div>
        <div className="pr-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-500 hover:bg-slate-700 text-slate-400 hover:text-slate-300"
            style={{ transitionTimingFunction: softSpringEasing }}
            aria-label="折叠侧边栏"
          >
            <ChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSidebar({ 
  activeSection, 
  adminSession,
  onLogout 
}: { 
  activeSection: string;
  adminSession?: { name: string };
  onLogout?: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const content = getSidebarContent(activeSection);

  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const toggleCollapse = () => setIsCollapsed((s) => !s);

  return (
    <aside
      className={`bg-slate-900 flex flex-col gap-4 items-start p-4 rounded-r-2xl transition-all duration-500 min-h-screen ${
        isCollapsed ? "w-16 min-w-16 !px-0 justify-center" : "w-80"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {!isCollapsed && <BrandBadge />}

      <SectionTitle title={content.title} onToggleCollapse={toggleCollapse} isCollapsed={isCollapsed} />
      <SearchContainer isCollapsed={isCollapsed} />

      <div
        className={`flex flex-col w-full overflow-y-auto flex-1 transition-all duration-500 ${
          isCollapsed ? "gap-2 items-center" : "gap-4 items-start"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className="w-full mt-auto pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2 px-2 py-2">
            <AvatarCircle />
            <div className="text-[14px] text-slate-50">{adminSession?.name || "管理员"}</div>
            <button
              type="button"
              onClick={onLogout}
              className="relative overflow-hidden ml-auto size-8 rounded-md flex items-center justify-center group bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 transition-all duration-300"
              aria-label="退出"
              title="退出登录"
            >
              <span className="bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]" />
              <svg className="size-4" viewBox="0 0 16 16" fill="none">
                <circle cx="4" cy="8" r="1" fill="#FAFAFA" />
                <circle cx="8" cy="8" r="1" fill="#FAFAFA" />
                <circle cx="12" cy="8" r="1" fill="#FAFAFA" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------ 菜单元素 ---------------------------- */

function MenuItem({
  item,
  isExpanded,
  onToggle,
  onItemClick,
  isCollapsed,
}: {
  item: MenuItemT;
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}) {
  const handleClick = () => {
    if (item.hasDropdown && onToggle) onToggle();
    else onItemClick?.();
  };

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`rounded-lg cursor-pointer transition-all duration-300 flex items-center relative overflow-hidden group
          ${item.isActive 
            ? "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4" 
            : "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75"
          } ${isCollapsed ? "w-10 min-w-10 h-10 justify-center p-4" : "w-full h-10 px-4 py-2"}`}
        style={{ transitionTimingFunction: softSpringEasing }}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        <span className="bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]" />
        <div className="flex items-center justify-center shrink-0">{item.icon}</div>

        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="text-[14px] text-slate-50 leading-[20px] truncate">
            {item.label}
          </div>
        </div>

        {item.hasDropdown && (
          <div
            className={`flex items-center justify-center shrink-0 transition-opacity duration-500 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-2"
            }`}
            style={{ transitionTimingFunction: softSpringEasing }}
          >
            <ChevronDown
              size={16}
              className="text-slate-50 transition-transform duration-500"
              style={{
                transitionTimingFunction: softSpringEasing,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SubMenuItem({ item, onItemClick }: { item: MenuItemT; onItemClick?: () => void }) {
  return (
    <div className="w-full pl-9 pr-1 py-[1px]">
      <div
        className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-slate-800 flex items-center px-3 py-1"
        onClick={onItemClick}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[14px] text-slate-300 leading-[18px] truncate">
            {item.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
}: {
  section: MenuSectionT;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  isCollapsed?: boolean;
}) {
  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative shrink-0 w-full transition-all duration-500 overflow-hidden ${
          isCollapsed ? "h-0 opacity-0" : "h-10 opacity-100"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="flex items-center h-10 px-4">
          <div className="text-[14px] text-slate-400">
            {section.title}
          </div>
        </div>
      </div>

      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`;
        const isExpanded = expandedItems.has(itemKey);
        return (
          <div key={itemKey} className="w-full flex flex-col">
            <MenuItem
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              onItemClick={() => {
                if (item.path) {
                  window.location.href = item.path;
                }
              }}
              isCollapsed={isCollapsed}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="flex flex-col gap-1 mb-2">
                {item.children.map((child, childIndex) => (
                  <SubMenuItem
                    key={`${itemKey}-${childIndex}`}
                    item={child}
                    onItemClick={() => {
                      if (child.path) {
                        window.location.href = child.path;
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- 布局 -------------------------------- */

export function AdminSidebar({
  defaultSection = "dashboard",
  adminSession,
  onLogout,
}: {
  defaultSection?: string;
  adminSession?: { name: string };
  onLogout?: () => void;
}) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  return (
    <div className="flex flex-row h-screen bg-slate-800">
      <IconNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <DetailSidebar 
        activeSection={activeSection} 
        adminSession={adminSession}
        onLogout={onLogout}
      />
    </div>
  );
}

export default AdminSidebar;

