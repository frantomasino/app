-- 1. Companies table (empresa profile linked to auth user)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuit TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clients table (clientes de cada empresa)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuit TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Remitos table
CREATE TABLE IF NOT EXISTS remitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  number INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name TEXT NOT NULL,
  client_cuit TEXT,
  client_address TEXT,
  total DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, number)
);

-- 4. Remito items table
CREATE TABLE IF NOT EXISTS remito_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remito_id UUID NOT NULL REFERENCES remitos(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own company" ON companies
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own company" ON companies
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (auth.uid() = company_id);

-- RLS Policies for remitos
CREATE POLICY "Users can view their own remitos" ON remitos
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Users can insert their own remitos" ON remitos
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Users can update their own remitos" ON remitos
  FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Users can delete their own remitos" ON remitos
  FOR DELETE USING (auth.uid() = company_id);

-- RLS Policies for remito_items (through remito relationship)
CREATE POLICY "Users can view their own remito items" ON remito_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM remitos 
      WHERE remitos.id = remito_items.remito_id 
      AND remitos.company_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own remito items" ON remito_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM remitos 
      WHERE remitos.id = remito_items.remito_id 
      AND remitos.company_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own remito items" ON remito_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM remitos 
      WHERE remitos.id = remito_items.remito_id 
      AND remitos.company_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own remito items" ON remito_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM remitos 
      WHERE remitos.id = remito_items.remito_id 
      AND remitos.company_id = auth.uid()
    )
  );

-- Trigger to auto-create company on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.companies (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Mi Empresa'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
