import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Phone } from "lucide-react";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { PageHero } from "@/components/wefa/PageHero";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { useStorefront } from "@/lib/storefront";
import heroContact from "@/assets/hero-contact.webp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacto — REDEX" },
      {
        name: "description",
        content: "Escríbele a REDEX por WhatsApp o correo para cotizar tubería y accesorios.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const store = useStorefront();
  const facebook = store.social.find((link) => link.key === "facebook");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero eyebrow="REDEX" title="Contacto" image={heroContact} alt="" />

      <main>
        <section className="py-20">
          <div className="mx-auto grid max-w-[1200px] gap-14 px-5 lg:grid-cols-2 lg:px-10">
            <RiseIn delay={riseStagger(0)}>
              <div>
              <h2 className="text-3xl font-semibold">{store.name}</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Escríbenos por WhatsApp o correo para cotizar. También puedes seguir la página de
                Facebook de {store.name}.
              </p>
              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
              </div>
            </RiseIn>

            <RiseIn delay={riseStagger(1)}>
              <div className="space-y-8 border border-border bg-card p-8 sm:p-10">
              {store.whatsapp && store.whatsappHref ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    WhatsApp
                  </h3>
                  <a
                    href={store.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xl font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    {store.whatsapp}
                  </a>
                </div>
              ) : null}

              {store.email ? (
                <div className={store.whatsapp ? "border-t border-border pt-8" : ""}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Correo
                  </h3>
                  <a
                    href={`mailto:${store.email}`}
                    className="mt-3 inline-flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    {store.email}
                  </a>
                </div>
              ) : null}

              {store.phone && store.phone !== store.whatsapp ? (
                <div className="border-t border-border pt-8">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Teléfono
                  </h3>
                  <a
                    href={`tel:${store.phone.replace(/\s/g, "")}`}
                    className="mt-3 flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    {store.phone}
                  </a>
                </div>
              ) : null}

              {store.address ? (
                <div className="border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">Dirección</p>
                  <p className="mt-3 whitespace-pre-line text-base text-foreground">{store.address}</p>
                </div>
              ) : null}

              {store.hours ? (
                <div className="border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">Horario</p>
                  <p className="mt-3 whitespace-pre-line text-base text-foreground">{store.hours}</p>
                </div>
              ) : null}

              {facebook ? (
                <div className="border-t border-border pt-8">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Facebook
                  </h3>
                  <a
                    href={facebook.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {store.name} en Facebook
                  </a>
                </div>
              ) : null}
              </div>
            </RiseIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
