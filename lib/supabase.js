import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://rilesfynbbwdfvsjdakb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGVzZnluYmJ3ZGZ2c2pkYWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDk5NTQsImV4cCI6MjA3NTMyNTk1NH0.i0E6N8HwshAcvh6L3U9_eUgZZRRJ84-A4BP_j9hYcck';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }
  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function loadUserSettings(userId) {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('載入設定錯誤:', error);
    return null;
  }

  if (!data) {
    const defaultSettings = {
      user_id: userId,
      fee_rate_pct: 0.1425,
      tax_rate_pct: 0.30,
      lot_size: 1000
    };

    const { data: newData, error: insertError } = await supabase
      .from('settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (insertError) {
      console.error('建立預設設定錯誤:', insertError);
      return defaultSettings;
    }

    return newData;
  }

  return data;
}

export async function saveUserSettings(userId, settings) {
  const { error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      fee_rate_pct: settings.feeRatePct,
      tax_rate_pct: settings.taxRatePct,
      lot_size: settings.lotSize
    });

  if (error) {
    console.error('儲存設定錯誤:', error);
    throw error;
  }
}

export async function loadBrokers(userId) {
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('載入券商錯誤:', error);
    return [];
  }

  return data.map(b => ({
    id: b.id,
    name: b.name,
    discountPercent: b.discount_percent
  }));
}

export async function addBroker(userId, name, discountPercent) {
  const { data, error } = await supabase
    .from('brokers')
    .insert({
      user_id: userId,
      name: name,
      discount_percent: discountPercent
    })
    .select()
    .single();

  if (error) {
    console.error('新增券商錯誤:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    discountPercent: data.discount_percent
  };
}

export async function updateBroker(brokerId, name, discountPercent) {
  const { error } = await supabase
    .from('brokers')
    .update({
      name: name,
      discount_percent: discountPercent
    })
    .eq('id', brokerId);

  if (error) {
    console.error('更新券商錯誤:', error);
    throw error;
  }
}

export async function deleteBroker(brokerId) {
  const { error } = await supabase
    .from('brokers')
    .delete()
    .eq('id', brokerId);

  if (error) {
    console.error('刪除券商錯誤:', error);
    throw error;
  }
}

export async function loadTrades(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) {
    console.error('載入交易錯誤:', error);
    return [];
  }

  return data.map(t => ({
    id: t.id,
    brokerName: t.broker_name,
    date: t.date,
    side: t.side,
    code: t.code,
    name: t.name,
    price: parseFloat(t.price),
    lots: t.lots,
    shares: t.shares,
    costNoFee: parseFloat(t.cost_no_fee),
    fee: parseFloat(t.fee),
    tax: parseFloat(t.tax),
    totalCost: parseFloat(t.total_cost)
  }));
}

export async function addTrade(userId, trade) {
  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: userId,
      broker_name: trade.brokerName,
      date: trade.date,
      side: trade.side,
      code: trade.code,
      name: trade.name,
      price: trade.price,
      lots: trade.lots,
      shares: trade.shares,
      cost_no_fee: trade.costNoFee,
      fee: trade.fee,
      tax: trade.tax,
      total_cost: trade.totalCost
    })
    .select()
    .single();

  if (error) {
    console.error('新增交易錯誤:', error);
    throw error;
  }

  return {
    id: data.id,
    brokerName: data.broker_name,
    date: data.date,
    side: data.side,
    code: data.code,
    name: data.name,
    price: parseFloat(data.price),
    lots: data.lots,
    shares: data.shares,
    costNoFee: parseFloat(data.cost_no_fee),
    fee: parseFloat(data.fee),
    tax: parseFloat(data.tax),
    totalCost: parseFloat(data.total_cost)
  };
}

export async function updateTrade(tradeId, trade) {
  const { error } = await supabase
    .from('trades')
    .update({
      broker_name: trade.brokerName,
      date: trade.date,
      side: trade.side,
      code: trade.code,
      name: trade.name,
      price: trade.price,
      lots: trade.lots,
      shares: trade.shares,
      cost_no_fee: trade.costNoFee,
      fee: trade.fee,
      tax: trade.tax,
      total_cost: trade.totalCost
    })
    .eq('id', tradeId);

  if (error) {
    console.error('更新交易錯誤:', error);
    throw error;
  }
}

export async function deleteTrade(tradeId) {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId);

  if (error) {
    console.error('刪除交易錯誤:', error);
    throw error;
  }
}

export async function bulkAddTrades(userId, trades) {
  const tradesData = trades.map(trade => ({
    user_id: userId,
    broker_name: trade.brokerName,
    date: trade.date,
    side: trade.side,
    code: trade.code,
    name: trade.name,
    price: trade.price,
    lots: trade.lots,
    shares: trade.shares,
    cost_no_fee: trade.costNoFee,
    fee: trade.fee,
    tax: trade.tax,
    total_cost: trade.totalCost
  }));

  const { data, error } = await supabase
    .from('trades')
    .insert(tradesData)
    .select();

  if (error) {
    console.error('批次新增交易錯誤:', error);
    throw error;
  }

  return data.map(t => ({
    id: t.id,
    brokerName: t.broker_name,
    date: t.date,
    side: t.side,
    code: t.code,
    name: t.name,
    price: parseFloat(t.price),
    lots: t.lots,
    shares: t.shares,
    costNoFee: parseFloat(t.cost_no_fee),
    fee: parseFloat(t.fee),
    tax: parseFloat(t.tax),
    totalCost: parseFloat(t.total_cost)
  }));
}

export async function deleteAllTrades(userId) {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('刪除所有交易錯誤:', error);
    throw error;
  }
}
