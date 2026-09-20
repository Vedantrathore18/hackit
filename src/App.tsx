import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { MoreMenuDrawer } from './components/navigation/MoreMenuDrawer';
import { CommandBar } from './components/navigation/CommandBar';
import { ToastContainer } from './components/common/Toast';

// Modals
import { VoiceModal } from './components/ai-input/VoiceModal';
import { ImageUploadModal } from './components/ai-input/ImageUploadModal';
import { ConfirmationModal } from './components/ai-input/ConfirmationCard';
import { AddTransactionModal } from './components/ai-input/AddTransactionModal';
import { CustomerDetailDrawer } from './components/ledger/CustomerDetailDrawer';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

// Pages
import { HomePage } from './pages/HomePage';
import { LedgerPage } from './pages/LedgerPage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { RemindersPage } from './pages/RemindersPage';
import { CashFlowPage } from './pages/CashFlowPage';
import { InsightsPage } from './pages/InsightsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, storeProfile } = useStore();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!storeProfile.isOnboarded);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'ledger':
        return <LedgerPage />;
      case 'receivables':
        return <ReceivablesPage />;
      case 'reminders':
        return <RemindersPage />;
      case 'cashflow':
        return <CashFlowPage />;
      case 'insights':
        return <InsightsPage />;
      case 'activity':
        return <ActivityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {renderActivePage()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav onOpenMoreMenu={() => setIsMoreMenuOpen(true)} />
      </div>

      {/* Global Modals & Drawers */}
      <VoiceModal />
      <ImageUploadModal />
      <ConfirmationModal />
      <AddTransactionModal />
      <CustomerDetailDrawer />
      <CommandBar />
      <MoreMenuDrawer
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
