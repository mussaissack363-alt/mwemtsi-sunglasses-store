export default function Footer() {
  return (
    <footer className="w-full bg-[#060607] border-t border-onyx-line py-12 px-6 mt-32 flex flex-col items-center gap-7 text-center">

      {/* Creator ad */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-[11px] tracking-[0.22em] uppercase text-onyx-accent mb-0">Built by a developer</p>
        <p className="text-base font-semibold text-onyx-text m-0">Want a website like this?</p>
        <p className="text-[14px] text-onyx-muted m-0">I build premium web experiences for businesses.</p>
        <p className="text-[14px] text-onyx-muted m-0">Contact me — let's build yours.</p>
        <a
          href="https://wa.me/255695525257?text=Hi%2C%20I%20saw%20the%20Mwemtsi%20website%20and%20I%27d%20like%20a%20website%20like%20that"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-onyx-accent text-onyx-accent text-[14px] font-medium tracking-wide no-underline active:bg-onyx-accent active:text-[#181206] hover:bg-onyx-accent hover:text-[#181206] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.09-4.85-4.28-.14-.19-1.16-1.55-1.16-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.2.68-.79.86-1.06.18-.28.36-.23.61-.14.24.09 1.55.73 1.82.87.27.13.44.2.51.31.07.12.07.68-.17 1.35z" />
          </svg>
          +255 695 525 257
        </a>
      </div>

      <div className="w-16 h-px bg-onyx-line" />

      <p className="text-[12px] text-onyx-muted/70 m-0">
        © {new Date().getFullYear()} Mwemtsi Sunglasses. All rights reserved.
      </p>

    </footer>
  )
}
