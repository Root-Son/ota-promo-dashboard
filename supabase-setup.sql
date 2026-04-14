-- OTA CTR Daily data (synced from Google Sheets)
CREATE TABLE IF NOT EXISTS ota_ctr_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  channel TEXT NOT NULL,
  branch TEXT NOT NULL,
  rank INTEGER,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  cvr REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, channel, branch)
);

CREATE INDEX IF NOT EXISTS idx_ota_ctr_date ON ota_ctr_daily(date);
CREATE INDEX IF NOT EXISTS idx_ota_ctr_branch ON ota_ctr_daily(branch);
CREATE INDEX IF NOT EXISTS idx_ota_ctr_channel ON ota_ctr_daily(channel);

-- OTA Promotions (managed via admin UI)
CREATE TABLE IF NOT EXISTS ota_promotions (
  id BIGSERIAL PRIMARY KEY,
  branch TEXT NOT NULL,
  channel TEXT NOT NULL,
  promo_name TEXT NOT NULL,
  discount_rate REAL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ota_promo_branch ON ota_promotions(branch);
CREATE INDEX IF NOT EXISTS idx_ota_promo_channel ON ota_promotions(channel);
CREATE INDEX IF NOT EXISTS idx_ota_promo_dates ON ota_promotions(start_date, end_date);

-- Enable RLS
ALTER TABLE ota_ctr_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_promotions ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write (internal dashboard)
CREATE POLICY "anon_all_ctr" ON ota_ctr_daily FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_promo" ON ota_promotions FOR ALL USING (true) WITH CHECK (true);
