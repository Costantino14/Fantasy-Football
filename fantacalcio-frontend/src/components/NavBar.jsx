import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <div className="navbar bg-neutral text-neutral-content">
      {/* Logo e navigazione principale */}
      <div className="navbar-start">
        <Link to="/" className="flex items-center">
          <img 
            src="https://res.cloudinary.com/dq5piqdjh/image/upload/v1724405862/blog_covers/himgunf8x4o2jbkhl2eu.png" 
            alt="Logo FantaCalcio" 
            className="h-12 w-auto mr-2"
          />
          <span className="text-xl font-bold">FantasyFootball</span>
        </Link>
      </div>

      {/* Menu di navigazione centrale */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/serieA" className="btn btn-ghost">Serie A</Link></li>
          <li><Link to="/market" className="btn btn-ghost">Mercato</Link></li>
          <li><Link to="/myTeam" className="btn btn-ghost">La Mia Squadra</Link></li>
          <li><Link to="/GamePlay" className="btn btn-ghost">GamePlay</Link></li>
          <li><Link to="/classifica" className="btn btn-ghost">Classifica</Link></li>
        </ul>
      </div>

      {/* Menu utente o pulsante di registrazione */}
      <div className="navbar-end">
        {isAuthenticated ? (
          <>
            {/* Menu a tendina utente */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src={user.avatar || "https://placeimg.com/80/80/people"} alt="Avatar" />
                </div>
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><Link to="/profilo">Profilo</Link></li>
                {isAuthenticated && user.email === 'costantino.grabesu14@gmail.com' && (
                <li><Link to="/admin">Admin Dashboard</Link></li>)}
                <li><Link to="/istruzioni">Istruzioni</Link></li>
                <li><a onClick={handleLogout}>Logout</a></li>
              </ul>
            </div>
          </>
        ) : (
          <Link to="/register" className="btn btn-primary">Registrati</Link>
        )}
      </div>

      {/* Menu mobile */}
      <div className="lg:hidden">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link to="/serieA">Serie A</Link></li>
            <li><Link to="/market">Mercato</Link></li>
            <li><Link to="/myTeam">La Mia Squadra</Link></li>
            <li><Link to="/GamePlay">GamePlay</Link></li>
            <li><Link to="/classifica">Classifica</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}