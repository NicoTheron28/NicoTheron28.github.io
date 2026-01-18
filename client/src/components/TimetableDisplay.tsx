import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import badgeUrl from '@assets/Wesvalia_1-removebg-preview_1768752339288.png';

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
      const endSeconds = 13 * 3600 + 50 * 60; // 13:50:00
      
      const WALK = 4 * 60;
      const BREAK = 30 * 60;
      
      // According to the example provided:
      // Total gaps: 
      // 1. Start -> Walk -> P1
      // 2. P1 -> Walk -> P2
      // 3. P2 -> Walk -> P3
      // 4. P3 -> Walk -> P4
      // 5. P4 -> Pouse (0 walk)
      // 6. Pouse -> Walk -> P5
      // 7. P5 -> Walk -> P6
      // 8. P6 -> Walk -> P7
      // 9. P7 -> Walk -> P8
      
      // Total walking gaps = 8 (Start-P1, P1-P2, P2-P3, P3-P4, Pouse-P5, P5-P6, P6-P7, P7-P8)
      const totalDeductions = (8 * WALK) + BREAK;
      const totalClassTime = endSeconds - startSeconds - totalDeductions;
      
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
          period: `Periode ${i}`,
          start: formatTime(Math.round(pStart)),
          end: formatTime(Math.round(pEnd)),
        });
        currentSeconds = pEnd;
        if (i < 4) {
          currentSeconds += WALK;
        }
      }

      // Pouse (No walk before)
      const breakStart = currentSeconds;
      const breakEnd = breakStart + BREAK;
      slots.push({
        period: "Pouse",
        start: formatTime(Math.round(breakStart)),
        end: formatTime(Math.round(breakEnd)),
        isBreak: true
      });
      currentSeconds = breakEnd;

      // Pouse -> Walk -> P5
      currentSeconds += WALK;
      
      // Periods 5-8
      for (let i = 5; i <= 8; i++) {
        const pStart = currentSeconds;
        const pEnd = pStart + periodLengthSeconds;
        slots.push({
          period: `Periode ${i}`,
          start: formatTime(Math.round(pStart)),
          end: i === 8 ? "13:50" : formatTime(Math.round(pEnd)),
        });
        currentSeconds = pEnd;
        if (i < 8) {
          currentSeconds += WALK;
        }
      }

      const totalPeriodSecs = Math.round(periodLengthSeconds);
      const min = Math.floor(totalPeriodSecs / 60);
      const sec = totalPeriodSecs % 60;
      
      return { 
        slots, 
        periodLength: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}` 
      };
    };

  const { slots, periodLength } = calculateTimetable(startTime);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#FFFFFF',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('[ref="cardRef"]') as HTMLElement;
          if (el) {
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
          }
        }
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
        className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl border border-border relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-4">
            <img src={badgeUrl} alt="Wesvalia Badge" className="w-12 h-12 object-contain mb-2 drop-shadow-md" />
            <h2 className="text-xl font-bold text-primary font-display">Wesvalia Kloktye</h2>
            <p className="text-muted-foreground text-[10px] mt-0.5">Begin Tyd: {startTime}</p>
          </div>

          <div className="space-y-1.5">
            {slots.map((slot, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex justify-between items-center p-2 rounded-lg border w-full min-h-[40px] ${
                  slot.isBreak 
                    ? "bg-secondary/20 border-secondary/30" 
                    : "bg-white border-border/50 hover:border-primary/20"
                }`}
              >
                <div className="flex-1 flex items-center justify-center text-center">
                  <span className={`text-sm font-medium leading-none ${slot.isBreak ? "text-secondary-foreground font-bold" : "text-foreground"}`}>
                    {slot.period}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="font-mono text-xs font-semibold text-primary/80 bg-primary/5 px-1.5 py-1 rounded leading-none flex items-center justify-center min-w-[100px]">
                    {slot.start} - {slot.end}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-border flex justify-center">
            <p className="text-xs font-medium text-muted-foreground">
              Klaslengte: <span className="text-primary">{periodLength}</span>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-50">Wesvalia Hoërskool</p>
          </div>
        </div>
      </div>
    </div>
  );
}
