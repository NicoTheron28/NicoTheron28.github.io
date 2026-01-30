import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Save, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const { data: motd } = useQuery<{ content: string }>({
    queryKey: ['/api/message'],
  });

  const mutation = useMutation({
    mutationFn: async (data: { content: string; adminKey: string }) => {
      const res = await apiRequest("POST", "/api/message", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message"] });
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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ content, adminKey });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display font-bold text-primary">
              Admin Paneel
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dateer die "Boodskap van die Dag" op
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Admin Wagwoord
                </label>
                <Input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Tik jou geheime sleutel in"
                  className="bg-muted/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Nuwe Boodskap
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
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Besig..." : (
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
