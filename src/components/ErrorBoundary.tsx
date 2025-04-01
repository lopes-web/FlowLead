import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registra o erro para análise
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      errorInfo
    });
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Mensagem de erro padrão com tema escuro para combinar com a UI do app
      return (
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-md text-red-300">
          <h3 className="text-lg font-medium">Algo deu errado</h3>
          <p className="mt-2 text-sm">
            {this.state.error?.message || 'Ocorreu um erro ao renderizar este componente.'}
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
            <details className="mt-2">
              <summary className="text-sm cursor-pointer">Detalhes do erro</summary>
              <pre className="mt-2 p-2 text-xs bg-black/30 rounded overflow-auto max-h-[200px]">
                {this.state.error?.stack}
              </pre>
              <p className="mt-2 text-xs">Componentes afetados:</p>
              <pre className="mt-1 p-2 text-xs bg-black/30 rounded overflow-auto max-h-[200px]">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            className="mt-3 px-3 py-1 text-sm font-medium text-white bg-red-700/50 rounded-md hover:bg-red-700"
            onClick={this.resetErrorBoundary}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 