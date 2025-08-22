// components/WantlistMigration.tsx - Migration component
'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MigrationStatus {
  customer: {
    id: string;
    email: string;
  };
  oldSystem: {
    totalItems: number;
    activeItems: number;
  };
  newSystem: {
    activeItems: number;
  };
  needsMigration: boolean;
}

interface MigrationResult {
  migrated: number;
  skipped: number;
  errors: string[];
  message: string;
}

export default function WantlistMigration() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [testing, setTesting] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const testContentModel = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing content model...');
      const url = user?.id
        ? `/api/test-content-model?customerId=${encodeURIComponent(user.id)}`
        : '/api/test-content-model';
      const response = await fetch(url);
      const data = await response.json();

      console.log('🧪 Content model test result:', data);
      alert(`Content model test completed. Check browser console for details.`);
    } catch (error) {
      console.error('❌ Error testing content model:', error);
      alert('Error testing content model - check console');
    } finally {
      setTesting(false);
    }
  };

  const checkMigrationStatus = async () => {
    if (!user?.id) {
      alert('No user ID available');
      return;
    }

    setChecking(true);
    try {
      console.log('🔍 Checking migration status for user:', user.id);
      const response = await fetch(
        `/api/migrate-wantlist?customerId=${encodeURIComponent(user.id)}`
      );
      const data = await response.json();

      console.log('📊 Migration status response:', data);

      if (data.success) {
        setStatus(data);
        console.log('📊 Migration status:', data);
      } else {
        console.error('❌ Failed to check migration status:', data.error);
        alert(`Failed to check migration status: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error checking migration status:', error);
      alert('Error checking migration status');
    } finally {
      setChecking(false);
    }
  };

  const runMigration = async () => {
    if (!user?.id) {
      alert('No user ID available');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Running migration for user:', user.id);
      const response = await fetch('/api/migrate-wantlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: user.id
        })
      });

      const data = await response.json();
      console.log('✅ Migration response:', data);

      if (data.success) {
        setResult(data);
        console.log('✅ Migration completed:', data);

        // Refresh status after migration
        setTimeout(() => {
          checkMigrationStatus();
        }, 1000);
      } else {
        console.error('❌ Migration failed:', data.error);
        alert(`Migration failed: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error running migration:', error);
      alert('Error running migration');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container p-4">
        <div className="alert alert-warning">
          <h4>Please log in</h4>
          <p>You need to be logged in to migrate your wantlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-12 col-lg-8">
          <h1 className="h2 mb-4">Wantlist Migration</h1>

          {/* Debug Info */}
          <div className="alert alert-secondary mb-4">
            <h6 className="alert-heading">🔧 Debug Info</h6>
            <p className="mb-1">
              <strong>User ID:</strong> {user?.id || 'Not available'}
            </p>
            <p className="mb-1">
              <strong>User Email:</strong> {user?.email || 'Not available'}
            </p>
            <p className="mb-2">
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </p>

            <button
              onClick={testContentModel}
              disabled={testing}
              className="btn btn-outline-secondary btn-sm"
            >
              {testing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Testing...
                </>
              ) : (
                '🧪 Test Content Model'
              )}
            </button>
          </div>

          <div className="alert alert-info mb-4">
            <h5 className="alert-heading">📦 What is this?</h5>
            <p className="mb-0">
              We're moving wantlist data to a new system that works better for both logged-in users
              and guests. This tool will migrate your existing wantlist items to the new system.
            </p>
          </div>

          {/* Check Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Migration Status</h5>
            </div>
            <div className="card-body">
              {!status ? (
                <div className="text-center">
                  <button
                    onClick={checkMigrationStatus}
                    disabled={checking}
                    className="btn btn-primary"
                  >
                    {checking ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Checking...
                      </>
                    ) : (
                      '🔍 Check Migration Status'
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Customer:</strong>
                    </div>
                    <div className="col-sm-9">
                      {status.customer.email} ({status.customer.id})
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Old System:</strong>
                    </div>
                    <div className="col-sm-9">
                      {status.oldSystem.activeItems} active items
                      {status.oldSystem.totalItems > status.oldSystem.activeItems && (
                        <span className="text-muted"> ({status.oldSystem.totalItems} total)</span>
                      )}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>New System:</strong>
                    </div>
                    <div className="col-sm-9">{status.newSystem.activeItems} items</div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Status:</strong>
                    </div>
                    <div className="col-sm-9">
                      {status.needsMigration ? (
                        <span className="badge bg-warning">Migration Needed</span>
                      ) : status.newSystem.activeItems > 0 ? (
                        <span className="badge bg-success">Migration Complete</span>
                      ) : (
                        <span className="badge bg-secondary">No Items to Migrate</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={checkMigrationStatus}
                    disabled={checking}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    {checking ? 'Checking...' : '🔄 Refresh Status'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Migration Action */}
          {status?.needsMigration && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Run Migration</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  This will copy {status.oldSystem.activeItems} active items from your old wantlist
                  to the new system.
                </p>

                <button onClick={runMigration} disabled={loading} className="btn btn-success">
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Migrating...
                    </>
                  ) : (
                    `🚀 Migrate ${status.oldSystem.activeItems} Items`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Migration Results */}
          {result && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Migration Results</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-success">
                  <h6 className="alert-heading">✅ {result.message}</h6>
                  <ul className="mb-0">
                    <li>✅ {result.migrated} items migrated successfully</li>
                    <li>⚠️ {result.skipped} items skipped (already existed)</li>
                    <li>❌ {result.errors.length} errors</li>
                  </ul>
                </div>

                {result.errors.length > 0 && (
                  <div className="alert alert-warning">
                    <h6 className="alert-heading">Errors:</h6>
                    <ul className="mb-0">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {result && result.migrated > 0 && (
            <div className="alert alert-success">
              <h5 className="alert-heading">🎉 Migration Complete!</h5>
              <p className="mb-2">
                Your wantlist has been successfully migrated to the new system.
              </p>
              <hr />
              <p className="mb-0">
                <a href="/account/wantlist" className="btn btn-primary">
                  View Your Wantlist
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
