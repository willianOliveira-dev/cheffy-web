"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareCheffyButton() {
  const handleShare = async () => {
    const shareUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const shareData = {
      title: "Cheffy - Receitas que inspiram",
      text: "Dá uma olhada no Cheffy. Tem receitas organizadas, passo a passo claro e ajuda na hora de cozinhar.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link do Cheffy copiado.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Não foi possível compartilhar agora.");
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className="h-12 rounded-full border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
      onClick={handleShare}
    >
      <Share2 data-icon="inline-start" />
      Compartilhar Cheffy
    </Button>
  );
}
