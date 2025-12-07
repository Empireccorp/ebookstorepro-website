import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ebook } from '../types/ebook';
import { ebookApi } from '../services/api';
import { checkoutApi } from '../services/checkout';
import CheckoutModal from '../components/CheckoutModal';
import { getAffiliateCode } from '../hooks/useAffiliateTracking';

export default function EbookDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      loadEbook(slug);
    }
  }, [slug]);

  const loadEbook = async (ebookSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ebookApi.getEbookBySlug(ebookSlug);
      setEbook(data);
    } catch (err) {
      setError('E-book não encontrado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleBuyClick = () => {
    setIsModalOpen(true);
  };

  const handleCheckout = async (email: string) => {
    if (!ebook) return;

    try {
      setCheckoutLoading(true);
      
      // Obter código de afiliado (se houver)
      const affiliateCode = getAffiliateCode();
      
      // Criar sessão de checkout
      const response = await checkoutApi.createCheckoutSession(email, ebook.slug, affiliateCode || undefined);
      
      // Redirecionar para o Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Erro ao processar checkout. Tente novamente.');
      setCheckoutLoading(false);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando e-book...</p>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">E-book não encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-100 mb-4 flex items-center gap-2"
          >
            ← Voltar ao catálogo
          </button>
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full">
            {ebook.category}
          </span>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Cover */}
          <div>
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300">
                  {ebook.coverUrl ? (
                    <img
                      src={ebook.coverUrl}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">E</span>
                        </div>
                        <p className="text-gray-700 font-bold text-xl">{ebook.title}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm mb-2">Investimento</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatPrice(Number(ebook.priceDisplay), ebook.currency)}
                  </p>
                </div>

                <button
                  onClick={handleBuyClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Quero meu eBook agora
                </button>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acesso imediato após pagamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Download em PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pagamento 100% seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {ebook.title}
            </h1>

            {ebook.subtitle && (
              <p className="text-xl text-gray-600 mb-8">
                {ebook.subtitle}
              </p>
            )}

            {/* Short Description */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                {ebook.shortDescription}
              </p>
            </div>

            {/* Long Description */}
            {ebook.longDescription && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sobre este e-book
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {ebook.longDescription}
                </div>
              </div>
            )}

            {/* Benefits Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                O que você vai aprender
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Conteúdo prático e aplicável',
                  'Estratégias comprovadas',
                  'Exemplos reais',
                  'Passo a passo detalhado',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Bottom */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Pronto para começar?
              </h3>
              <p className="mb-6">
                Adquira agora e tenha acesso imediato ao conteúdo completo.
              </p>
              <button
                onClick={handleBuyClick}
                className="bg-white text-blue-600 py-3 px-8 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Comprar agora por {formatPrice(Number(ebook.priceDisplay), ebook.currency)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCheckout}
        ebookTitle={ebook.title}
        price={formatPrice(Number(ebook.priceDisplay), ebook.currency)}
        loading={checkoutLoading}
      />
    </div>
  );
}
