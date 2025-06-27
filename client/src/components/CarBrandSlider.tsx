import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

const carBrands = [
  {
    name: "Mercedes-Benz",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Mercedes-Logo.png",
    alt: "Mercedes-Benz Logo"
  },
  {
    name: "BMW",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png",
    alt: "BMW Logo"
  },
  {
    name: "Audi",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Audi-Logo.png",
    alt: "Audi Logo"
  },
  {
    name: "Lexus",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Lexus-Logo.png",
    alt: "Lexus Logo"
  },
  {
    name: "Toyota",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Toyota-Logo.png",
    alt: "Toyota Logo"
  },
  {
    name: "Honda",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Honda-Logo.png",
    alt: "Honda Logo"
  },
  {
    name: "Porsche",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Porsche-Logo.png",
    alt: "Porsche Logo"
  },
  {
    name: "Jaguar",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Jaguar-Logo.png",
    alt: "Jaguar Logo"
  }
];

export function CarBrandSlider() {
  const { t, isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(carBrands.length / 4));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getVisibleBrands = () => {
    const brandsPerSlide = 4;
    const startIndex = currentIndex * brandsPerSlide;
    return carBrands.slice(startIndex, startIndex + brandsPerSlide);
  };

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
            {Array.from({ length: Math.ceil(carBrands.length / 4) }).map((_, slideIndex) => (
              <div key={slideIndex} className="flex w-full flex-shrink-0 justify-center space-x-8">
                {carBrands.slice(slideIndex * 4, (slideIndex + 1) * 4).map((brand, index) => (
                  <div
                    key={`${slideIndex}-${index}`}
                    className="flex-1 max-w-xs bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="flex items-center justify-center h-24 mb-4">
                      <img
                        src={brand.logo}
                        alt={brand.alt}
                        className="max-h-full max-w-full object-contain filter hover:brightness-110 transition-all duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/200x80/000000/FFFFFF?text=${brand.name}`;
                        }}
                      />
                    </div>
                    <h3 className="text-center text-lg font-semibold text-foreground">
                      {brand.name}
                    </h3>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(carBrands.length / 4) }).map((_, index) => (
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