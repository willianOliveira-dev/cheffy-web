"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import {
  SiFacebook,
  SiGmail,
  SiPinterest,
  SiReddit,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import type { Recipe } from "@/services/api/generated/model";
import { Button } from "@/components/ui/button";

type RecipeShareGridProps = {
  recipe: Recipe;
};

export function RecipeShareGrid({ recipe }: RecipeShareGridProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? ""}/receitas/${recipe.slug}`;
  const text = `Veja esta receita: ${recipe.title}`;

  const platforms = useMemo(
    () => [
      {
        label: "WhatsApp",
        icon: SiWhatsapp,
        color: "#25D366",
        href: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      },
      {
        label: "Facebook",
        icon: SiFacebook,
        color: "#1877F2",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      {
        label: "X",
        icon: SiX,
        color: "#000000",
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      },
      {
        label: "Telegram",
        icon: SiTelegram,
        color: "#26A5E4",
        href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      },
      {
        label: "Pinterest",
        icon: SiPinterest,
        color: "#BD081C",
        href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(text)}`,
      },
      {
        label: "LinkedIn",
        icon: FaLinkedinIn,
        color: "#0A66C2",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      },
      {
        label: "Reddit",
        icon: SiReddit,
        color: "#FF4500",
        href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(recipe.title)}`,
      },
      {
        label: "Gmail",
        icon: SiGmail,
        color: "#EA4335",
        href: `mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(`${text}\n${shareUrl}`)}`,
      },
    ],
    [recipe.title, shareUrl, text],
  );

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: shareUrl,
      });
      return;
    }

    await handleCopy();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="default" className="rounded-full" onClick={handleNativeShare}>
          <Share2 data-icon="inline-start" />
          Compartilhar
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={handleCopy}>
          {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <div className="rounded-2xl border bg-muted/30 p-2">
        <div className="grid grid-cols-2 gap-2">
          {platforms.map(({ label, icon: Icon, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Compartilhar no ${label}`}
              className="group flex min-h-14 items-center gap-3 rounded-xl border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon color={color} size={18} title={label} />
              </span>
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Escolha uma rede social ou copie o link para enviar a receita manualmente.
      </p>
    </div>
  );
}
