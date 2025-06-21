import { Coffee, Croissant, Pizza, Cake, UtensilsCrossed, Cookie } from "lucide-react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Coffee Cup Animations - moving left to right */}
      <div 
        className="absolute animate-pulse"
        style={{
          top: '15%',
          left: '-60px',
          animation: 'coffeeFloat 12s linear infinite',
          animationDelay: '0s'
        }}
      >
        <Coffee className="w-8 h-8 text-amber-600 dark:text-amber-400 opacity-60" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '45%',
          left: '-60px',
          animation: 'coffeeFloat 15s linear infinite',
          animationDelay: '5s'
        }}
      >
        <Coffee className="w-10 h-10 text-orange-500 dark:text-orange-300 opacity-50" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '75%',
          left: '-60px',
          animation: 'coffeeFloat 18s linear infinite',
          animationDelay: '10s'
        }}
      >
        <Coffee className="w-6 h-6 text-amber-700 dark:text-amber-500 opacity-40" />
      </div>

      {/* Food Elements - moving right to left */}
      <div 
        className="absolute"
        style={{
          top: '25%',
          right: '-60px',
          animation: 'foodFloat 16s linear infinite',
          animationDelay: '2s'
        }}
      >
        <Croissant className="w-8 h-8 text-yellow-600 dark:text-yellow-400 opacity-50" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '55%',
          right: '-60px',
          animation: 'foodFloat 20s linear infinite',
          animationDelay: '8s'
        }}
      >
        <Pizza className="w-9 h-9 text-red-500 dark:text-red-400 opacity-45" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '85%',
          right: '-60px',
          animation: 'foodFloat 14s linear infinite',
          animationDelay: '12s'
        }}
      >
        <Cake className="w-7 h-7 text-pink-500 dark:text-pink-400 opacity-55" />
      </div>

      {/* Additional floating elements */}
      <div 
        className="absolute"
        style={{
          top: '35%',
          left: '-60px',
          animation: 'coffeeFloat 22s linear infinite',
          animationDelay: '15s'
        }}
      >
        <UtensilsCrossed className="w-8 h-8 text-gray-600 dark:text-gray-400 opacity-35" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '65%',
          right: '-60px',
          animation: 'foodFloat 13s linear infinite',
          animationDelay: '18s'
        }}
      >
        <Cookie className="w-6 h-6 text-amber-500 dark:text-amber-300 opacity-45" />
      </div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/10 to-transparent dark:from-transparent dark:via-amber-900/5 dark:to-transparent"></div>
    </div>
  );
}