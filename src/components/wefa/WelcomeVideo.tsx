import { RiseIn } from "@/components/wefa/RiseIn";
import { useStorefront } from "@/lib/storefront";

export function WelcomeVideo() {
  const { name, tagline, welcomeVideo } = useStorefront();
  if (!welcomeVideo) return null;

  const line = tagline || "Sistemas de agua para obra";

  return (
    <section className="bg-[#2a2a2a] py-20 text-white">
      <div className="mx-auto max-w-[1100px] px-5 lg:px-10">
        <RiseIn className="text-center">
          <p className="eyebrow mb-8 inline-block bg-primary px-4 py-1.5 text-primary-foreground">
            {name || "REDEX"}
          </p>
          <div className="mx-auto max-w-3xl space-y-5 text-[0.95rem] leading-relaxed text-white/80 sm:text-base">
            <p>
              {name} comercializa tubería y accesorios de PP-R para instalaciones de agua en
              edificaciones, con foco en durabilidad y calidad en obra.
            </p>
            <p>
              El equipo acompaña a instaladores, constructores y distribuidores para armar el
              pedido con la medida de cada variante. {line}.
            </p>
          </div>
        </RiseIn>

        <RiseIn className="mt-12" delay={90}>
          <div className="overflow-hidden bg-black">
            <div className="relative aspect-video w-full">
              <iframe
                src={welcomeVideo.embedUrl}
                title={welcomeVideo.title || `Video de bienvenida de ${name}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </RiseIn>
      </div>
    </section>
  );
}
