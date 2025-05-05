import { useState, useEffect, Children, cloneElement } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Carousel = ({ children, autoPlay = true, interval = 5000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const updateIndex = (newIndex) => {
    if (newIndex < 0) {
      newIndex = Children.count(children) - 1;
    } else if (newIndex >= Children.count(children)) {
      newIndex = 0;
    }

    setActiveIndex(newIndex);
  };

  useEffect(() => {
    if (autoPlay && !paused) {
      const intervalId = setInterval(() => {
        updateIndex(activeIndex + 1);
      }, interval);

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  });

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="whitespace-nowrap transition-transform duration-300"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {Children.map(children, (child) => {
          return cloneElement(child, { width: '100%' });
        })}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {Children.map(children, (child, index) => {
          return (
            <button
              onClick={() => updateIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          );
        })}
      </div>

      <button
        onClick={() => updateIndex(activeIndex - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow-md hover:bg-white"
      >
        <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
      </button>

      <button
        onClick={() => updateIndex(activeIndex + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow-md hover:bg-white"
      >
        <ChevronRightIcon className="h-6 w-6 text-gray-800" />
      </button>
    </div>
  );
};

const CarouselItem = ({ children, width }) => {
  return (
    <div className="inline-flex items-center justify-center" style={{ width }}>
      {children}
    </div>
  );
};

export { Carousel, CarouselItem };