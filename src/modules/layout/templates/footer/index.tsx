// src/modules/layout/templates/footer/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsletterForm from "@modules/layout/components/newsletter-form"

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function MixcloudIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 640 512" fill="currentColor">
      <path d="M424.4 219.7C416.1 134.7 344.1 68 256.9 68c-72.3 0-136.2 46.5-159.2 114.1-54.5 8-96.6 54.8-96.6 111.6 0 62.3 50.7 113 113.2 113h289.6c52.3 0 95-42.4 95-94.7 0-45.1-32.1-83.1-74.5-92.2zm-20.5 144.5H114.3c-39 0-70.9-31.6-70.9-70.6s31.8-70.6 70.9-70.6c18.8 0 36.5 7.5 49.8 20.8 20 20 50.1-10.2 30.2-30.2-14.7-14.4-32.7-24.4-52.1-29.4 19.9-44.3 64.8-73.9 114.6-73.9 69.5 0 126 56.5 126 125.7 0 13.6-2.2 26.9-6.4 39.6-8.9 27.5 32.1 38.9 40.1 13.3 2.8-8.3 5-16.9 6.4-25.5 19.4 7.5 33.5 26.3 33.5 48.5 0 28.8-23.5 52.3-52.6 52.3zm235.1-52.3c0 44-12.7 86.4-37.1 122.7-4.2 6.1-10.8 9.4-17.7 9.4-16.3 0-27.1-18.8-17.4-32.9 19.4-29.4 29.9-63.7 29.9-99.1s-10.5-69.8-29.9-98.9c-9.7-14.2 1.1-32.9 17.4-32.9 6.9 0 13.5 3.3 17.7 9.4 24.4 36.1 37.1 78.4 37.1 122.3zM555 311.9c0 26.2-7.6 51.5-22.1 73.1-4.2 6.1-10.8 9.4-17.7 9.4-16.3 0-27.1-18.8-17.4-32.9 9.7-14.7 14.8-31.6 14.8-49.6s-5.1-34.9-14.8-49.6c-9.7-14.2 1.1-32.9 17.4-32.9 6.9 0 13.5 3.3 17.7 9.4 14.5 21.6 22.1 46.9 22.1 73.1z"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

export default async function Footer() {
  const footerLinks = [
    { href: "/shipping-handling", label: "Shipping & Handling" },
    { href: "/grading", label: "Grading" },
    { href: "/faq", label: "FAQ" },
    { href: "/info", label: "About Us" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
    { href: "/privacy-policy", label: "Privacy Policy" },
  ]

  return (
    <footer className="w-full bg-black text-neutral-300">
      <div className="content-container">
        <NewsletterForm />
      </div>

      <div className="flex flex-col items-center text-center mono">
        <div className="w-full py-3 border-b border-neutral-700">
          <ul className="flex flex-wrap justify-center gap-x-1 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.href} className="px-2">
                <LocalizedClientLink 
                  href={link.href}
                  className="hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full flex justify-center py-3 border-b border-neutral-700">
          <ul className="flex gap-x-2">
            <li className="mx-2">
              <a 
                href="https://instagram.com/themixtapeclub/" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </li>
            <li className="mx-2">
              <a 
                href="https://www.mixcloud.com/themixtapeclub/" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Mixcloud"
              >
                <MixcloudIcon />
              </a>
            </li>
            <li className="mx-2">
              <LocalizedClientLink 
                href="/info"
                className="hover:text-white transition-colors"
                aria-label="Email"
              >
                <EmailIcon />
              </LocalizedClientLink>
            </li>
            <li className="mx-2">
              <LocalizedClientLink 
                href="/info"
                className="hover:text-white transition-colors"
                aria-label="Location"
              >
                <MapPinIcon />
              </LocalizedClientLink>
            </li>
          </ul>
        </div>

        <div className="w-full flex justify-center py-3">
          <p className="text-sm">
            © {new Date().getFullYear()} The Mixtape Club
          </p>
        </div>
      </div>
    </footer>
  )
}