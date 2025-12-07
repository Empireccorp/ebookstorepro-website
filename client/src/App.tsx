import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import EbookSalesPage from './pages/EbookSalesPage';
import Obrigado from './pages/Obrigado';
import Cancelado from './pages/Cancelado';
import DownloadPage from './pages/DownloadPage';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAffiliates from './pages/admin/Affiliates';
import AdminAffiliateDetail from './pages/admin/AffiliateDetail';
import ErrorPage from './pages/ErrorPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { useAffiliateTracking } from './hooks/useAffiliateTracking';

function AppContent() {
  // Capturar código de afiliado da URL
  useAffiliateTracking();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ebook/:slug" element={<EbookSalesPage />} />
            <Route path="/obrigado" element={<Obrigado />} />
            <Route path="/cancelado" element={<Cancelado />} />
            <Route path="/download/:token" element={<DownloadPage />} />
            <Route path="/erro" element={<ErrorPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/affiliates"
              element={
                <ProtectedRoute>
                  <AdminAffiliates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/affiliates/:id"
              element={
                <ProtectedRoute>
                  <AdminAffiliateDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
    </div>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
