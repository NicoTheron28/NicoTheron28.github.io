import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Save, MessageSquare, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [content, setContent] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("13:50");
  const [startPeriod, setStartPeriod] = useState<string>("1");
  const [endPeriod, setEndPeriod] = useState<string>("8");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const { data: motd } = useQuery<{ content: string }>({
    queryKey: ['/api/message'],
  });

  const { data: settings } = useQuery<{ currentDay: number, startTime: string, endTime: string, startPeriod: number, endPeriod: number }>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (settings) {
      setSelectedDay(settings.currentDay.toString());
      setStartTime(settings.startTime || "07:30");
      setEndTime(settings.endTime || "13:50");
      setStartPeriod((settings.startPeriod || 1).toString());
      setEndPeriod((settings.endPeriod || 8).toString());
    }
  }, [settings]);

  const messageMutation = useMutation({
    mutationFn: async (data: { content: string; adminKey: string }) => {
      const res = await apiRequest("POST", "/api/message", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/message"] });
      if (data && data.content) {
        localStorage.setItem('wesvalia_motd', JSON.stringify(data));
      }
      toast({
        title: "Sukses!",
        description: "Boodskap is opgedateer.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Ongeldige wagwoord of bedienerfout.",
        variant: "destructive",
      });
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: { day: number; startTime: string; endTime: string; startPeriod: number; endPeriod: number; adminKey: string }) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Sukses!",
        description: `Skool-dag en tye opgedateer.`,
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon nie skool-dag opdateer nie.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    messageMutation.mutate({ content, adminKey });
  };

  const handleUpdateDay = (e: React.FormEvent) => {
    e.preventDefault();
    settingsMutation.mutate({ 
      day: parseInt(selectedDay), 
      startTime, 
      endTime, 
      startPeriod: parseInt(startPeriod),
      endPeriod: parseInt(endPeriod),
      adminKey 
    });
    
    // Sync using the new format requested
    const periodsString = `${startPeriod}-${endPeriod}`;
    apiRequest("POST", `/api/set-schedule?schedule_day=${selectedDay}&periods=${periodsString}`, {})
      .catch(err => console.error("Sync to schedules failed:", err));
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display font-bold text-primary">
              Admin Paneel
            </CardTitle>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> Admin Wagwoord
              </label>
              <Input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Tik jou geheime sleutel in"
                className="bg-muted/50 text-center"
                required
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* School Day Selector */}
            <form onSubmit={handleUpdateDay} className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="w-3 h-3" /> Huidige Skool-dag
                </label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Kies 'n dag" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dag {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {showAdvanced ? "Versteek gevorderde stellings" : "Wys gevorderde stellings"}
                </Button>
              </div>

              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Begin Periode
                      </label>
                      <Select value={startPeriod} onValueChange={setStartPeriod}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Begin" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                            <SelectItem key={p} value={p.toString()}>
                              Periode {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Einde Periode
                      </label>
                      <Select value={endPeriod} onValueChange={setEndPeriod}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Einde" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                            <SelectItem key={p} value={p.toString()}>
                              Periode {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Begin Tyd
                      </label>
                      <Input 
                        type="time" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Einde Tyd
                      </label>
                      <Input 
                        type="time" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-gold"
                disabled={settingsMutation.isPending}
              >
                {settingsMutation.isPending ? "Besig..." : "Opdateer Skool-dag & Stellings"}
              </Button>
            </form>

            {/* MOTD Update */}
            <form onSubmit={handleUpdateMessage} className="space-y-4 pt-6 border-t border-border">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Boodskap van die Dag
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={motd?.content || "Tik die nuwe boodskap hier..."}
                  className="min-h-[100px] bg-muted/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-gold hover:bg-primary/90"
                disabled={messageMutation.isPending}
              >
                {messageMutation.isPending ? "Besig..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Opdateer Boodskap
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
