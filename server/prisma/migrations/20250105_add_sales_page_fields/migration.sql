-- Migration: Add Sales Page Fields to Ebooks
-- Date: 2025-01-05
-- Description: Adiciona campos para página de vendas (textos e mídia)

-- Adicionar campos de texto da página de vendas
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_hero_title VARCHAR(500);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_hero_subtitle VARCHAR(1000);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_short_description VARCHAR(1000);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_bullet_1 VARCHAR(500);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_bullet_2 VARCHAR(500);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_bullet_3 VARCHAR(500);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_bullet_4 VARCHAR(500);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_bullet_5 VARCHAR(500);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS sales_body TEXT;
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS cta_label VARCHAR(100);

-- Adicionar campos de mídia da página de vendas
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(1000);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS extra_image_1_url VARCHAR(1000);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS extra_image_2_url VARCHAR(1000);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS extra_image_3_url VARCHAR(1000);
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000);
