import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const GOLD = '#00D4FF';
const PINK = '#FF2D78';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050510',
          padding: 24,
        }}>
          <div style={{
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            padding: '40px 28px',
            borderRadius: 24,
            background: 'linear-gradient(160deg, rgba(20,20,35,0.98), rgba(10,10,18,0.99))',
            border: '1px solid rgba(239,68,68,0.2)',
            boxShadow: '0 24px 80px rgba(239,68,68,0.1)',
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertTriangle size={32} color="#EF4444" strokeWidth={2} />
            </div>

            <h2 style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#F0F0F8',
              margin: '0 0 8px',
            }}>
              Something went wrong
            </h2>

            <p style={{
              fontSize: 14,
              color: '#64748b',
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}>
              An unexpected error occurred. Try refreshing, or tap below to recover.
            </p>

            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 14,
                border: 'none',
                background: `linear-gradient(135deg, ${GOLD}, ${PINK})`,
                color: '#fff',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: `0 4px 20px rgba(0,212,255,0.2)`,
              }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
