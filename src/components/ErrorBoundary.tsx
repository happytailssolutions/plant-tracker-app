import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    try {
      // Log detailed error information
      logger.log(`Error Boundary - ERROR CAUGHT: ${error.name}: ${error.message}`);
      logger.log(`Error Boundary - Error Stack: ${error.stack}`);
      logger.log(`Error Boundary - Component Stack: ${errorInfo.componentStack}`);
      
      // Log the error to Crashlytics
      logger.logError(error, `ErrorBoundary caught error: ${error.message} | Component: ${errorInfo.componentStack}`);
      
      // Set additional context for debugging
      logger.setCustomKey('error_boundary_triggered', true);
      logger.setCustomKey('error_boundary_error_name', error.name);
      logger.setCustomKey('error_boundary_error_message', error.message);
      
    } catch (loggerError) {
      // If logger fails, just log to console
      console.error('ErrorBoundary caught error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
      console.error('Logger error:', loggerError);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app encountered an unexpected error. Please restart the app.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorText}>
              Error: {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
