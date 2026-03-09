CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  unit TEXT,
  price_1 DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_2 DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_3 DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_name ON products(company_id, name);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = company_id);
