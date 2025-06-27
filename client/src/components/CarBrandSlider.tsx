import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

const carBrands = [
  {
    name: "Mercedes-Benz",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/mercedes.svg",
    alt: "Mercedes-Benz Logo"
  },
  {
    name: "BMW",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/bmw.svg",
    alt: "BMW Logo"
  },
  {
    name: "Audi",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/audi.svg",
    alt: "Audi Logo"
  },
  {
    name: "Lexus",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/lexus.svg",
    alt: "Lexus Logo"
  },
  {
    name: "Toyota",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/toyota.svg",
    alt: "Toyota Logo"
  },
  {
    name: "Honda",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/honda.svg",
    alt: "Honda Logo"
  },
  {
    name: "Porsche",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/porsche.svg",
    alt: "Porsche Logo"
  },
  {
    name: "Jaguar",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/jaguar.svg",
    alt: "Jaguar Logo"
  },
  {
    name: "Nissan",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/nissan.svg",
    alt: "Nissan Logo"
  },
  {
    name: "Hyundai",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/hyundai.svg",
    alt: "Hyundai Logo"
  },
  {
    name: "Volkswagen",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/volkswagen.svg",
    alt: "Volkswagen Logo"
  },
  {
    name: "Ford",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/ford.svg",
    alt: "Ford Logo"
  }
];

export function CarBrandSlider() {
  const { t, isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(carBrands.length / 6));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {isRTL ? "العلامات التجارية التي نخدمها" : "Car Brands We Serve"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? "نقدم خدمات الحماية المتقدمة لجميع العلامات التجارية الفاخرة والعادية"
              : "We provide advanced protection services for all luxury and standard car brands"
            }
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(${isRTL ? currentIndex * 100 : -currentIndex * 100}%)`,
              direction: isRTL ? 'rtl' : 'ltr'
            }}
          >
            {Array.from({ length: Math.ceil(carBrands.length / 6) }).map((_, slideIndex) => (
              <div key={slideIndex} className="flex w-full flex-shrink-0 justify-center items-center space-x-8 px-4">
                {carBrands.slice(slideIndex * 6, (slideIndex + 1) * 6).map((brand, index) => (
                  <div
                    key={`${slideIndex}-${index}`}
                    className="flex-1 max-w-xs h-20 flex items-center justify-center transform hover:scale-110 transition-all duration-300 opacity-70 hover:opacity-100"
                  >
                    <img
                      src={brand.logo}
                      alt={brand.alt}
                      className="max-h-16 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/200x80/666666/FFFFFF?text=${brand.name}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(carBrands.length / 6) }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-orange-500 scale-125'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-orange-300 dark:hover:bg-orange-400'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}