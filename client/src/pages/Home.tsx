import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Ebook {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: Category;
  shortDescription?: string;
  salesShortDescription?: string;
  priceDisplay: number;
  currency: string;
  coverUrl?: string;
  heroImageUrl?: string;
}

export default function Home() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadEbooks();
  }, []);

  const loadEbooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ebooks');
      if (response.data.status === 'success') {
        setEbooks(response.data.data);
        setFilteredEbooks(response.data.data);
      }
    } catch (error) {
      console.error('Error loading ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    if (categorySlug === null) {
      setFilteredEbooks(ebooks);
    } else {
      setFilteredEbooks(
        ebooks.filter((ebook) => ebook.category?.slug === categorySlug)
      );
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryFilter={handleCategoryFilter} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 overflow-hidden relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Bem-vindo à Ebook Store Pro
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Sua biblioteca digital com os melhores ebooks
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter Info */}
        {selectedCategory && (
          <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-gray-600">
                Filtrando por:{' '}
                <span className="font-bold text-gray-900">
                  {filteredEbooks[0]?.category?.name || selectedCategory}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {filteredEbooks.length}{' '}
                {filteredEbooks.length === 1 ? 'ebook encontrado' : 'ebooks encontrados'}
              </p>
            </div>
            <button
              onClick={() => handleCategoryFilter(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Limpar filtro
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando ebooks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEbooks.length === 0 && (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Nenhum ebook encontrado
            </h3>
            <p className="mt-2 text-gray-500">
              {selectedCategory
                ? 'Tente selecionar outra categoria.'
                : 'Novos ebooks em breve!'}
            </p>
          </div>
        )}

        {/* Ebooks Grid */}
        {!loading && filteredEbooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEbooks.map((ebook, index) => (
              <Link
                key={ebook.id}
                to={`/ebook/${ebook.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group animate-fade-in-up border border-gray-100 hover:border-blue-200"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Cover Image */}
                <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                  {(ebook.heroImageUrl || ebook.coverUrl) ? (
                    <img
                      src={ebook.heroImageUrl || ebook.coverUrl}
                      alt={ebook.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <svg
                        className="w-20 h-20 text-white opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category Badge */}
                  {ebook.category && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                      {ebook.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                    {ebook.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {ebook.salesShortDescription || ebook.shortDescription || ebook.subtitle || 'Ebook disponível'}
                  </p>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(ebook.priceDisplay, ebook.currency)}
                    </span>
                    <span className="text-blue-600 font-medium group-hover:underline">
                      Ver detalhes →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
