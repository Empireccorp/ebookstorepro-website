import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';

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
  longDescription?: string;
  priceDisplay: number;
  currency: string;
  coverUrl?: string;
  // Campos de página de vendas
  salesHeroTitle?: string;
  salesHeroSubtitle?: string;
  salesShortDescription?: string;
  salesBullet1?: string;
  salesBullet2?: string;
  salesBullet3?: string;
  salesBullet4?: string;
  salesBullet5?: string;
  salesBody?: string;
  ctaLabel?: string;
  heroImageUrl?: string;
  extraImage1Url?: string;
  extraImage2Url?: string;
  extraImage3Url?: string;
  videoUrl?: string;
}

export default function EbookSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (slug) {
      loadEbook(slug);
    }
  }, [slug]);

  const loadEbook = async (ebookSlug: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/ebooks/${ebookSlug}`);
      if (response.data.status === 'success') {
        setEbook(response.data.data);
      }
    } catch (error) {
      console.error('Error loading ebook:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(price);
  };

  const getBullets = () => {
    if (!ebook) return [];
    return [
      ebook.salesBullet1,
      ebook.salesBullet2,
      ebook.salesBullet3,
      ebook.salesBullet4,
      ebook.salesBullet5,
    ].filter(Boolean);
  };

  const getExtraImages = () => {
    if (!ebook) return [];
    return [
      ebook.extraImage1Url,
      ebook.extraImage2Url,
      ebook.extraImage3Url,
    ].filter(Boolean);
  };

  const extractVideoId = (url?: string) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ebook) {
    return null;
  }

  const bullets = getBullets();
  const extraImages = getExtraImages();
  const videoId = extractVideoId(ebook.videoUrl);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24 overflow-hidden relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fade-in-up">
              {ebook.category && (
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded-full mb-4 animate-scale-in">
                  {ebook.category.name}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{animationDelay: '0.1s'}}>
                {ebook.salesHeroTitle || ebook.title}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8" style={{animationDelay: '0.2s'}}>
                {ebook.salesHeroSubtitle || ebook.subtitle || ebook.shortDescription}
              </p>
              <div className="flex items-center gap-4" style={{animationDelay: '0.3s'}}>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  {ebook.ctaLabel || 'Comprar Agora'}
                </button>
                <span className="text-3xl font-bold">
                  {formatPrice(ebook.priceDisplay, ebook.currency)}
                </span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-first lg:order-last animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="rounded-lg overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                {(ebook.heroImageUrl || ebook.coverUrl) ? (
                  <img
                    src={ebook.heroImageUrl || ebook.coverUrl}
                    alt={ebook.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-white/10 flex items-center justify-center">
                    <svg
                      className="w-32 h-32 text-white opacity-50"
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
            </div>
          </div>
        </div>
      </section>

      {/* Bullets Section */}
      {bullets.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
              O que você vai aprender
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bullets.map((bullet, index) => (
                <div key={index} className="flex items-start gap-3 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <svg
                    className="w-6 h-6 text-green-500 flex-shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-lg text-gray-700">{bullet}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      {videoId && (
        <section className="py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 animate-fade-in-up">
              Veja o que você vai receber
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-xl animate-scale-in" style={{animationDelay: '0.2s'}}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Video do ebook"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Sales Body Section */}
      {ebook.salesBody && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {ebook.salesBody}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Extra Images Section */}
      {extraImages.length > 0 && (
        <section className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {extraImages.map((imageUrl, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-lg animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{animationDelay: `${index * 0.15}s`}}>
                  <img
                    src={imageUrl}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Garanta seu acesso agora e transforme seus resultados
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <span className="text-4xl font-bold">
              {formatPrice(ebook.priceDisplay, ebook.currency)}
            </span>
            <button
              onClick={() => setShowCheckout(true)}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              {ebook.ctaLabel || 'Comprar Agora'}
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          ebook={ebook}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
