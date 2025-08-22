// components/ClientErrorBoundaryWrapper.tsx
'use client';

import { ReactNode } from 'react';
import { ApiErrorBoundary } from './error-boundaries/ApiErrorBoundary';

interface ClientErrorBoundaryWrapperProps {
  children: ReactNode;
  siteName?: string;
}

export default function ClientErrorBoundaryWrapper({
  children,
  siteName = 'Site'
}: ClientErrorBoundaryWrapperProps) {
  return (
    <ApiErrorBoundary
      context="Global"
      onError={(error, errorInfo) => {
        // Log to your error tracking service (Sentry, etc.)
        console.error('🚨 Global error caught:', error, errorInfo);

        // Send to analytics/monitoring
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: error.message,
            fatal: false
          });
        }
      }}
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="text-center">
                  <h1 className="display-1 text-muted">⚠️</h1>
                  <h2 className="mb-3">Something went wrong</h2>
                  <p className="text-muted mb-4">
                    We're experiencing technical difficulties. Please try refreshing the page.
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <button onClick={() => window.location.reload()} className="btn btn-primary">
                      Refresh Page
                    </button>
                    <a href="/" className="btn btn-outline-secondary">
                      Go Home
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Header Error Boundary - isolate header failures */}
      <ApiErrorBoundary
        context="Header"
        fallback={
          <header className="bg-dark text-light p-3">
            <div className="container">
              <div className="d-flex justify-content-between align-items-center">
                <a href="/" className="text-light text-decoration-none">
                  <strong>{siteName}</strong>
                </a>
                <nav>
                  <a href="/shop" className="text-light me-3">
                    Shop
                  </a>
                  <a href="/cart" className="text-light">
                    Cart
                  </a>
                </nav>
              </div>
            </div>
          </header>
        }
      >
        {/* Main Content Error Boundary - isolate page content failures */}
        <ApiErrorBoundary
          context="MainContent"
          fallback={
            <main className="min-h-screen">
              <div className="container py-5">
                <div className="alert alert-warning" role="alert">
                  <h4 className="alert-heading">Content Loading Issue</h4>
                  <p>We're having trouble loading this content. This might be due to:</p>
                  <ul className="mb-0">
                    <li>Temporary network connectivity issues</li>
                    <li>Server maintenance</li>
                    <li>High traffic volume</li>
                  </ul>
                  <hr />
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="btn btn-warning btn-sm"
                    >
                      Try Again
                    </button>
                    <a href="/" className="btn btn-outline-warning btn-sm">
                      Go to Homepage
                    </a>
                  </div>
                </div>
              </div>
            </main>
          }
        >
          {children}
        </ApiErrorBoundary>
      </ApiErrorBoundary>
    </ApiErrorBoundary>
  );
}
