import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import badgeUrl from '@assets/Wesvalia_1-removebg-preview_1768752339288.png';

interface UserSubject {
  subject: string;
  color?: string;
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
  startPeriodOffset?: number;
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
  currentDay = 1,
  startPeriodOffset = 1
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
        const actualPeriodNumber = startPeriodOffset + i - 1;
        const pStart = currentSeconds;
        const pEnd = pStart + periodLengthSeconds;
        const key = `day${currentDay}_p${actualPeriodNumber}`;
        
        slots.push({
          period: `Periode ${actualPeriodNumber}`,
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
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-center gap-3 mb-3">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold shadow-sm hover:shadow transition-all active:scale-95"
        >
          <Download className="w-3 h-3" />
          Stoor
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-[10px] font-bold shadow-sm hover:shadow transition-all active:scale-95"
        >
          <Share2 className="w-3 h-3" />
          Deel
        </button>
      </div>

      <div 
        ref={cardRef}
        className="bg-white p-2.5 rounded-2xl shadow-lg border border-border relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-1.5">
            <img src={badgeUrl} alt="Wesvalia Badge" className="w-6 h-6 object-contain mb-0.5" />
            <h2 className="text-base font-bold text-primary font-display leading-none">Wesvalia Kloktye</h2>
            <p className="text-muted-foreground text-[8px] mt-0.5 tracking-tighter">Begin: {startTime} | Klaar: {eindTyd}</p>
          </div>

          <div className="space-y-0.5">
            {slots.map((slot, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`flex flex-col p-1 rounded-md border w-full leading-none transition-colors ${
                  slot.isBreak 
                    ? "bg-secondary/10 border-secondary/20" 
                    : "border-border/30"
                }`}
                style={!slot.isBreak && slot.subjectData?.color ? { backgroundColor: `${slot.subjectData.color}20`, borderColor: slot.subjectData.color } : {}}
              >
                <div className="flex justify-between items-center w-full gap-1.5">
                  <div className="flex-1 text-left">
                    <span 
                      className={`text-[11px] font-bold leading-none ${slot.isBreak ? "text-secondary-foreground" : "text-foreground"}`}
                      style={!slot.isBreak && slot.subjectData?.color ? { color: slot.subjectData.color === '#FFFFFF' || slot.subjectData.color === '#Swart' ? undefined : slot.subjectData.color } : {}}
                    >
                      {slot.period}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="font-mono text-[9px] font-bold text-primary/80 bg-primary/5 px-1 py-0.5 rounded-[2px] leading-none">
                      {slot.start} - {slot.end}
                    </div>
                  </div>
                </div>

                {!slot.isBreak && slot.subjectData?.subject && (
                  <div className="mt-0.5 pt-0.5 border-t border-border/10 flex flex-col gap-0.5">
                    <div 
                      className="text-[10px] font-bold text-primary truncate leading-tight"
                      style={slot.subjectData.color ? { color: slot.subjectData.color === '#FFFFFF' ? undefined : slot.subjectData.color } : {}}
                    >
                      {slot.subjectData.subject}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-2 pt-1 border-t border-dotted border-border/40 flex justify-between items-center px-1">
            <p className="text-[8px] font-bold text-muted-foreground">
              Klas: <span className="text-primary">{periodLength}</span>
            </p>
            <p className="text-[6px] text-muted-foreground uppercase tracking-widest opacity-30 italic">Wesvalia Hoërskool</p>
          </div>
        </div>
      </div>
    </div>
  );
}
