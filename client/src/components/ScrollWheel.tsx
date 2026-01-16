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
    dragFree: true,
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
  const hours = Array.from({ length: 6 }, (_, i) => String(i + 5).padStart(2, '0')); // 05 to 10 am
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const [initialH, initialM] = initialTime.split(':');
  const [h, setH] = useState(initialH);
  const [m, setM] = useState(initialM);

  useEffect(() => {
    onTimeChange(`${h}:${m}`);
  }, [h, m, onTimeChange]);

  return (
    <div className="flex gap-4 items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-primary/10">
      <ScrollWheel 
        items={hours} 
        onChange={setH} 
        initialValue={initialH} 
      />
      <span className="text-2xl font-bold text-primary pb-2">:</span>
      <ScrollWheel 
        items={minutes} 
        onChange={setM} 
        initialValue={initialM} 
      />
    </div>
  );
}
