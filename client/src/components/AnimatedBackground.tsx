import { Coffee, Croissant, Pizza, Cake, UtensilsCrossed, Cookie } from "lucide-react";

export function AnimatedBackground() {
  return (
    <div className="animated-bg">
      {/* Coffee Cup Animations */}
      <div className="coffee-float">
        <Coffee className="w-12 h-12 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="coffee-float">
        <Coffee className="w-8 h-8 text-orange-500 dark:text-orange-300" />
      </div>
      <div className="coffee-float">
        <Coffee className="w-10 h-10 text-amber-700 dark:text-amber-500" />
      </div>

      {/* Food Elements Animations */}
      <div className="food-float">
        <Croissant className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div className="food-float">
        <Pizza className="w-12 h-12 text-red-500 dark:text-red-400" />
      </div>
      <div className="food-float">
        <Cake className="w-8 h-8 text-pink-500 dark:text-pink-400" />
      </div>

      {/* Additional Elements */}
      <div className="coffee-float" style={{ animationDelay: '10s', top: '80%' }}>
        <UtensilsCrossed className="w-9 h-9 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="food-float" style={{ animationDelay: '20s', top: '15%' }}>
        <Cookie className="w-7 h-7 text-amber-500 dark:text-amber-300" />
      </div>
    </div>
  );
}