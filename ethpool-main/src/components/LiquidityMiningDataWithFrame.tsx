import type React from 'react'
import { CounterAnimation } from './CounterAnimation'

export const LiquidityMiningDataWithFrame: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#F0B90B]/10 to-[#FCD535]/10 p-4 rounded-lg mt-8 mb-8">
      {/* 礦池边框装饰 */}
      <div className="binance-frame flex min-h-[650px] md:min-h-[800px]">
        {/* 左侧边框 */}
        <div className="flex flex-col w-[14px]">
          <div 
            className="h-4" 
            style={{ 
              backgroundImage: "url('/fragments/frame-left-corner-mobile.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat' 
            }}
          ></div>
          <div 
            className="flex flex-1 bg-[#1E1E1E] items-center" 
            style={{ borderLeft: '1px solid rgb(252, 234, 156)' }}
          >
            <img 
              className="w-full h-full object-cover" 
              src="/fragments/left-gradient.svg" 
              alt="Left gradient"
            />
          </div>
        </div>

        {/* 中间内容区域 */}
        <div className="flex flex-col flex-1">
          {/* 顶部边框 */}
          <div className="flex w-full">
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-top-left-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
            <div 
              className="w-[150px] bg-no-repeat bg-cover h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-top-center-mobile.svg')" 
              }}
            ></div>
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-top-right-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
          </div>

          {/* 礦池内容 */}
          <div className="flex-1 bg-gradient-to-br from-black/80 to-gray-900/90 backdrop-blur-sm border-l border-r border-yellow-500/20 p-4 md:p-6">
            <div className="space-y-6 md:space-y-8 h-full flex flex-col">
              {/* 挖矿数据表格 */}
              <div className="bg-black/40 rounded-xl border border-yellow-500/20 overflow-hidden p-4 md:p-6 flex-shrink-0">
                <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-white">
                  Liquidity Mining Data
                </h3>
                <table className="w-full">
                  <tbody className="divide-y divide-yellow-500/20">
                    <tr className="border-b border-yellow-500/20 hover:bg-yellow-500/10 transition-colors">
                      <td className="py-3 md:py-4 px-2 md:px-4 text-yellow-400 text-sm">Total Production</td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-right font-bold text-white">
                        <CounterAnimation end={368247.819} decimals={3} className="counter-text" />
                      </td>
                    </tr>
                    <tr className="border-b border-yellow-500/20 hover:bg-yellow-500/10 transition-colors">
                      <td className="py-3 md:py-4 px-2 md:px-4 text-yellow-400 text-sm">Effective Nodes</td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-right font-bold text-white">
                        <CounterAnimation end={179081.626} decimals={3} className="counter-text" />
                      </td>
                    </tr>
                    <tr className="border-b border-yellow-500/20 hover:bg-yellow-500/10 transition-colors">
                      <td className="py-3 md:py-4 px-2 md:px-4 text-yellow-400 text-sm">Participant Number</td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-right font-bold text-white">
                        <CounterAnimation end={478371} className="counter-text" />
                      </td>
                    </tr>
                    <tr className="hover:bg-yellow-500/10 transition-colors">
                      <td className="py-3 md:py-4 px-2 md:px-4 text-yellow-400 text-sm">User Income</td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-right font-bold text-white">
                        <CounterAnimation end={196319.294} decimals={3} suffix=" USDT" className="counter-text" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 挖矿输出表格 */}
              <div className="bg-black/40 rounded-xl border border-yellow-500/20 overflow-hidden p-4 md:p-6 flex-1 flex flex-col">
                <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-white">Liquidity Mining Output</h3>
                <div className="overflow-hidden flex-1">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-yellow-500/20">
                        <th className="py-2 md:py-3 px-2 md:px-4 text-yellow-400 text-sm text-left">Address</th>
                        <th className="py-2 md:py-3 px-2 md:px-4 text-yellow-400 text-sm text-right">Amount</th>
                      </tr>
                    </thead>
                  </table>
                  <div className="h-72 md:h-96 overflow-hidden relative">
                    <div className="animate-scroll">
                      <table className="w-full">
                        <tbody className="divide-y divide-yellow-500/20">
                          {[
                            { address: "T2fxbddd...fUzZjiVH", amount: "779.01USDT" },
                            { address: "0x42Fb1B...63e8A5d1", amount: "897.89USDT" },
                            { address: "0xe6Edbf...4dc3EcAA", amount: "405.1USDT" },
                            { address: "0x60DD6E...90BaD7Dd", amount: "199.78USDT" },
                            { address: "0xfDF96B...38A33e8C", amount: "422.52USDT" },
                            { address: "0xC4D2Db...4e0AB3BA", amount: "386.86USDT" },
                            { address: "T6r3T7eS...672XYuq2", amount: "99.2USDT" },
                            { address: "Tdf9xSfP...BmGmsNf9", amount: "118.4USDT" },
                            { address: "T2fxbddd...fUzZjiVH", amount: "779.01USDT" },
                            { address: "0x42Fb1B...63e8A5d1", amount: "897.89USDT" },
                            { address: "0xe6Edbf...4dc3EcAA", amount: "405.1USDT" },
                            { address: "0x60DD6E...90BaD7Dd", amount: "199.78USDT" },
                            { address: "0xfDF96B...38A33e8C", amount: "422.52USDT" },
                            { address: "0xC4D2Db...4e0AB3BA", amount: "386.86USDT" },
                            { address: "T6r3T7eS...672XYuq2", amount: "99.2USDT" },
                            { address: "Tdf9xSfP...BmGmsNf9", amount: "118.4USDT" }
                          ].map((item, index) => (
                            <tr key={`${item.address}-${index}`} className="border-b border-yellow-500/20 hover:bg-yellow-500/10 transition-colors">
                              <td className="py-2 md:py-3 px-2 md:px-4 text-white font-mono text-xs md:text-sm">{item.address}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right font-bold text-white text-xs md:text-sm">{item.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部边框 */}
          <div className="flex w-full">
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-left-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
            <div 
              className="w-[150px] bg-no-repeat bg-cover h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-center-mobile.svg')" 
              }}
            ></div>
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-right-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
          </div>
        </div>

        {/* 右侧边框 */}
        <div className="flex flex-col w-[14px]">
          <div 
            className="h-4" 
            style={{ 
              backgroundImage: "url('/fragments/frame-right-corner-mobile.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat' 
            }}
          ></div>
          <div 
            className="flex flex-1 bg-[#1E1E1E] items-center" 
            style={{ borderRight: '1px solid rgb(252, 234, 156)' }}
          >
            <img 
              className="w-full h-full object-cover" 
              src="/fragments/right-gradient.svg" 
              alt="Right gradient"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
 