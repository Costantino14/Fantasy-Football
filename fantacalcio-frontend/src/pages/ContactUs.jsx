import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaUser, FaCommentAlt } from 'react-icons/fa';
import api from '../services/api';

const ContactUs = () => {
  // Utilizza il contesto di autenticazione per ottenere informazioni sull'utente
  const { user, isAuthenticated } = useAuth();
  
  // Stato per gestire i dati del form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Effetto per pre-compilare il form con i dati dell'utente se autenticato
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prevState => ({
        ...prevState,
        email: user.email || '',
        name: user.username || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestisce l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Invia i dati del form all'API
      await api.post('/email/send', formData);
      console.log('Form submitted:', formData);
      alert('Messaggio inviato! Ti risponderemo presto.');
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      alert('Si è verificato un errore nell\'invio del messaggio. Riprova più tardi.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-200 rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sezione informativa */}
          <div className="bg-primary text-primary-content p-8 md:w-1/3">
            <h1 className="text-4xl font-bold mb-4">Contattaci</h1>
            <p className="text-xl mb-6">
              Hai domande sul tuo Fantacalcio? Vuoi suggerirci nuove funzionalità?
              Siamo qui per te! Compila il form e ti risponderemo al più presto.
            </p>
            <FaEnvelope className="text-6xl mx-auto mt-20 animate-bounce" />
          </div>
          
          {/* Form di contatto */}
          <div className="p-8 md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nome */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nome</span>
                </label>
                <label className="input-group">
                  <span><FaUser /></span>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Il tuo nome" 
                    className="input input-bordered w-full" 
                    required 
                  />
                </label>
              </div>
              
              {/* Campo Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <label className="input-group">
                  <span><FaEnvelope /></span>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="La tua email" 
                    className="input input-bordered w-full" 
                    required 
                  />
                </label>
              </div>
              
              {/* Campo Messaggio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Messaggio</span>
                </label>
                <label className="input-group">
                  <span><FaCommentAlt /></span>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Il tuo messaggio" 
                    className="textarea textarea-bordered w-full h-32" 
                    required
                  ></textarea>
                </label>
              </div>
              
              {/* Pulsante di invio */}
              <button type="submit" className="btn btn-primary w-full">Invia Messaggio</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;