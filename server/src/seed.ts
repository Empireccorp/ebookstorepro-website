import dotenv from 'dotenv';
import prisma from './config/database';

dotenv.config();

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Limpar dados existentes (opcional)
    console.log('🗑️  Limpando dados existentes...');
    await prisma.download.deleteMany();
    await prisma.order.deleteMany();
    await prisma.ebook.deleteMany();
    console.log('✅ Dados limpos com sucesso\n');

    // Inserir ebooks de teste
    console.log('📚 Inserindo ebooks de teste...');

    const ebooks = [
      {
        slug: 'free-fire',
        title: 'Guia Completo Free Fire',
        subtitle: 'Domine o jogo e suba de rank rapidamente',
        category: 'Jogos',
        shortDescription: 'Aprenda as melhores estratégias, táticas e dicas para se tornar um jogador profissional de Free Fire.',
        longDescription: `Este e-book foi desenvolvido para jogadores que querem melhorar suas habilidades no Free Fire.

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

Após a compra, você receberá acesso imediato ao PDF completo com todas as estratégias, ilustrações e exemplos práticos. Pode ler no celular, tablet ou computador.`,
        priceDisplay: 49.97,
        currency: 'BRL',
        coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
        language: 'pt-BR',
        isActive: true,
      },
      {
        slug: 'fitness-em-casa',
        title: 'Fitness em Casa',
        subtitle: 'Transforme seu corpo sem sair de casa',
        category: 'Fitness & Saúde',
        shortDescription: 'Treinos completos e eficientes para fazer em casa, sem equipamentos caros.',
        longDescription: 'Descubra como alcançar seus objetivos de fitness sem precisar de academia. Este guia completo traz treinos, dicas de alimentação e motivação para sua jornada.',
        priceDisplay: 39.90,
        currency: 'BRL',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
        language: 'pt-BR',
        isActive: true,
      },
      {
        slug: 'produtividade-maxima',
        title: 'Produtividade Máxima',
        subtitle: 'Organize sua vida e alcance seus objetivos',
        category: 'Estudo & Produtividade',
        shortDescription: 'Métodos comprovados para aumentar sua produtividade e conquistar mais em menos tempo.',
        longDescription: 'Aprenda técnicas de gestão de tempo, organização pessoal e foco que vão transformar sua rotina e resultados.',
        priceDisplay: 29.90,
        currency: 'BRL',
        coverUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=600&fit=crop',
        language: 'pt-BR',
        isActive: true,
      },
      {
        slug: 'negocios-digitais',
        title: 'Negócios Digitais do Zero',
        subtitle: 'Comece seu negócio online hoje',
        category: 'Negócios & Dinheiro',
        shortDescription: 'Guia completo para criar e escalar seu negócio digital, mesmo sem experiência prévia.',
        longDescription: 'Descubra os segredos para construir um negócio online lucrativo, desde a escolha do nicho até as primeiras vendas.',
        priceDisplay: 59.90,
        currency: 'BRL',
        coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop',
        language: 'pt-BR',
        isActive: true,
      },
    ];

    for (const ebookData of ebooks) {
      const ebook = await prisma.ebook.create({
        data: ebookData,
      });
      console.log(`✅ Criado: ${ebook.title}`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`📊 Total de ebooks criados: ${ebooks.length}`);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
