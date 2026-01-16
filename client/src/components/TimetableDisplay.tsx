import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import badgeUrl from '@assets/Wesvalia_1_1768581137191.png';

interface TimetableDisplayProps {
  startTime: string;
}

interface TimeSlot {
  period: string; // "1", "2", "Pouse", etc.
  start: string;
  end: string;
  isBreak?: boolean;
}

export function TimetableDisplay({ startTime }: TimetableDisplayProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

    // Calculation Logic
    const calculateTimetable = (startStr: string): { slots: TimeSlot[], periodLength: string } => {
      const [h, m] = startStr.split(':').map(Number);
      const startSeconds = h * 3600 + m * 60;
      const endSeconds = 13 * 3600 + 50 * 60; // 13:50
      
      const WALK = 4 * 60;
      const BREAK = 30 * 60;
      
      // Total duration from Start to 13:50
      const totalDuration = endSeconds - startSeconds;
      
      // Deductions: 
      // 1 initial walk (before P1)
      // 6 walking gaps (P1-P2, P2-P3, P3-P4, P5-P6, P6-P7, P7-P8)
      // 1 break (30 mins)
      const totalDeductions = (7 * WALK) + BREAK;
      const totalClassTime = totalDuration - totalDeductions;
      
      // 8 Periods
      const periodLengthSeconds = totalClassTime / 8;
      
      const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      const slots: TimeSlot[] = [];
      let currentSeconds = startSeconds;

      // Start -> Walk -> P1
      currentSeconds += WALK;

      // Periods 1-4
      for (let i = 1; i <= 4; i++) {
        const pStart = currentSeconds;
        const pEnd = pStart + periodLengthSeconds;
        slots.push({
          period: `Tydperk ${i}`,
          start: formatTime(pStart),
          end: formatTime(pEnd),
        });
        currentSeconds = pEnd;
        if (i < 4) currentSeconds += WALK;
      }

      // Period 4 -> Break (No walk)
      const breakStart = currentSeconds;
      const breakEnd = breakStart + BREAK;
      slots.push({
        period: "Pouse",
        start: formatTime(breakStart),
        end: formatTime(breakEnd),
        isBreak: true
      });
      currentSeconds = breakEnd;

      // Break -> P5 (Assume walk happens here to align with "except before break")
      // If walk is NOT before break, it must be everywhere else including after break.
      currentSeconds += WALK;
      
      // Periods 5-8
      for (let i = 5; i <= 8; i++) {
        const pStart = currentSeconds;
        const pEnd = pStart + periodLengthSeconds;
        slots.push({
          period: `Tydperk ${i}`,
          start: formatTime(pStart),
          end: i === 8 ? "13:50" : formatTime(pEnd),
        });
        currentSeconds = pEnd;
        if (i < 8) currentSeconds += WALK;
      }

      const minutes = Math.floor(periodLengthSeconds / 60);
      const seconds = Math.floor(periodLengthSeconds % 60);
      
      return { 
        slots, 
        periodLength: `${minutes} min${seconds > 0 ? ` ${seconds}s` : ''}` 
      };
    };

  const { slots, periodLength } = calculateTimetable(startTime);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#FFFFFF',
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Wesvalia_Rooster_${new Date().toLocaleDateString()}.png`;
      link.click();
      
      toast({
        title: "Sukses!",
        description: "Rooster gestoor as foto.",
      });
    } catch (err) {
      toast({
        title: "Fout",
        description: "Kon nie die rooster stoor nie.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
     if (navigator.share && cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { scale: 2 });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], "rooster.png", { type: "image/png" });
          await navigator.share({
            title: 'Wesvalia Kloktye',
            text: `My skoolrooster vir vandag (Begin: ${startTime})`,
            files: [file]
          });
        });
      } catch (err) {
        console.error("Share failed", err);
      }
     } else {
       handleDownload(); // Fallback
     }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex justify-center gap-4">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Stoor
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          Deel
        </button>
      </div>

      <div 
        ref={cardRef}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-border relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-6">
            <img src={badgeUrl} alt="Wesvalia Badge" className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
            <h2 className="text-2xl font-bold text-primary font-display">Wesvalia Kloktye</h2>
            <p className="text-muted-foreground text-sm mt-1">Begin Tyd: {startTime}</p>
          </div>

          <div className="space-y-3">
            {slots.map((slot, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex justify-between items-center p-3 rounded-xl border ${
                  slot.isBreak 
                    ? "bg-secondary/20 border-secondary/30" 
                    : "bg-white border-border/50 hover:border-primary/20"
                }`}
              >
                <span className={`font-medium ${slot.isBreak ? "text-secondary-foreground font-bold" : "text-foreground"}`}>
                  {slot.period}
                </span>
                <div className="font-mono text-sm font-semibold text-primary/80 bg-primary/5 px-2 py-1 rounded-md">
                  {slot.start} - {slot.end}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-border flex justify-center">
            <p className="text-sm font-medium text-muted-foreground">
              Klaslengte: <span className="text-primary">{periodLength}</span>
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Wesvalia Hoërskool</p>
          </div>
        </div>
      </div>
    </div>
  );
}
