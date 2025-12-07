import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { listAffiliates } from '../../services/affiliateApi';

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = async () => {
    try {
      const response = await listAffiliates();
      setAffiliates(response.data);
    } catch (error) {
      console.error('Error loading affiliates:', error);
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Afiliados</h2>
          <Link
            to="/admin/affiliates/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Novo Afiliado
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total de Afiliados</p>
            <p className="text-3xl font-bold text-gray-900">{affiliates.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Comissões Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">
              R$ {affiliates.reduce((sum, a) => sum + a.totalPending, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Comissões Pagas</p>
            <p className="text-3xl font-bold text-green-600">
              R$ {affiliates.reduce((sum, a) => sum + a.totalPaid, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Código</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">E-mail</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Comissão</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pendente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pago</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{affiliate.name}</td>
                  <td className="py-3 px-4">
                    <code className="px-2 py-1 bg-gray-100 text-sm font-mono rounded">
                      {affiliate.code}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{affiliate.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {Number(affiliate.commissionPercent).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-yellow-600">
                    R$ {affiliate.totalPending.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600">
                    R$ {affiliate.totalPaid.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        affiliate.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/affiliates/${affiliate.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {affiliates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum afiliado cadastrado ainda.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
