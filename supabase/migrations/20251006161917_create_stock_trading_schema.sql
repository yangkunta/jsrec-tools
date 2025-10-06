/*
  # 股票交易管理系統資料庫架構

  ## 1. 新增資料表
    - `brokers` - 券商資料
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - 券商名稱
      - `discount_percent` (numeric) - 折扣百分比
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `trades` - 交易紀錄
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `broker_name` (text) - 券商名稱
      - `date` (date) - 交易日期
      - `side` (text) - 買/賣 (BUY/SELL)
      - `code` (text) - 股票代碼
      - `name` (text) - 股票名稱
      - `price` (numeric) - 成交價
      - `lots` (integer) - 張數
      - `shares` (integer) - 股數
      - `cost_no_fee` (numeric) - 未含手續費成本
      - `fee` (numeric) - 手續費
      - `tax` (numeric) - 交易稅
      - `total_cost` (numeric) - 總成本
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `settings` - 使用者設定
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, unique)
      - `fee_rate_pct` (numeric) - 手續費率百分比
      - `tax_rate_pct` (numeric) - 交易稅率百分比
      - `lot_size` (integer) - 每張股數
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ## 2. 安全性
    - 啟用所有資料表的 RLS
    - 每個使用者只能存取自己的資料
    - 使用 auth.uid() 驗證使用者身份
*/

-- 建立 brokers 資料表
CREATE TABLE IF NOT EXISTS brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  discount_percent numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 建立 trades 資料表
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  broker_name text NOT NULL,
  date date NOT NULL,
  side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
  code text NOT NULL,
  name text DEFAULT '',
  price numeric NOT NULL,
  lots integer NOT NULL,
  shares integer NOT NULL,
  cost_no_fee numeric NOT NULL,
  fee numeric NOT NULL,
  tax numeric NOT NULL,
  total_cost numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 建立 settings 資料表
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  fee_rate_pct numeric DEFAULT 0.1425,
  tax_rate_pct numeric DEFAULT 0.30,
  lot_size integer DEFAULT 1000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_brokers_user_id ON brokers(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_code ON trades(code);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- 啟用 RLS
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- brokers 資料表的 RLS 政策
CREATE POLICY "Users can view own brokers"
  ON brokers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brokers"
  ON brokers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brokers"
  ON brokers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brokers"
  ON brokers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- trades 資料表的 RLS 政策
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- settings 資料表的 RLS 政策
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 建立自動更新 updated_at 的函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為所有資料表建立更新觸發器
DROP TRIGGER IF EXISTS update_brokers_updated_at ON brokers;
CREATE TRIGGER update_brokers_updated_at
  BEFORE UPDATE ON brokers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trades_updated_at ON trades;
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
