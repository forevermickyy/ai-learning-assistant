import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserContextProvider, UserContext } from './context/userContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Page Imports
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Account from './pages/Account';
import HowTo from './pages/HowTo';
import Settings from './pages/Settings';

// Component Imports
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import OnboardingModal from './components/OnboardingModel';
import Chat from './components/Chat';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const ProtectedRoute = ({ children }) => {
  const { user, ready } = useContext(UserContext);
  
  // Wait for auth verification
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user, ready } = useContext(UserContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (ready && user && user.onboarded === false) {
      const timer = setTimeout(() => setShowOnboarding(true), 500); 
      return () => clearTimeout(timer);
    }
  }, [user, ready]);
  
  const fullScreenRoutes = ['/login', '/register', '/forgot-password'];
  const isFullScreenPage = fullScreenRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  // Logic for Sidebar: Only show if user exists AND it's not a login/register page
  const shouldShowSidebar = !!user && !isFullScreenPage;

  // Logic for Navbar: Show if logged in (any page) OR if it's a standard public page (Home/About)
  const shouldShowNavbar = !!user || !isFullScreenPage;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen transition-colors duration-500 bg-white'>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <AnimatePresence>
        {isChatOpen && <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>

      {shouldShowSidebar && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          isExpanded={isExpanded} 
          setIsExpanded={setIsExpanded} 
          closeSidebar={() => setIsSidebarOpen(false)} 
          onChatOpen={() => setIsChatOpen(true)} 
        />
      )}

      <div className="relative flex flex-col min-h-screen">
        {/* FIX: Use shouldShowNavbar instead of shouldShowSidebar */}
        {shouldShowNavbar && (
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}

        <main className={`grow transition-all duration-300 ${shouldShowSidebar ? (isExpanded ? 'lg:ml-64' : 'lg:ml-20') : 'ml-0'}`}>
          <Toaster position='bottom-right' />
          
          <div className="min-h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Routes location={location}>
                  <Route path='/' element={<Home />} />
                  <Route path='/register' element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
                  <Route path='/login' element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/howto' element={<HowTo />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Protected Routes */}
                  <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        {/* FIX: Show footer based on navbar visibility logic */}
        {shouldShowNavbar && <Footer/>}
      </div>
    </div>
  );
};

const App = () => (
  <UserContextProvider>
    <AppContent />
  </UserContextProvider>
);

export default App;