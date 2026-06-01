import { Component } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import Alert from './common/Alert';

/**
 * Error Boundary to catch errors in lazy-loaded components
 * Prevents white screens when component fails to load
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 Component Error:', error);
    console.error('📋 Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const role = this.props.role || 'applicant';
      return (
        <DashboardLayout role={role}>
          <div className="p-6">
            <Alert variant="danger">
              <strong>Component Failed to Load</strong>
              <br />
              <small>{this.state.error?.message || 'An unexpected error occurred'}</small>
              <br />
              <small>Try refreshing the page.</small>
            </Alert>
          </div>
        </DashboardLayout>
      );
    }

    return this.props.children;
  }
}
