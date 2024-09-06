import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy loading dei componenti
const Home = React.lazy(() => import('./pages/Home'));
const Register = React.lazy(() => import('./pages/Register'));
const SerieA = React.lazy(() => import('./pages/SerieA'));
const Market = React.lazy(() => import('./pages/Market'));
const MyTeam = React.lazy(() => import('./pages/MyTeam'));
const Team = React.lazy(() => import('./pages/Team'));
const GamePage = React.lazy(() => import('./pages/GamePage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const LeaderBoard = React.lazy(() => import('./pages/LeaderBoard'));
const ContactUs = React.lazy(() => import('./pages/ContactUs'));
const MatchDetails = React.lazy(() => import('./pages/MatchDetails'));
const GameInstructions = React.lazy(() => import('./pages/GameInstructions'));

const ADMIN_EMAIL = 'costantino.grabesu14@gmail.com';

function App() {
  // Componente per le rotte protette
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return <LoadingSpinner />;
    }
    return isAuthenticated ? children : <Navigate to="/register" />;
  };

  // Componente per le rotte admin
  const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
      return <LoadingSpinner />;
    }
    return user && user.email === ADMIN_EMAIL ? children : <Navigate to="/" />;
  };

  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/serieA" element={<SerieA />} />
            <Route path="/team/:id" element={<Team />} />
            <Route path="/match/:id" element={<MatchDetails />} />
            <Route path="/istruzioni" element={<GameInstructions />} />
            <Route path="/profilo" element={<UserProfile />} />
            <Route path="/contact" element={<ContactUs />} />

            {/*Rotte protette*/}
            <Route path="/market" element={<ProtectedRoute>
                                              <Market />
                                          </ProtectedRoute>} />
            <Route path="/myTeam" element={<ProtectedRoute>
                                              <MyTeam />
                                          </ProtectedRoute>} />
            
            <Route path="/GamePlay" element={<ProtectedRoute>
                                              <GamePage />
                                            </ProtectedRoute>}/>
            <Route path="/classifica" element={<ProtectedRoute>
                                                <LeaderBoard />
                                              </ProtectedRoute>}/>
            <Route path="/admin" element={<AdminRoute>
                                            <AdminDashboard />
                                          </AdminRoute>}/>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;