import logoRedex from "@/assets/logo-redex.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logoRedex}
      alt="REDEX Termofusión"
      width={240}
      height={72}
      className={`h-11 w-auto max-w-[min(240px,58vw)] object-contain object-left sm:h-12 ${className}`}
    />
  );
}
