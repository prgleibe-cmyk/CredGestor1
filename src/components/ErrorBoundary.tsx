import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
          errorMessage = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50/30 p-4 relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-200/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[120px]"></div>

          <div className="glass p-10 rounded-[3rem] neo-shadow-lg max-w-md w-full text-center relative z-10 border border-white/40">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            
            <h2 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tight">Ops! Algo deu errado</h2>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">{errorMessage}</p>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-red-600 text-white font-black rounded-[2rem] hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
              Recarregar Aplicativo
            </button>
            
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                Sistema de Recuperação CredGestor
              </p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
