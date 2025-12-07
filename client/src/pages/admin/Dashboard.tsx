import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getDashboardStats } from '../../services/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Ebooks</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalEbooks || 0}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalSales || 0}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vendas (7 dias)</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.recentSales || 0}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {stats?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-4xl">💵</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Alertas</h3>
            <div className="space-y-3">
              {stats.alerts.map((alert: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Últimos Pedidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">E-mail</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ebook</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{order.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.ebook.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      R$ {Number(order.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          order.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
