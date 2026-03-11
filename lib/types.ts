export interface Company {
  id: string
  name: string
  cuit: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  created_at: string
}

export interface Client {
  id: string
  company_id: string
  name: string
  cuit: string | null
  address: string | null
  phone: string | null
  email: string | null
  created_at: string
}

export interface Remito {
  id: string
  company_id: string
  client_id: string | null
  number: number
  date: string
  client_name: string
  client_cuit: string | null
  client_address: string | null
  total: number
  status: "confirmed" | "cancelled"
  created_at: string
}

export interface RemitoItem {
  id: string
  remito_id: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface RemitoWithItems extends Remito {
  items: RemitoItem[]
}

export interface Product {
  id: string
  company_id: string
  code: string | null
  name: string
  price: number
  stock: number
  is_active: boolean
  created_at: string
}