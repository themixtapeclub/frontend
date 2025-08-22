// components/EmailPopup.tsx

'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { klaviyo } from '../lib/services/klaviyo';

interface EmailPopupProps {
  delay?: number;
  cookieExpiry?: number;
  lists?: {
    [key: string]: string;
  };
}

const EmailPopup: React.FC<EmailPopupProps> = ({
  delay = 5000,
  cookieExpiry = 7,
  lists = {
    shop: 'VE6Ux3',
    mixtapes: 'Wwbe83',
    events: 'QQBRZS'
  }
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedLists, setSelectedLists] = useState<{ [key: string]: boolean }>({
    shop: true,
    mixtapes: false,
    events: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    const hasSeenPopup = Cookies.get('email_popup_seen');
    const isSubscribed = Cookies.get('email_subscribed');

    if (!hasSeenPopup && !isSubscribed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [delay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const selectedListIds = Object.entries(selectedLists)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => lists[key]);

      await klaviyo.subscribeEmail(email, selectedListIds, {
        popup_source: true,
        selected_interests: Object.keys(selectedLists).filter((key) => selectedLists[key]),
        form_timestamp: Date.now()
      });

      await klaviyo.trackEvent(email, 'Email Signup', {
        source: 'popup',
        lists: selectedListIds
      });

      setMessage('Thanks for subscribing!');
      Cookies.set('email_subscribed', 'true', { expires: cookieExpiry });

      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    Cookies.set('email_popup_seen', 'true', { expires: 1 });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed-bottom" style={{ zIndex: 1050 }}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div
              className="card mb-3 border-0 shadow-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="visually-hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="d-flex align-items-center mb-3 gap-2">
                    <input
                      type="email"
                      className="form-control flex-grow-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: '#000000',
                        backdropFilter: 'none'
                      }}
                    />
                    <button
                      onClick={handleClose}
                      type="button"
                      style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        lineHeight: '1',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        minWidth: '30px',
                        borderRadius: '4px',
                        backdropFilter: 'none'
                      }}
                      aria-label="Close popup"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-3">
                    <p className="small fw-medium mb-2" style={{ color: '#ffffff' }}>
                      Get updates on new releases, events, and exclusive content
                    </p>

                    <div className="d-flex flex-wrap gap-3">
                      {Object.entries(lists).map(([key, listId]) => (
                        <div key={key} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`interest-${key}`}
                            checked={selectedLists[key]}
                            onChange={(e) =>
                              setSelectedLists((prev) => ({
                                ...prev,
                                [key]: e.target.checked
                              }))
                            }
                            style={{
                              backgroundColor: selectedLists[key]
                                ? '#0d6efd'
                                : 'rgba(255, 255, 255, 0.9)',
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                          />
                          <label
                            className="form-check-label small text-capitalize"
                            htmlFor={`interest-${key}`}
                            style={{ color: '#ffffff' }}
                          >
                            {key}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="btn btn-primary w-100"
                    style={{
                      backgroundColor: '#0d6efd',
                      borderColor: '#0d6efd',
                      color: '#ffffff',
                      backdropFilter: 'none'
                    }}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>

                  {message && (
                    <div className="mt-2 text-center">
                      <small
                        style={{
                          color: message.includes('Thanks') ? '#28a745' : '#dc3545'
                        }}
                      >
                        {message}
                      </small>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPopup;
