import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/common/DemoBanner';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { ManagerView } from './components/manager/ManagerView';
import { HRAdminView } from './components/hr/HRAdminView';
import { ToastContainer } from './components/common/ToastContainer';
import { VacationPolicyGuideModal } from './components/common/VacationPolicyGuideModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Subtle Demo Sandbox Top Banner */}
      <DemoBanner />

      {/* Top Navigation */}
      <Navbar onOpenPolicyGuide={() => setIsGuideOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'employee' && <EmployeeDashboard />}
        {activeTab === 'team_manager' && <ManagerView />}
        {activeTab === 'hr_admin' && <HRAdminView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ระบบบริหารจัดการการลางานและขอสลับวัน WFH (Leave & WFH Day-Swap Management)</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Thai Labor Law Standard</span>
            <span>•</span>
            <span>Hybrid Attendance Matrix</span>
            <span>•</span>
            <span>RBAC Simulation</span>
          </div>
        </div>
      </footer>

      {/* Global Notifications */}
      <ToastContainer />

      {/* Policy Reference Modal */}
      <VacationPolicyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
