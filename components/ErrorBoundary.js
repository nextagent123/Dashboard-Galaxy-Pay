"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.3)", borderRadius: 14, padding: "20px 24px", margin: "12px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fb7185", marginBottom: 8 }}>Rendering error</div>
          <pre style={{ fontSize: 11, color: "#f9a8d4", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
