import type { ComponentType } from "react";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

import type { StoreSocialLink } from "@/lib/directus";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  x: Twitter,
  linkedin: Linkedin,
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M14.5 3c.4 2.4 1.8 4.1 4 4.5v2.4c-1.4 0-2.7-.4-4-1.2v6.6a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.6a3.2 3.2 0 1 0 2.3 3.1V3h2.6Z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2.2A9.8 9.8 0 0 0 7.4 20.3c-.1-.8-.2-2 0-2.9l1.5-6.3s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.6-2.7 3.6-6 0-2.5-1.7-4.3-4.8-4.3A5.1 5.1 0 0 0 6.6 10c0 1 .3 1.7.8 2.2.2.2.3.3.2.6l-.3 1.1c0 .2-.2.3-.5.2-1.5-.6-2.2-2.3-2.2-4.1 0-3.1 2.6-6.7 7.8-6.7 4.2 0 6.9 3 6.9 6.3 0 4.3-2.4 7.5-5.9 7.5-1.2 0-2.3-.6-2.7-1.4l-.7 2.8c-.2.9-.8 1.9-1.2 2.6A9.8 9.8 0 1 0 12 2.2Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.76 13.9c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.63-.61-2.87-1.24-4.74-4.13-4.88-4.32-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.26.64-.38.85-.38h.61c.2 0 .46-.07.72.55.27.64.92 2.2.99 2.36.08.16.13.35.03.56-.1.21-.15.34-.3.52-.15.18-.31.4-.44.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.08.13.08.73-.16 1.41Z" />
    </svg>
  );
}

const EXTRA: Record<string, ComponentType<{ className?: string }>> = {
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

export function SocialIcons({ links }: { links: StoreSocialLink[] }) {
  if (!links.length) return null;
  return (
    <div className="flex items-center gap-4">
      {links.map((link) => {
        const Icon = ICONS[link.key] || EXTRA[link.key];
        return (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-primary"
          >
            {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm">{link.label}</span>}
          </a>
        );
      })}
    </div>
  );
}

export function WhatsAppButton({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="wa-pulse fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
