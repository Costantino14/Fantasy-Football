import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {  
  
  const [avatar, setAvatar] = useState();

  // Definisco lo stato del form con useState, inizializzato con campi vuoti
  const [formData, setFormData] = useState({
    username: "",
    email: "",  
    password: "",
    teamName: "",  
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  //Funzione per caricare l'avatar
  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


 // Gestore per la sottomissione del form
 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    if (avatar) {
      formDataToSend.append('avatar', avatar);
    }
    const user = await register(formDataToSend);
    alert("Registrazione avvenuta con successo! Il tuo team è stato creato.");
    navigate("/"); // Reindirizza l'utente alla home
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    alert("Errore durante la registrazione. Riprova.");
  }
}; 


  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 bg-gray-900 p-8 md:p-12 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-white mb-8">
          Unisciti a Fantasy Football!
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="input input-bordered input-success input-lg flex items-center gap-2 w-full bg-gray-800 text-white border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 opacity-70">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
            </svg>
            <input 
            type="text" 
            className="grow text-lg bg-transparent" 
            placeholder="Username" 
            name="username"
            onChange={handleChange}
            required />
          </label>

          <label className="input input-bordered input-success input-lg flex items-center gap-2 w-full bg-gray-800 text-white border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 opacity-70">
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input 
            type="email" 
            className="grow text-lg bg-transparent" 
            placeholder="Email" 
            name="email"
            onChange={handleChange}
            required/>
          </label>

          <label className="input input-bordered input-success input-lg flex items-center gap-2 w-full bg-gray-800 text-white border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 opacity-70">
              <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
            </svg>
            <input 
            type="password" 
            className="grow text-lg bg-transparent" 
            placeholder="Password" 
            name='password'
            onChange={handleChange}
            required/>
          </label>

          <label className="input input-bordered input-success input-lg flex items-center gap-2 w-full bg-gray-800 text-white border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 opacity-70">
              <path d="M4 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2V4zm10 4H2v6h12V8zM9 5H7v2h2V5z" />
            </svg>
            <input 
            type="text" 
            className="grow text-lg bg-transparent" 
            placeholder="Team Name" 
            name='teamName'
            onChange={handleChange}
            required/>
          </label>
        

        <div className="mt-6">
          <label className="flex items-center gap-2 w-full cursor-pointer">
            <span className="text-lg font-medium text-white">Avatar</span>
            <input type="file" 
            name="avatar"
            onChange={handleFileChange}            
            className="file-input file-input-bordered input-success file-input-lg w-full text-lg bg-gray-800 text-white border-gray-700" />
          </label>
        </div>

        <button 
        type="submit" 
        className="btn btn-primary btn-lg w-full text-lg mt-8 py-3">
        Registrati</button>
      </form>
      </div>
    </div>
  )
}