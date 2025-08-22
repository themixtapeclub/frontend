import Link from 'next/link';

const { COMPANY_NAME, SITE_NAME } = process.env;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteName = SITE_NAME || 'The Mixtape Shop';

  return (
    <footer className="bg-light text-muted mt-5">
      {/* First Row - Navigation Links */}
      <div className="border-top py-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-center gap-md-4 flex-wrap gap-3">
                <Link href="/info/shipping" className="text-decoration-none text-muted small">
                  Shipping & Handling
                </Link>
                <Link href="/info/grading" className="text-decoration-none text-muted small">
                  Grading
                </Link>
                <Link href="/info/faq" className="text-decoration-none text-muted small">
                  FAQ
                </Link>
                <Link href="/info/" className="text-decoration-none text-muted small">
                  About Us
                </Link>
                <Link
                  href="/info/terms-conditions"
                  className="text-decoration-none text-muted small"
                >
                  Terms & Conditions
                </Link>
                <Link href="/info/privacy-policy" className="text-decoration-none text-muted small">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Social Icons */}
      <div className="border-top py-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-center gap-4">
                {/* Mail Icon */}
                <a
                  href="mailto:info@themixtapeclub.co"
                  className="text-muted text-decoration-none"
                  aria-label="Email"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </a>

                {/* Instagram Icon */}
                <a
                  href="https://instagram.com/themixtapeclub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-decoration-none"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </a>

                {/* Location Pin Icon */}
                <Link
                  href="/info"
                  className="text-muted text-decoration-none"
                  aria-label="Location"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row - Copyright */}
      <div className="border-top py-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <small className="text-muted">
                  &copy; {currentYear} {siteName}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
