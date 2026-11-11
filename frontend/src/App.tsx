import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ExtractionsPage } from './pages/ExtractionsPage';
import { ExtractionDetailPage } from './pages/ExtractionDetailPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ExportsPage } from './pages/ExportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="extractions" element={<ExtractionsPage />} />
            <Route path="extractions/:id" element={<ExtractionDetailPage />} />
            <Route path="processing" element={<ProcessingPage />} />
            <Route path="processing/:id" element={<ProcessingPage />} />
            <Route path="exports" element={<ExportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
