import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAffiliateById, payAffiliateCommissions } from '../../services/affiliateApi';

export default function AdminAffiliateDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (id) {
      loadAffiliate();
    }
  }, [id]);

  const loadAffiliate = async () => {
    try {
      const response = await getAffiliateById(id!);
      setData(response.data);
    } catch (error) {
      console.error('Error loading affiliate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayCommissions = async () => {
    if (!data || data.stats.totalPending === 0) {
      alert('Não há comissões pendentes para pagar.');
      return;
    }

    const confirmed = window.confirm(
      `Confirmar pagamento de R$ ${data.stats.totalPending.toFixed(2)} para ${data.affiliate.name}?`
    );

    if (!confirmed) return;

    try {
      setPaying(true);
      await payAffiliateCommissions(id!);
      alert('Comissões marcadas como pagas com sucesso!');
      loadAffiliate(); // Recarregar dados
    } catch (error) {
      console.error('Error paying commissions:', error);
      alert('Erro ao marcar comissões como pagas.');
    } finally {
      setPaying(false);
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

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Afiliado não encontrado.</p>
        </div>
      </AdminLayout>
    );
  }

  const { affiliate, orders, payouts, stats } = data;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <Link to="/admin/affiliates" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Voltar para Afiliados
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{affiliate.name}</h2>
              <p className="text-gray-600">{affiliate.email}</p>
              <div className="mt-4 flex gap-4">
                <div>
                  <span className="text-sm text-gray-600">Código:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-100 text-sm font-mono rounded">
                    {affiliate.code}
                  </code>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Comissão:</span>
                  <span className="ml-2 font-semibold">{Number(affiliate.commissionPercent).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded ${
                      affiliate.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {affiliate.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Comissões Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">R$ {stats.totalPending.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Comissões Pagas</p>
            <p className="text-3xl font-bold text-green-600">R$ {stats.totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Vendas Pendentes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Pay Button */}
        {stats.totalPending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pagar Comissões Pendentes</h3>
                <p className="text-sm text-gray-600">
                  Total a pagar: <strong>R$ {stats.totalPending.toFixed(2)}</strong> ({stats.pendingOrders} vendas)
                </p>
              </div>
              <button
                onClick={handlePayCommissions}
                disabled={paying}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {paying ? 'Processando...' : 'Marcar como Pago'}
              </button>
            </div>
          </div>
        )}

        {/* Affiliate Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Link de Afiliado</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={`${frontendUrl}/ebook/free-fire?ref=${affiliate.code}`}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${frontendUrl}/ebook/free-fire?ref=${affiliate.code}`);
                alert('Link copiado!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Copiar
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Este link rastreia vendas do ebook "Free Fire" para este afiliado.
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vendas Relacionadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ebook</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Comissão</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-t">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.ebook.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      R$ {Number(order.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      R$ {Number(order.affiliateCommissionAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          order.affiliateCommissionStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.affiliateCommissionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payouts History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Histórico de Pagamentos</h3>
          {payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Período</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout: any) => (
                    <tr key={payout.id} className="border-t">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(payout.paidAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        R$ {Number(payout.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {payout.periodStart
                          ? `${new Date(payout.periodStart).toLocaleDateString('pt-BR')} - ${new Date(payout.periodEnd).toLocaleDateString('pt-BR')}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{payout.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum pagamento realizado ainda.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
