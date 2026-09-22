import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { SocialIcons } from "./StoreLinks";
import { useStorefront } from "@/lib/storefront";

export function Footer() {
  const { social, name, tagline } = useStorefront();
  return (
    <footer className="border-t border-white/10 bg-[#2a2a2a] py-14 text-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-neutral-400">
            {name}
            {tagline ? ` · ${tagline}` : ""}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-neutral-400">
          <Link to="/solutions" className="transition-colors hover:text-primary">
            Soluciones
          </Link>
          <Link to="/products" className="transition-colors hover:text-primary">
            Productos
          </Link>
          <a href="/#projects" className="transition-colors hover:text-primary">
            Proyectos
          </a>
          <Link to="/downloads" className="transition-colors hover:text-primary">
            Descargas
          </Link>
          <Link to="/about" className="transition-colors hover:text-primary">
            Nosotros
          </Link>
          <Link to="/contact" className="transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>

        <SocialIcons links={social} />
      </div>
    </footer>
  );
}
