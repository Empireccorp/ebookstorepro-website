import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Redirecionar para o endpoint de download do backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      window.location.href = `${apiUrl}/api/downloads/${token}`;
    } else {
      // Se não houver token, redirecionar para home
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Preparando seu download...</p>
      </div>
    </div>
  );
}
