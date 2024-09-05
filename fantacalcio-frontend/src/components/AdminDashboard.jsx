import React, { useState, useEffect } from 'react';
import { getMarketWindows, createMarketWindow, updateMarketWindow } from '../services/api';

function AdminDashboard() {
  // Stati per gestire le finestre di mercato, la nuova finestra e gli errori
  const [windows, setWindows] = useState([]);
  const [newWindow, setNewWindow] = useState({ startDate: '', endDate: '', isActive: true });
  const [error, setError] = useState(null);

  // Effetto per caricare le finestre di mercato all'avvio del componente
  useEffect(() => {
    fetchWindows();
  }, []);

  // Funzione per recuperare le finestre di mercato dal server
  const fetchWindows = async () => {
    try {
      const data = await getMarketWindows();
      setWindows(data);
      setError(null);
    } catch (err) {
      console.error('Errore nel recupero delle finestre di mercato:', err);
      setError('Impossibile recuperare le finestre di mercato');
    }
  };

  // Funzione per creare una nuova finestra di mercato
  const handleCreate = async () => {
    try {
      console.log('Tentativo di creazione nuova finestra:', newWindow);
      await createMarketWindow(newWindow);
      console.log('Finestra creata con successo');
      fetchWindows();
      setNewWindow({ startDate: '', endDate: '', isActive: true });
      setError(null);
    } catch (err) {
      console.error('Errore nella creazione della finestra:', err);
      setError('Impossibile creare la finestra di mercato');
    }
  };

  // Funzione per aggiornare una finestra di mercato esistente
  const handleUpdate = async (id, updatedWindow) => {
    await updateMarketWindow(id, updatedWindow);
    fetchWindows();
  };

  // Rendering del componente
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard Amministratore</h1>
      
      {/* Visualizzazione degli errori */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Form per creare una nuova finestra di mercato */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Crea Nuova Finestra di Mercato</h2>
        <input
          type="datetime-local"
          value={newWindow.startDate}
          onChange={(e) => setNewWindow({...newWindow, startDate: e.target.value})}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={newWindow.endDate}
          onChange={(e) => setNewWindow({...newWindow, endDate: e.target.value})}
          className="mr-2 p-2 border rounded"
        />
        <button onClick={handleCreate} className="bg-blue-500 text-white p-2 rounded">
          Crea Finestra
        </button>
      </div>

      {/* Lista delle finestre di mercato esistenti */}
      <h2 className="text-2xl font-bold mb-2">Finestre di Mercato Esistenti</h2>
      <ul>
        {windows.map(window => (
          <li key={window._id} className="mb-2 p-2 border rounded">
            {new Date(window.startDate).toLocaleString()} - 
            {new Date(window.endDate).toLocaleString()}
            <button 
              onClick={() => handleUpdate(window._id, {...window, isActive: !window.isActive})}
              className={`ml-2 p-1 rounded ${window.isActive ? 'bg-red-500' : 'bg-green-500'} text-white`}
            >
              {window.isActive ? 'Disattiva' : 'Attiva'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;