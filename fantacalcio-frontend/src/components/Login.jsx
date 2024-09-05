import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import { useAuth } from '../contexts/AuthContext';

export default function Login() {

  // Stato per gestire i dati del form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  // Gestisce i cambiamenti nei campi di input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  // Gestisce la sottomissione del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      console.error("Errore durante il login:", error);
      alert("Credenziali non valide. Riprova.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-200 rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* Sezione informativa */}
          <div className="bg-primary text-primary-content p-8 md:w-1/3">
            <h1 className="text-4xl font-bold mb-4">Entra in campo!</h1>
            <p className="text-xl mb-6">
              Benvenuto nel tuo Fantacalcio personale. Accedi per creare o gestire la tua squadra,
              fare trasferimenti e competere con tutta la comunity!
            </p>
            <FaFutbol className="text-6xl mx-auto animate-bounce" />
          </div>
          
          {/* Form di login */}
          <div className="p-8 md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="form-control md:w-1/2">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="La tua email" 
                    className="input input-bordered w-full" 
                    required 
                    name="email" 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-control md:w-1/2">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="La tua password" 
                    className="input input-bordered w-full" 
                    required 
                    name="password" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <a href="#" className="text-sm link link-hover">Password dimenticata?</a>
                <button type="submit" className="btn btn-primary">Accedi</button>
              </div>
            </form>
            <div className="divider my-6">OPPURE</div>
            {/* link alle istruzioni e alla registrazione */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Link to="/istruzioni" className="btn btn-outline btn-secondary mb-4 md:mb-0">
              Istruzioni
            </Link>
              <p className="text-center md:text-right">
                Non hai ancora un account? <Link to="/register" className="link link-primary">Registrati</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}