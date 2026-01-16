import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface ScrollWheelProps {
  items: string[];
  onChange: (value: string) => void;
  initialValue?: string;
  label?: string;
}

export function ScrollWheel({ items, onChange, initialValue, label }: ScrollWheelProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    axis: 'y',
    dragFree: false,
    containScroll: 'trimSnaps'
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onChange(items[index]);
  }, [emblaApi, items, onChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    // Set initial value
    if (initialValue) {
      const idx = items.indexOf(initialValue);
      if (idx !== -1) {
        emblaApi.scrollTo(idx, true);
      }
    }
  }, [emblaApi, onSelect, initialValue, items]);

  return (
    <div className="relative h-48 w-20 sm:w-24 overflow-hidden select-none embla-gradient-mask">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 border-y border-primary/20 bg-primary/5 pointer-events-none z-10" />
      
      <div className="h-full" ref={emblaRef}>
        <div className="h-full flex flex-col will-change-transform">
          {items.map((item, index) => (
            <div 
              key={index} 
              className={cn(
                "flex-none h-10 flex items-center justify-center text-xl transition-all duration-200 cursor-pointer",
                index === selectedIndex 
                  ? "text-primary font-bold scale-110" 
                  : "text-muted-foreground opacity-50 scale-90"
              )}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      {label && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-2 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}

export function TimePicker({ onTimeChange, initialTime = "07:30" }: { onTimeChange: (time: string) => void, initialTime?: string }) {
  return (
    <div className="flex gap-4 items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-primary/10">
      <input
        type="time"
        defaultValue={initialTime}
        onChange={(e) => onTimeChange(e.target.value)}
        className="text-3xl font-bold text-primary bg-transparent border-none focus:ring-0 cursor-pointer appearance-none"
        style={{ colorScheme: 'light' }}
      />
    </div>
  );
}
