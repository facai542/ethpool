"use client"

import { Menu } from "@ark-ui/react"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import React from "react"

interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

interface ArkMenuProps {
  trigger?: React.ReactNode
  groups: MenuGroup[]
  triggerClassName?: string
}

export const ArkMenu = ({ trigger, groups, triggerClassName }: ArkMenuProps) => (
  <Menu.Root>
    <Menu.Trigger className={triggerClassName || "flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-800 dark:text-gray-200"}>
      {trigger || (
        <>
          Open menu <ChevronDown size={16} />
        </>
      )}
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content className="mt-2 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-2 text-sm text-gray-800 dark:text-gray-200 z-[9999]">
        {groups.map((group, gIndex) => (
          <div key={group.label}>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {group.label}
              </Menu.ItemGroupLabel>
              {group.items.map((item, itemIndex) => (
                <Menu.Item
                  key={`${group.label}-${itemIndex}`}
                  value={item.label.toLowerCase()}
                  className={`rounded-lg px-3 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer flex items-center gap-2 ${item.className || ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={item.disabled ? undefined : item.onClick}
                  disabled={item.disabled}
                >
                  {item.icon}
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
            {gIndex < groups.length - 1 && (
              <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        ))}
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
)

// 简化版的操作菜单，用于表格行
interface ActionMenuProps {
  groups: MenuGroup[]
}

export const ActionMenu = ({ groups }: ActionMenuProps) => (
  <Menu.Root>
    <Menu.Trigger className="flex items-center justify-center rounded-lg p-2 hover:bg-slate-700 transition text-slate-400 hover:text-white">
      <MoreHorizontal size={16} />
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content className="mt-2 w-48 rounded-xl border border-slate-700 bg-slate-800 shadow-lg p-2 text-sm text-slate-200 z-[9999]">
        {groups.map((group, gIndex) => (
          <div key={group.label}>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">
                {group.label}
              </Menu.ItemGroupLabel>
              {group.items.map((item, itemIndex) => (
                <Menu.Item
                  key={`${group.label}-${itemIndex}`}
                  value={item.label.toLowerCase()}
                  className={`rounded-lg px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center gap-2 transition-colors ${item.className || ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={item.disabled ? undefined : item.onClick}
                  disabled={item.disabled}
                >
                  {item.icon}
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
            {gIndex < groups.length - 1 && (
              <div className="my-1 h-px bg-slate-700" />
            )}
          </div>
        ))}
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
)

export default ArkMenu

