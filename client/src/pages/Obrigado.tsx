import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Order } from '../types/order';
import { DownloadLink } from '../types/download';
import { orderApi } from '../services/order';
import { downloadApi } from '../services/download';

export default function Obrigado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<DownloadLink | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadOrder(sessionId);
    } else {
      setError('Session ID não encontrado na URL');
      setLoading(false);
    }
  }, [sessionId]);

  const loadOrder = async (sid: string) => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await orderApi.getOrderBySessionId(sid);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Não foi possível carregar os dados do pedido. Tente novamente mais tarde.');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            ✓ Pago
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            ⏳ Processando
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            ✗ Falhou
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleDownload = async () => {
    if (!order) return;

    try {
      setDownloadLoading(true);
      setDownloadError(null);

      // Gerar link de download
      const link = await downloadApi.generateDownloadLink(order.id);
      setDownloadLink(link);

      // Abrir link de download em nova aba
      const downloadUrl = downloadApi.getDownloadUrl(link.downloadToken);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError(
        err instanceof Error ? err.message : 'Erro ao gerar link de download'
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatExpirationTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erro ao Carregar Pedido
          </h1>

          <p className="text-gray-600 mb-8">{error}</p>

          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Voltar ao catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {order.status === 'paid' ? 'Pagamento Confirmado!' : 'Pedido Recebido'}
            </h1>

            <p className="text-gray-600 mb-4">
              {order.status === 'paid' 
                ? 'Obrigado pela sua compra! Seu pedido foi processado com sucesso.'
                : 'Seu pedido está sendo processado. Você receberá uma confirmação em breve.'}
            </p>

            <div className="flex justify-center mb-6">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhes do Pedido</h2>

          <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
            {/* Ebook Cover */}
            <div className="flex-shrink-0 w-24 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
              {order.ebook.coverUrl ? (
                <img
                  src={order.ebook.coverUrl}
                  alt={order.ebook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 text-2xl font-bold">E</span>
                </div>
              )}
            </div>

            {/* Ebook Info */}
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {order.ebook.title}
              </h3>
              {order.ebook.subtitle && (
                <p className="text-sm text-gray-600 mb-3">
                  {order.ebook.subtitle}
                </p>
              )}
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(Number(order.amount), order.currency)}
              </p>
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail:</span>
              <span className="font-medium text-gray-900">{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido ID:</span>
              <span className="font-mono text-sm text-gray-900">{order.id.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data:</span>
              <span className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Download Section */}
        {order.status === 'paid' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-green-900 mb-3">
              📥 Baixar seu eBook
            </h3>
            <p className="text-green-800 mb-4">
              Seu pagamento foi confirmado! Clique no botão abaixo para fazer o download do seu e-book.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                📧 <strong>E-mail enviado!</strong>
                <br />
                Enviamos um e-mail com o link de download para <strong>{order.email}</strong>.
                Se não encontrar, verifique a caixa de spam ou promoções.
              </p>
            </div>

            {downloadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  ❌ {downloadError}
                </p>
              </div>
            )}

            {downloadLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-900">Link de Download Gerado</span>
                  <span className="text-xs text-blue-700">
                    Expira em: {formatExpirationTime(downloadLink.expiresAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700">
                    Downloads: {downloadLink.downloadCount} / {downloadLink.maxDownloads}
                  </span>
                  <span className="text-xs text-blue-700">
                    Restantes: {downloadLink.remainingDownloads}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {downloadLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando link...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar eBook
                </>
              )}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-green-700">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>O link de download expira em 24 horas</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-green-700">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Você pode baixar até 3 vezes</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-3">
              ⏳ Aguardando Confirmação
            </h3>
            <p className="text-yellow-800">
              Seu pagamento está sendo processado. Assim que for confirmado, o botão de download aparecerá aqui.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Voltar ao catálogo
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Não recebeu o e-mail? Verifique sua caixa de spam ou entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
