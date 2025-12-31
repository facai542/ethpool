'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Wallet, Activity, TrendingUp, Shield, Users } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { useState, useEffect } from 'react'

interface MiningData {
  totalLiquidity: number
  activePools: number
  totalUsers: number
  averageApy: number
  totalRewards: number
  poolData: Array<{
    id: string
    name: string
    apy: number
    tvl: number
    participants: number
  }>
}

export function MiningFeatures() {
    const { t } = useI18n()
    const [miningData, setMiningData] = useState<MiningData>({
        totalLiquidity: 24567890,
        activePools: 6,
        totalUsers: 15432,
        averageApy: 2.8,
        totalRewards: 125000,
        poolData: []
    })

    // 集成Supabase数据
    useEffect(() => {
        const loadMiningData = async () => {
            try {
                // 获取矿池数据
                const poolsResponse = await fetch('/api/supabase/mining-pools')
                const poolsData = await poolsResponse.json()
                
                // 获取挖矿订单数据
                const ordersResponse = await fetch('/api/supabase/mining-orders') 
                const ordersData = await ordersResponse.json()
                
                // 获取用户统计数据
                const usersResponse = await fetch('/api/supabase/users-stats')
                const usersData = await usersResponse.json()
                
                // 计算统计数据
                const totalLiquidity = ordersData.reduce((sum: number, order: any) => sum + Number.parseFloat(order.amount), 0)
                const activePools = poolsData.filter((pool: any) => pool.status === 1).length
                const totalUsers = usersData.totalUsers || 15432
                const averageApy = poolsData.reduce((sum: number, pool: any) => sum + Number.parseFloat(pool.reward_rate), 0) / poolsData.length
                const totalRewards = ordersData.reduce((sum: number, order: any) => sum + Number.parseFloat(order.earnings), 0)
                
                setMiningData({
                    totalLiquidity,
                    activePools,
                    totalUsers,
                    averageApy: averageApy / 100, // 转换为小数
                    totalRewards,
                    poolData: poolsData.map((pool: any) => ({
                        id: pool.id.toString(),
                        name: pool.name,
                        apy: Number.parseFloat(pool.reward_rate) / 100,
                        tvl: Math.random() * 1000000 + 500000, // 模拟TVL数据
                        participants: Math.floor(Math.random() * 2000) + 1000 // 模拟参与人数
                    }))
                })
            } catch (error) {
                console.error('Error loading mining data:', error)
                // 如果API请求失败，使用默认数据
                setMiningData({
                    totalLiquidity: 24567890,
                    activePools: 6,
                    totalUsers: 15432,
                    averageApy: 2.8,
                    totalRewards: 125000,
                    poolData: [
                        { id: '1', name: 'ETH矿池', apy: 8.5, tvl: 1000000, participants: 2500 },
                        { id: '2', name: 'BTC矿池', apy: 6.8, tvl: 800000, participants: 1800 },
                        { id: '3', name: 'USDT矿池', apy: 12.0, tvl: 1500000, participants: 3200 },
                        { id: '4', name: 'TRX矿池', apy: 15.6, tvl: 900000, participants: 1500 }
                    ]
                })
            }
        }

        loadMiningData()
    }, [])

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'
        }
        return num.toString()
    }

    return (
        <section className="py-8">
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative">
                    <div className="relative z-10 grid grid-cols-6 gap-4">
                        {/* 流动性总价值 */}
                        <Card className="relative col-span-full flex overflow-hidden lg:col-span-2 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                            <CardContent className="relative m-auto size-fit pt-6">
                                <div className="relative flex h-24 w-56 items-center">
                                    <svg className="text-yellow-400/30 absolute inset-0 size-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="mx-auto block w-fit text-4xl font-semibold text-yellow-500">${formatNumber(miningData.totalLiquidity)}</span>
                                </div>
                                <h2 className="mt-6 text-center text-2xl font-semibold text-white">Total Value Locked</h2>
                            </CardContent>
                        </Card>

                        {/* 活跃矿池数 */}
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                            <CardContent className="pt-6">
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-blue-500/20 before:absolute before:-inset-2 before:rounded-full before:border before:border-blue-500/10">
                                    <div className="m-auto text-center">
                                        <Activity className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                                        <span className="text-3xl font-bold text-blue-400">{miningData.activePools}</span>
                                    </div>
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center">
                                    <h2 className="text-lg font-medium text-white">Active Mining Pools</h2>
                                    <p className="text-gray-400 text-sm">Providing liquidity rewards across multiple tokens</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 平均收益率 */}
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                            <CardContent className="pt-6">
                                <div className="pt-6 lg:px-6">
                                    <div className="text-center mb-4">
                                        <TrendingUp className="mx-auto h-12 w-12 text-green-400 mb-3" />
                                        <div className="text-4xl font-bold text-green-400">{miningData.averageApy}%</div>
                                    </div>
                                    <svg className="w-full h-16 text-green-400/30" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path 
                                            d="M0 45 L20 35 L40 40 L60 25 L80 30 L100 15 L120 20 L140 10 L160 15 L180 5 L200 10"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="none"
                                            className="text-green-400"
                                        />
                                        <path 
                                            d="M0 45 L20 35 L40 40 L60 25 L80 30 L100 15 L120 20 L140 10 L160 15 L180 5 L200 10 L200 60 L0 60 Z"
                                            fill="url(#greenGradient)"
                                        />
                                        <defs>
                                            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
                                                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="relative z-10 mt-4 space-y-2 text-center">
                                    <h2 className="text-lg font-medium text-white">Average APY</h2>
                                    <p className="text-gray-400 text-sm">Competitive returns on your staked assets</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 安全保障 */}
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                            <CardContent className="grid pt-6 sm:grid-cols-2">
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border border-purple-500/20 before:absolute before:-inset-2 before:rounded-full before:border before:border-purple-500/10">
                                        <Shield className="m-auto size-5 text-purple-400" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium text-white">Enterprise Security</h2>
                                        <p className="text-gray-400">Multi-signature wallets, smart contract audits, and insurance coverage protect your assets</p>
                                    </div>
                                </div>
                                <div className="relative -mb-6 -mr-6 mt-6 h-fit border-l border-t border-purple-500/20 p-6 py-6 sm:ml-6 rounded-tl-lg">
                                    <div className="absolute left-3 top-2 flex gap-1">
                                        <span className="block size-2 rounded-full border border-purple-500/20 bg-purple-500/20"></span>
                                        <span className="block size-2 rounded-full border border-purple-500/20 bg-purple-500/20"></span>
                                        <span className="block size-2 rounded-full border border-purple-500/20 bg-purple-500/20"></span>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-gray-300">Smart Contract Audited</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-gray-300">Multi-Sig Protection</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-gray-300">Insurance Coverage</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 社区参与 */}
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                            <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border border-orange-500/20 before:absolute before:-inset-2 before:rounded-full before:border before:border-orange-500/10">
                                        <Users className="m-auto size-6 text-orange-400" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium text-white">Global Community</h2>
                                        <p className="text-gray-400">Join {formatNumber(miningData.totalUsers)}+ active miners earning rewards together</p>
                                    </div>
                                </div>
                                <div className="relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px before:bg-orange-500/20 sm:-my-6 sm:-mr-6">
                                    <div className="relative flex h-full flex-col justify-center space-y-4 py-6">
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs text-orange-300">Asia</span>
                                            <div className="size-7 ring-2 ring-orange-500/20 rounded-full">
                                                <div className="size-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
                                            </div>
                                        </div>
                                        <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                                            <div className="size-8 ring-2 ring-orange-500/20 rounded-full">
                                                <div className="size-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
                                            </div>
                                            <span className="block h-fit rounded border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs text-orange-300">Americas</span>
                                        </div>
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs text-orange-300">Europe</span>
                                            <div className="size-7 ring-2 ring-orange-500/20 rounded-full">
                                                <div className="size-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
