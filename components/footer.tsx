"use client";

type FooterLink = { label: string; href: string };

export type FooterProps = {
  brand?: string;
  maker?: string;
  logoSrc?: string | null;
  logoChipBg?: string;
  year?: number;
  copyright?: string;
  links?: FooterLink[];
  note?: string;
  className?: string;
};

export function Footer({
  brand = "EDEN APPWORKS",
  maker = "eden",
  logoSrc = "/logo.png",
  logoChipBg = "#ffffff",
  year = new Date().getFullYear(),
  copyright,
  links = [],
  note,
  className = "",
}: FooterProps) {
  const hasMeta = links.length > 0 || !!note;

  return (
    <footer
      className={`border-border/40 text-muted-foreground mx-auto w-full max-w-2xl border-t px-5 py-9 text-center ${className}`}
    >
      {logoSrc && (
        <span
          className="ring-black/5 mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-xl p-1.5 ring-1"
          style={{ backgroundColor: logoChipBg }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={brand}
            className="h-full w-full object-contain"
            onError={(e) => {
              const chip = e.currentTarget.closest("span");
              if (chip) chip.style.display = "none";
            }}
          />
        </span>
      )}

      {brand && (
        <p className="text-foreground/70 mb-1.5 text-[11px] font-medium tracking-[0.28em]">
          {brand}
        </p>
      )}

      <p className="text-xs tracking-wide">
        {copyright ?? (
          <>
            © {year} · designed &amp; built by{" "}
            <span className="text-foreground/70">{maker}</span>
          </>
        )}
      </p>

      {hasMeta && (
        <p className="text-muted-foreground/70 mt-1.5 text-xs">
          {links.map((link, i) => (
            <span key={link.href}>
              {i > 0 && <span className="mx-1.5">·</span>}
              <a href={link.href} className="hover:text-primary underline underline-offset-2">
                {link.label}
              </a>
            </span>
          ))}
          {note && (
            <>
              {links.length > 0 && <span className="mx-1.5">·</span>}
              {note}
            </>
          )}
        </p>
      )}
    </footer>
  );
}
