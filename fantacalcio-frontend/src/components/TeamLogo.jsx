import React from 'react';

// TeamLogo: Un componente riutilizzabile per visualizzare i loghi delle squadre
const TeamLogo = ({ src, alt, teamName }) => {
    
  // Lista delle squadre che richiedono uno sfondo bianco per il loro logo
  const teamsWithDarkLogos = ['juventus', 'inter'];
  
  // Determina la classe CSS da applicare in base al nome della squadra
  const specialLogoClass = teamsWithDarkLogos.some(team => teamName.toLowerCase().includes(team))
    ? 'bg-white p-1 rounded-full' // Sfondo bianco e arrotondato per loghi scuri
    : 'bg-transparent'; // Sfondo trasparente per gli altri loghi

  return (
    // Contenitore del logo con dimensioni fisse e centratura del contenuto
    <div className={`w-14 h-14 flex items-center justify-center ${specialLogoClass}`}>
      <img
        src={src}
        alt={alt}
        // Assicura che l'immagine si adatti al contenitore mantenendo le proporzioni
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export default TeamLogo;