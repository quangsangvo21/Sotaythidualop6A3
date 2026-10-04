import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, PageId } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { LoginModal } from './components/LoginModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { YouTubeModal } from './components/YouTubeModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { QuickScoringPage } from './pages/QuickScoringPage';
import { StudentsPage } from './pages/StudentsPage';
import { GroupsPage } from './pages/GroupsPage';
import { CriteriaPage } from './pages/CriteriaPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryLogsPage } from './pages/HistoryLogsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainAppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState<boolean>(false);
  const [preselectedStudentForScoring, setPreselectedStudentForScoring] = useState<string | null>(null);

  const handleOpenScoringWithStudent = (studentId: string) => {
    setPreselectedStudentForScoring(studentId);
    setCurrentPage('quick-scoring');
  };

  const handleClearPreselectedStudent = () => {
    setPreselectedStudentForScoring(null);
  };

  return (
    <div className="min-h-screen theme-antique-oak flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-3.5 sm:p-6 transition-all duration-300 min-w-0">
          <div className="max-w-5xl mx-auto">
            {currentPage === 'dashboard' && (
              <DashboardPage
                onNavigate={(page) => setCurrentPage(page)}
                onOpenQuickScoringWithStudent={handleOpenScoringWithStudent}
              />
            )}

            {currentPage === 'leaderboard' && (
              <LeaderboardPage
                onOpenQuickScoringWithStudent={handleOpenScoringWithStudent}
              />
            )}

            {currentPage === 'quick-scoring' && (
              <QuickScoringPage
                preselectedStudentId={preselectedStudentForScoring}
                onClearPreselectedStudent={handleClearPreselectedStudent}
              />
            )}

            {currentPage === 'students' && (
              <StudentsPage
                onOpenQuickScoringWithStudent={handleOpenScoringWithStudent}
              />
            )}

            {currentPage === 'groups' && (
              <GroupsPage
                onOpenQuickScoringWithStudent={handleOpenScoringWithStudent}
              />
            )}

            {currentPage === 'criteria' && <CriteriaPage />}

            {currentPage === 'report' && <ReportPage />}

            {currentPage === 'logs' && <HistoryLogsPage />}

            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global Modals, Audio & Toasts */}
      <BackgroundMusicPlayer
        position="bottom-right"
        onOpenYouTube={() => setIsYouTubeModalOpen(true)}
      />
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
      />
      <StudentProfileModal onOpenScoringWithStudent={handleOpenScoringWithStudent} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
