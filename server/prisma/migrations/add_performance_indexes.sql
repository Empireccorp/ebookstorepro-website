-- Migration: Add Performance Indexes
-- Date: 2025-01-XX
-- Description: Adiciona indexes para melhorar performance de queries

-- Indexes na tabela orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_id ON orders(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- Indexes na tabela affiliates
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- Indexes na tabela ebooks
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_ebooks_category_id ON ebooks(category_id);
CREATE INDEX IF NOT EXISTS idx_ebooks_is_active ON ebooks(is_active);
CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON ebooks(created_at DESC);

-- Indexes na tabela downloads
CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);

-- Indexes na tabela categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
