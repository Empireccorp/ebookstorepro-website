import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/ebooks', label: 'Ebooks', icon: '📚' },
    { path: '/admin/categories', label: 'Categorias', icon: '🏷️' },
    { path: '/admin/orders', label: 'Pedidos', icon: '🛍' },
    { path: '/admin/affiliates', label: 'Afiliados', icon: '🤝' },
    { path: '/admin/config', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ebook Store Pro</h1>
              <p className="text-sm text-gray-600">Painel Administrativo</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Olá, <strong>{admin?.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        location.pathname === item.path
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <span>🌐</span>
                <span className="text-sm font-medium">Ver site público</span>
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
