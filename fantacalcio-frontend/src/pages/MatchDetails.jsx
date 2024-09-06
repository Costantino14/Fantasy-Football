import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMatchEvents, fetchMatchLineups } from '../services/apisport';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaExchangeAlt } from 'react-icons/fa';
import { PiSoccerBallFill } from "react-icons/pi";
import { BsFileFill } from "react-icons/bs";
import ErrorMessage from '../components/ErrorMessage';

const MatchDetails = () => {
  // Estrae l'ID della partita dall'URL
  const { id } = useParams();
  // Stati per gestire eventi, formazioni, caricamento, errori e punteggio
  const [events, setEvents] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState({ home: 0, away: 0 });

  // Effetto per caricare i dati della partita
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Recupera eventi e formazioni della partita
        const [eventsData, lineupsData] = await Promise.all([
          fetchMatchEvents(id),
          fetchMatchLineups(id)
        ]);
        setEvents(eventsData);
        setLineups(lineupsData);
        calculateScore(eventsData, lineupsData);
      } catch (err) {
        console.error('Error fetching match data:', err);
        setError('Errore nel caricamento dei dati della partita: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calcola il punteggio basato sugli eventi della partita
  const calculateScore = (events, lineups) => {
    if (!lineups || lineups.length < 2) {
      console.error('Invalid lineups data:', lineups);
      return;
    }
    const newScore = { home: 0, away: 0 };
    events.forEach(event => {
      if (event.type === 'Goal' && !event.detail.includes('Missed Penalty')) {
        if (event.team.id === lineups[0].team.id) {
          newScore.home += 1;
        } else {
          newScore.away += 1;
        }
      }
    });
    setScore(newScore);
  };

  // Rendering condizionale per stati di caricamento e errore
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!lineups || lineups.length < 2) {
    return <ErrorMessage message={'Dati delle formazioni non validi'} />;
  }

  const homeTeam = lineups[0];
  const awayTeam = lineups[1];

  // Funzione per renderizzare i diversi tipi di eventi
  const renderEvent = (event) => {

    // Switch case per stabilire come agire a seconda dei tipi di eventi
    switch(event.type) {
      case 'Goal':
        return (
          <div className="flex items-center">
            <PiSoccerBallFill className="mr-2 text-green-400 " />
            <span>{event.time.elapsed}' {event.player.name} {event.assist && `(Assist: ${event.assist.name})`}</span>
          </div>
        );
      case 'Card':
        return (
          <div className="flex items-center">
            {event.detail === 'Yellow Card' ? <BsFileFill className="mr-2 text-yellow-400" /> : <BsFileFill className="mr-2 text-red-600" />}
            <span>{event.time.elapsed}' {event.player.name}</span>
          </div>
        );
      case 'subst':
        return (
          <div className="flex items-center">
            <FaExchangeAlt className="mr-2" />
            <span>{event.time.elapsed}' {event.player.name} ↔ {event.assist.name}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Intestazione con nomi delle squadre e punteggio */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src={homeTeam.team.logo} alt={homeTeam.team.name} className="w-20 h-20 mr-4" />
          <span className="text-4xl font-bold">{homeTeam.team.name}</span>
        </div>
        <div className="text-4xl font-bold">{score.home} - {score.away}</div>
        <div className="flex items-center">
          <span className="text-4xl font-bold">{awayTeam.team.name}</span>
          <img src={awayTeam.team.logo} alt={awayTeam.team.name} className="w-20 h-20 ml-4" />
        </div>
      </div>

      {/* Griglia degli eventi per entrambe le squadre */}
      <div className="grid grid-cols-2 gap-8 mb-8">

        {/* Eventi squadra di casa */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Eventi {homeTeam.team.name}</h2>
          {events.filter(e => e.team.id === homeTeam.team.id).map((event, index) => (
            <div key={index} className="mb-2">
              {renderEvent(event)}
            </div>
          ))}
        </div>

        {/* Eventi squadra ospite */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Eventi {awayTeam.team.name}</h2>
          {events.filter(e => e.team.id === awayTeam.team.id).map((event, index) => (
            <div key={index} className="mb-2">
              {renderEvent(event)}
            </div>
          ))}
        </div>
      </div>

      <hr className="my-8" />

      {/* Formazioni delle squadre */}
      <div className="grid grid-cols-2 gap-8">
        {[homeTeam, awayTeam].map((team, teamIndex) => (
          <div key={teamIndex}>
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-2">Formazione Titolare</h3>
              {team.startXI.map((player, playerIndex) => (
                <div key={playerIndex} className="mb-1">
                  {player.player.number}. {player.player.name}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Panchina</h3>
              {team.substitutes.map((player, playerIndex) => (
                <div key={playerIndex} className="mb-1">
                  {player.player.number}. {player.player.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchDetails;