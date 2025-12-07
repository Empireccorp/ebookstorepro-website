import { useNavigate, useSearchParams } from 'react-router-dom';

type ErrorType = 'download-expired' | 'download-invalid' | 'order-not-found' | 'payment-failed' | 'generic';

interface ErrorConfig {
  title: string;
  message: string;
  icon: string;
  action?: {
    label: string;
    path: string;
  };
}

const errorConfigs: Record<ErrorType, ErrorConfig> = {
  'download-expired': {
    title: 'Link de Download Expirado',
    message: 'Este link de download expirou. Verifique seu e-mail para obter um novo link ou entre em contato com o suporte.',
    icon: '⏰',
    action: {
      label: 'Voltar para Início',
      path: '/',
    },
  },
  'download-invalid': {
    title: 'Link Inválido',
    message: 'Este link de download não é válido ou já foi utilizado o número máximo de vezes.',
    icon: '🚫',
    action: {
      label: 'Voltar para Início',
      path: '/',
    },
  },
  'order-not-found': {
    title: 'Pedido Não Encontrado',
    message: 'Não foi possível encontrar seu pedido. Verifique o link ou entre em contato com o suporte.',
    icon: '🔍',
    action: {
      label: 'Voltar para Início',
      path: '/',
    },
  },
  'payment-failed': {
    title: 'Pagamento Não Confirmado',
    message: 'Seu pagamento ainda não foi confirmado. Aguarde alguns minutos e tente novamente.',
    icon: '💳',
    action: {
      label: 'Verificar Status',
      path: '/obrigado',
    },
  },
  'generic': {
    title: 'Algo deu errado',
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde ou entre em contato com o suporte.',
    icon: '⚠️',
    action: {
      label: 'Voltar para Início',
      path: '/',
    },
  },
};

export default function ErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorType = (searchParams.get('type') as ErrorType) || 'generic';
  
  const config = errorConfigs[errorType] || errorConfigs.generic;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">{config.icon}</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {config.title}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {config.message}
        </p>
        
        <div className="space-y-3">
          {config.action && (
            <button
              onClick={() => navigate(config.action!.path)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
            >
              {config.action.label}
            </button>
          )}
          
          <a
            href="mailto:contato@ebookstorepro.com"
            className="block w-full text-gray-600 hover:text-gray-900 transition"
          >
            Falar com o Suporte
          </a>
        </div>
      </div>
    </div>
  );
}
