import { useNavigate } from 'react-router-dom';

export default function Cancelado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Cancelado
        </h1>

        <p className="text-gray-600 mb-8">
          Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Tentar novamente
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voltar ao catálogo
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
