import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import badgeUrl from '@assets/Wesvalia_1-removebg-preview_1768752339288.png';

interface UserSubject {
  subject: string;
  room: string;
  teacher: string;
}

interface TimetableDisplayProps {
  startTime: string;
  pouseCount?: number;
  pouseDuur?: number;
  eindTyd?: string;
  periodCount?: number;
  breakAfter?: number;
  userSubjects?: Record<string, UserSubject>;
  currentDay?: number;
}

interface TimeSlot {
  period: string; // "1", "2", "Pouse", etc.
  start: string;
  end: string;
  isBreak?: boolean;
  subjectData?: UserSubject;
}

export function TimetableDisplay({ 
  startTime, 
  pouseCount = 1, 
  pouseDuur = 30, 
  eindTyd = "13:50",
  periodCount = 8,
  breakAfter = 4,
  userSubjects = {},
  currentDay = 1
}: TimetableDisplayProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

    // Calculation Logic
    const calculateTimetable = (startStr: string): { slots: TimeSlot[], periodLength: string } => {
      const [h, m] = startStr.split(':').map(Number);
      const startSeconds = h * 3600 + m * 60;
      
      const [endH, endM] = eindTyd.split(':').map(Number);
      const endSeconds = endH * 3600 + endM * 60;
      
      const WALK = 4 * 60;
      const BREAK_DURATION = pouseDuur * 60;
      
      let breakDeductions = pouseCount * BREAK_DURATION;
      const totalDeductions = (periodCount * WALK) + breakDeductions;
      const totalClassTime = endSeconds - startSeconds - totalDeductions;
      
      // Dynamic Periods
      const periodLengthSeconds = totalClassTime / periodCount;
      
      const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      const slots: TimeSlot[] = [];
      let currentSeconds = startSeconds;

      // Start -> Walk -> P1
      currentSeconds += WALK;

      const addBreak = () => {
        const bStart = currentSeconds;
        const bEnd = bStart + BREAK_DURATION;
        slots.push({
          period: "Pouse",
          start: formatTime(Math.round(bStart)),
          end: formatTime(Math.round(bEnd)),
          isBreak: true
        });
        currentSeconds = bEnd;
        currentSeconds += WALK; // Walk after break
      };

      for (let i = 1; i <= periodCount; i++) {
        const pStart = currentSeconds;
        const pEnd = pStart + periodLengthSeconds;
        const key = `day${currentDay}_p${i}`;
        
        slots.push({
          period: `Periode ${i}`,
          start: formatTime(Math.round(pStart)),
          end: i === periodCount ? eindTyd : formatTime(Math.round(pEnd)),
          subjectData: userSubjects[key]
        });
        currentSeconds = pEnd;

        // Break logic
        if (pouseCount === 1 && i === breakAfter) {
          addBreak();
        } else if (pouseCount === 2) {
          const secondBreakAfter = Math.min(periodCount - 1, breakAfter + Math.floor((periodCount - breakAfter) / 2));
          if (i === breakAfter || i === secondBreakAfter) {
            addBreak();
          } else if (i < periodCount) {
            currentSeconds += WALK;
          }
        } else if (i < periodCount) {
          currentSeconds += WALK;
        }
      }

      const totalPeriodSecs = Math.max(0, Math.round(periodLengthSeconds));
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
            <p className="text-muted-foreground text-[10px] mt-0.5">Begin: {startTime} | Klaar: {eindTyd}</p>
          </div>

          <div className="space-y-1.5">
            {slots.map((slot, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col p-2 rounded-lg border w-full ${
                  slot.isBreak 
                    ? "bg-secondary/20 border-secondary/30" 
                    : "bg-white border-border/50 hover:border-primary/20"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex-1 text-left">
                    <span className={`text-sm font-medium leading-none ${slot.isBreak ? "text-secondary-foreground font-bold" : "text-foreground"}`}>
                      {slot.period}
                    </span>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <div className="font-mono text-[10px] font-semibold text-primary/80 bg-primary/5 px-1.5 py-1 rounded leading-none">
                      {slot.start} - {slot.end}
                    </div>
                  </div>
                </div>

                {!slot.isBreak && slot.subjectData?.subject && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-border/30 flex flex-col gap-0.5"
                  >
                    <div className="text-xs font-bold text-primary truncate">
                      {slot.subjectData.subject}
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground font-medium">
                      <span>{slot.subjectData.teacher || "Geen Onnie"}</span>
                      <span className="bg-muted px-1 rounded">{slot.subjectData.room || "N/A"}</span>
                    </div>
                  </motion.div>
                )}
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
