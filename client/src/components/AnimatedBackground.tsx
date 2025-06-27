import { Car, Shield, Zap, Wrench, Sparkles, Settings } from "lucide-react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Car and automotive icons - moving left to right */}
      <div 
        className="absolute animate-pulse"
        style={{
          top: '15%',
          left: '-60px',
          animation: 'automotiveFloat 12s linear infinite',
          animationDelay: '0s'
        }}
      >
        <Car className="w-8 h-8 text-orange-600 dark:text-orange-400 opacity-60" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '45%',
          left: '-60px',
          animation: 'automotiveFloat 15s linear infinite',
          animationDelay: '5s'
        }}
      >
        <Shield className="w-10 h-10 text-blue-500 dark:text-blue-300 opacity-50" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '75%',
          left: '-60px',
          animation: 'automotiveFloat 18s linear infinite',
          animationDelay: '10s'
        }}
      >
        <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-500 opacity-40" />
      </div>

      {/* Protection and service elements - moving right to left */}
      <div 
        className="absolute"
        style={{
          top: '25%',
          right: '-60px',
          animation: 'serviceFloat 16s linear infinite',
          animationDelay: '2s'
        }}
      >
        <Wrench className="w-8 h-8 text-gray-600 dark:text-gray-400 opacity-50" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '55%',
          right: '-60px',
          animation: 'serviceFloat 20s linear infinite',
          animationDelay: '8s'
        }}
      >
        <Sparkles className="w-9 h-9 text-purple-500 dark:text-purple-400 opacity-45" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '85%',
          right: '-60px',
          animation: 'serviceFloat 14s linear infinite',
          animationDelay: '12s'
        }}
      >
        <Settings className="w-7 h-7 text-slate-500 dark:text-slate-400 opacity-55" />
      </div>

      {/* Additional floating automotive elements */}
      <div 
        className="absolute"
        style={{
          top: '35%',
          left: '-60px',
          animation: 'automotiveFloat 22s linear infinite',
          animationDelay: '15s'
        }}
      >
        <Shield className="w-8 h-8 text-green-600 dark:text-green-400 opacity-35" />
      </div>
      
      <div 
        className="absolute"
        style={{
          top: '65%',
          right: '-60px',
          animation: 'serviceFloat 13s linear infinite',
          animationDelay: '18s'
        }}
      >
        <Car className="w-6 h-6 text-orange-500 dark:text-orange-300 opacity-45" />
      </div>

      {/* Subtle automotive-themed background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50/10 to-transparent dark:from-transparent dark:via-slate-900/5 dark:to-transparent"></div>
    </div>
  );
}