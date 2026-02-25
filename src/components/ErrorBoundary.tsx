'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                    <div className="text-center space-y-4 max-w-sm">
                        <div className="text-4xl">🔮</div>
                        <h2 className="text-xl font-bold text-white">오류가 발생했습니다</h2>
                        <p className="text-white/50 text-sm">페이지를 새로고침해 주세요.</p>
                        <button
                            type="button"
                            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                            className="px-6 py-2.5 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-500 transition-colors"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
