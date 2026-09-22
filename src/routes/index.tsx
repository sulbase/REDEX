import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { WelcomeVideo } from "@/components/wefa/WelcomeVideo";
import { useStorefront } from "@/lib/storefront";
import heroImg from "@/assets/hero-bathroom.jpg";
import residentialImg from "@/assets/residential.jpg";
import commercialImg from "@/assets/commercial.jpg";
import hospitalityImg from "@/assets/hospitality.jpg";
import healthcareImg from "@/assets/healthcare.jpg";
import serviceAdvisoryImg from "@/assets/service-advisory.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REDEX – Sistemas de agua para obra" },
      {
        name: "description",
        content:
          "REDEX provee tubería y accesorios de PP-R para instalaciones de agua en edificaciones.",
      },
      { property: "og:title", content: "REDEX – Sistemas de agua para obra" },
      {
        property: "og:description",
        content:
          "Tubería y accesorios de PP-R para agua fría, agua caliente e instalaciones sanitarias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const segments = [
  { title: "Residencial", img: residentialImg },
  { title: "Comercial", img: commercialImg },
  { title: "Hotelería", img: hospitalityImg },
  { title: "Salud", img: healthcareImg },
];

function PillLink({
  children,
  to,
  href,
  variant = "solid",
}: {
  children: string;
  to?: "/products" | "/about" | "/contact" | "/solutions" | "/downloads" | "/";
  href?: string;
  variant?: "solid" | "outline";
}) {
  const base =
    "inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-[0.95rem] font-medium transition-colors";
  const styles =
    variant === "solid"
      ? "bg-primary text-primary-foreground hover:bg-primary-dark"
      : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground";
  const className = `${base} ${styles}`;
  const content = (
    <>
      {children}
      <ArrowRight className="h-4 w-4" />
    </>
  );
  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

function Index() {
  const { tagline } = useStorefront();
  const line = tagline || "Sistemas de agua para obra";
  return (
    <div id="top" className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="Baño moderno con vista a la ciudad"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background via-background/75 to-transparent sm:h-44" />
        <div className="relative px-5 text-center">
          <p className="hero-rise eyebrow mb-5 inline-block bg-primary px-3 py-1 text-primary-foreground">
            REDEX
          </p>
          <h1 className="hero-rise hero-rise-delay text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.5rem]">
            <span className="bg-primary px-4 py-1 text-primary-foreground">
              {line}
            </span>
          </h1>
        </div>
      </section>

      {/* Segments */}
      <section id="projects" className="bg-card py-24">
        <div className="mx-auto max-w-[1600px] px-5 lg:px-10">
          <RiseIn>
            <h2 className="text-center text-3xl font-semibold sm:text-5xl">Dónde se usa</h2>
          </RiseIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {segments.map((s, i) => (
              <RiseIn key={s.title} delay={riseStagger(i)}>
                <article className="group relative overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="h-[26rem] w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <h3 className="absolute bottom-6 left-6 bg-primary px-3 py-1.5 text-lg font-semibold uppercase tracking-wide text-primary-foreground">
                  {s.title}
                </h3>
              </article>
              </RiseIn>
            ))}
          </div>

          <RiseIn className="mx-auto mt-14 max-w-3xl text-center text-lg leading-relaxed text-muted-foreground">
            <p>
              Las instalaciones de agua en vivienda, comercio, hoteles y centros de salud piden
              tubería y accesorios que aguanten presión y temperatura. REDEX reúne esas piezas en un
              solo catálogo.
            </p>
            <div className="mt-9 flex justify-center">
              <PillLink href="#projects">Proyectos</PillLink>
            </div>
          </RiseIn>
        </div>
      </section>

      <WelcomeVideo />

      {/* Service and advice */}
      <section className="py-24">
        <div className="mx-auto max-w-[1600px] px-5 lg:px-10">
          <RiseIn>
            <h2 className="text-center text-3xl font-semibold sm:text-5xl">Servicio y asesoría</h2>
          </RiseIn>

          <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
            <RiseIn className="space-y-10" delay={riseStagger(0)}>
              <div className="border-l-2 border-primary pl-6">
                <h3 className="text-2xl font-semibold">Contáctanos</h3>
                <p className="mt-3 text-lg text-muted-foreground">
                  Escríbenos por WhatsApp o correo para cotizar tubería, conexiones y herramientas.
                </p>
                <div className="mt-6">
                  <PillLink to="/contact">Contacto</PillLink>
                </div>
              </div>

              <div className="border-l-2 border-primary pl-6">
                <h3 className="text-2xl font-semibold">Descargas</h3>
                <p className="mt-3 text-lg text-muted-foreground">
                  Fichas técnicas de los productos, agrupadas por categoría.
                </p>
                <div className="mt-6">
                  <PillLink to="/downloads" variant="outline">
                    Ver descargas
                  </PillLink>
                </div>
              </div>
            </RiseIn>

            <RiseIn delay={riseStagger(1)} className="flex justify-center lg:justify-end">
              <img
                src={serviceAdvisoryImg}
                alt="Catálogo REDEX en móvil y portafolio de proyectos en laptop"
                loading="lazy"
                width={1200}
                height={900}
                className="w-full max-w-[80%]"
              />
            </RiseIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
