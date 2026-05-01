import { Button, Card } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <Card className="max-w-md w-full p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <AlertTriangle size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            System Interrupted
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                            A critical UI error occurred. Our automated stability protocol has
                            isolated the fault to protect your data.
                        </p>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left mb-8 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Error Signature
                            </p>
                            <p className="text-xs font-mono text-rose-600 truncate">
                                {this.state.error?.message || 'Unknown Runtime Exception'}
                            </p>
                        </div>

                        <Button
                            onClick={this.handleReset}
                            variant="primary"
                            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-bold"
                        >
                            <RefreshCw size={20} className="mr-2" /> Restore System State
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
