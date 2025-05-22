import React from 'react';
import { Heart } from 'lucide-react';

const quotes = [
  "Prends soin de ton corps, c'est le seul endroit où tu es obligé de vivre.",
  "Chaque pas vers l'équilibre est un pas vers le bien-être.",
  "Le corps humain est un chef-d'œuvre d'équilibre énergétique.",
  "La santé n'est pas seulement l'absence de maladie, mais un état complet de bien-être.",
  "L'énergie suit l'attention, concentre-toi sur ce qui nourrit ton corps et ton âme."
];

const WellnessReminder: React.FC = () => {
  // Choose a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
      <div className="flex items-center mb-2">
        <Heart size={18} className="text-green-600 mr-2" />
        <h4 className="font-medium text-green-800">Rappel bien-être</h4>
      </div>
      <p className="text-green-700 text-sm italic">{randomQuote}</p>
    </div>
  );
};

export default WellnessReminder;