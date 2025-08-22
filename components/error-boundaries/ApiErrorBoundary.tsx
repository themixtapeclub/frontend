// components/error-boundaries/ApiErrorBoundary.tsx
'use client';

import { ArrowLeftIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Component, ReactNode } from 'react';

interface ApiErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorId?: string;
}

interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  name?: string;
}

export class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ApiErrorBoundaryState {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorId
    });

    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${this.props.name || 'Unknown'}`);
      console.error('Error ID:', errorId);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined
    });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6 py-5 text-center">
              <ExclamationTriangleIcon
                className="text-warning mb-3"
                style={{ width: '4rem', height: '4rem' }}
              />
              <h2 className="fs-2 mb-3">Something went wrong</h2>
              <p className="text-muted mb-4">We encountered an error while loading this content.</p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <ArrowPathIcon style={{ width: '1rem', height: '1rem' }} />
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-secondary d-flex align-items-center gap-2"
                >
                  <ArrowPathIcon style={{ width: '1rem', height: '1rem' }} />
                  Refresh
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorId && (
                <details className="mt-4 text-start">
                  <summary className="btn btn-sm btn-outline-info">Debug Info</summary>
                  <div className="bg-light small mt-2 rounded p-3">
                    <p>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </p>
                    <p>
                      <strong>Component:</strong> {this.props.name || 'Unknown'}
                    </p>
                    <p>
                      <strong>Message:</strong> {this.state.error?.message}
                    </p>
                    <pre className="text-danger">{this.state.error?.stack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ProductErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ApiErrorBoundary
      name="Product Page"
      fallback={
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-8 py-5 text-center">
              <div className="text-muted mb-4" style={{ fontSize: '3rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <h3 className="fs-4 mb-3">Product Unavailable</h3>
              <p className="text-muted mb-4">This product could not be loaded.</p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <ArrowPathIcon style={{ width: '1rem', height: '1rem' }} />
                  Refresh Page
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="btn btn-secondary d-flex align-items-center gap-2"
                >
                  <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ApiErrorBoundary>
  );
}

export function MixtapeErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ApiErrorBoundary
      name="Mixtape Page"
      fallback={
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-8 py-5 text-center">
              <div className="text-muted mb-4" style={{ fontSize: '4rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <h3 className="fs-4 mb-3">Mixtape Unavailable</h3>
              <p className="text-muted mb-4">This mixtape could not be loaded.</p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                >
                  <ArrowPathIcon style={{ width: '1rem', height: '1rem' }} />
                  Retry
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="btn btn-secondary btn-sm d-flex align-items-center gap-2"
                >
                  <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ApiErrorBoundary>
  );
}

export function GenericErrorBoundary({ children, name }: { children: ReactNode; name?: string }) {
  return (
    <ApiErrorBoundary
      name={name}
      fallback={
        <div className="alert alert-warning rounded-3 my-3 border-0">
          <div className="d-flex align-items-center">
            <div className="me-3 flex-shrink-0">
              <ExclamationTriangleIcon
                style={{ width: '1.5rem', height: '1.5rem' }}
                className="text-warning"
              />
            </div>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-1">{name || 'Component'} Unavailable</h6>
              <p className="small mb-2">
                This section is temporarily unavailable. You can continue browsing other parts of
                the page.
              </p>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ApiErrorBoundary>
  );
}

export function ImagesErrorBoundary({ children }: { children: ReactNode }) {
  return <GenericErrorBoundary name="Product Images">{children}</GenericErrorBoundary>;
}

export function RelatedProductsErrorBoundary({ children }: { children: ReactNode }) {
  return <GenericErrorBoundary name="Related Products">{children}</GenericErrorBoundary>;
}

export function ProductDetailsErrorBoundary({ children }: { children: ReactNode }) {
  return <GenericErrorBoundary name="Product Details">{children}</GenericErrorBoundary>;
}
