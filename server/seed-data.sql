-- Script para inserir dados de teste no banco
-- Execute este script após rodar as migrations

-- Inserir ebook de teste: Free Fire
INSERT INTO ebooks (
  id,
  slug,
  title,
  subtitle,
  category,
  short_description,
  long_description,
  price_display,
  currency,
  stripe_price_id,
  cover_url,
  pdf_url,
  language,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'free-fire',
  'Guia Completo Free Fire',
  'Domine o jogo e suba de rank rapidamente',
  'Jogos',
  'Aprenda as melhores estratégias, táticas e dicas para se tornar um jogador profissional de Free Fire.',
  'Este e-book foi desenvolvido para jogadores que querem melhorar suas habilidades no Free Fire.

📚 O QUE VOCÊ VAI APRENDER:

• Melhores estratégias de combate
• Como escolher as armas certas
• Táticas de posicionamento no mapa
• Dicas para melhorar a mira
• Como subir de rank rapidamente
• Segredos dos jogadores profissionais

🎯 PARA QUEM É ESTE E-BOOK:

• Iniciantes que querem aprender do zero
• Jogadores intermediários buscando melhorar
• Competidores que querem subir de rank
• Qualquer pessoa apaixonada por Free Fire

💪 COMO FUNCIONA:

Após a compra, você receberá acesso imediato ao PDF completo com todas as estratégias, ilustrações e exemplos práticos. Pode ler no celular, tablet ou computador.',
  49.97,
  'BRL',
  NULL,
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
  NULL,
  'pt-BR',
  true,
  NOW(),
  NOW()
);

-- Inserir mais alguns ebooks de exemplo
INSERT INTO ebooks (
  id,
  slug,
  title,
  subtitle,
  category,
  short_description,
  long_description,
  price_display,
  currency,
  language,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'fitness-em-casa',
  'Fitness em Casa',
  'Transforme seu corpo sem sair de casa',
  'Fitness & Saúde',
  'Treinos completos e eficientes para fazer em casa, sem equipamentos caros.',
  'Descubra como alcançar seus objetivos de fitness sem precisar de academia. Este guia completo traz treinos, dicas de alimentação e motivação para sua jornada.',
  39.90,
  'BRL',
  'pt-BR',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'produtividade-maxima',
  'Produtividade Máxima',
  'Organize sua vida e alcance seus objetivos',
  'Estudo & Produtividade',
  'Métodos comprovados para aumentar sua produtividade e conquistar mais em menos tempo.',
  'Aprenda técnicas de gestão de tempo, organização pessoal e foco que vão transformar sua rotina e resultados.',
  29.90,
  'BRL',
  'pt-BR',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'negocios-digitais',
  'Negócios Digitais do Zero',
  'Comece seu negócio online hoje',
  'Negócios & Dinheiro',
  'Guia completo para criar e escalar seu negócio digital, mesmo sem experiência prévia.',
  'Descubra os segredos para construir um negócio online lucrativo, desde a escolha do nicho até as primeiras vendas.',
  59.90,
  'BRL',
  'pt-BR',
  true,
  NOW(),
  NOW()
);
