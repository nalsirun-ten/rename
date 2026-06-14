import React from 'react';
import { useLanguageStore } from '../stores/language';
import { getTranslation } from '../i18n/translations';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    
    // Automatically reload on chunk load errors (often happens after a new deployment)
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed')
    ) {
      window.location.reload();
      return;
    }

    this.props.onError?.(error, info);
  }

  handleReset = () => {
    // Force a hard reload if resetting doesn't work (which is often the case with stale cache)
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex-center"
          style={{
            flex: 1,
            flexDirection: 'column',
            padding: 32,
            textAlign: 'center',
            height: '100%',
          }}
        >
          <span
            className="icon-material"
            style={{
              fontSize: 'clamp(48px, 12.3rem, 72px)',
              color: '#94A3B8',
              marginBottom: 16,
            }}
          >
            warning
          </span>
          <h3
            style={{
              fontSize: 'clamp(18px, 4.6rem, 24px)',
              fontWeight: 700,
              color: '#475569',
              margin: '0 0 8px',
            }}
          >
            {getTranslation('err_something_went_wrong', useLanguageStore.getState().language)}
          </h3>
          <p
            style={{
              fontSize: 'clamp(14px, 3.6rem, 18px)',
              color: '#94A3B8',
              margin: '0 0 24px',
              lineHeight: 1.5,
            }}
          >
            {getTranslation('err_try_refreshing', useLanguageStore.getState().language)}
          </p>
          <button
            className="btn-reset"
            onClick={this.handleReset}
            style={{
              padding: '12px 32px',
              borderRadius: 16,
              backgroundColor: '#1B5E3D',
              color: '#FFF',
              fontWeight: 700,
              fontSize: 'clamp(15px, 3.8rem, 20px)',
            }}
          >
            {getTranslation('try_again', useLanguageStore.getState().language)}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
