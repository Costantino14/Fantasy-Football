import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  //Rendering della pagina NotFound
  return (
    <div className="min-h-screen bg-black-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-10">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Oops! Fuorigioco!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Sembra che tu abbia calciato la palla fuori dal campo. Questa pagina non esiste nel nostro fantacalcio.
          </p>

          {/*Link per tornare alla home*/}
          <Link 
            to="/" 
            className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Torna in campo!
          </Link>
        </div>

        {/*Immagine di sfondo*/}
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <img 
            src="https://static.vecteezy.com/system/resources/thumbnails/026/128/736/small_2x/football-pitch-and-gate-black-white-error-404-flash-message-kicking-ball-into-gates-monochrome-empty-state-ui-design-page-not-found-popup-cartoon-image-flat-outline-illustration-concept-vector.jpg" 
            alt="404 Soccer Ball" 
            className="w-full max-w-sm mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;