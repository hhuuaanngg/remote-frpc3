import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "#f87171", background: "hsl(220 15% 8%)", minHeight: "100vh", fontFamily: "monospace" }}>
          <h2>渲染错误</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9ca3af", marginTop: 10 }}>{this.state.error?.stack}</pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: "8px 16px", cursor: "pointer" }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
