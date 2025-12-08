import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { InventoryFormPage } from './pages/InventoryFormPage';
import { InventoryListPage } from './pages/InventoryListPage';
import { UserManagementPage } from './pages/UserManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InventoryFormPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory-list"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InventoryListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <UserManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

