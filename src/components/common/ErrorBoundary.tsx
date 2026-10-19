import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { theme } from '../../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={36} color="#E58A2B" />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              काहीतरी त्रुटी आली आहे. कृपया पुन्हा प्रयत्न करा.
            </Text>

            <Pressable style={styles.button} onPress={this.handleReset}>
              <RefreshCw size={18} color="#FFFFFF" style={styles.btnIcon} />
              <Text style={styles.buttonText}>Try Again / पुन्हा प्रयत्न करा</Text>
            </Pressable>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.devBox}>
                <Text style={styles.devTitle}>Debug Trace:</Text>
                <Text style={styles.devText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.devStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E8DB',
    shadowColor: '#2B2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FDECD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2723',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A7C66',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E58A2B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
  },
  btnIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devBox: {
    marginTop: 20,
    maxHeight: 180,
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCE6CE',
  },
  devTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A5A12',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  devText: {
    fontSize: 12,
    color: '#C3423F',
    fontWeight: '600',
    marginBottom: 6,
  },
  devStack: {
    fontSize: 10,
    color: '#8A7C66',
    fontFamily: 'monospace',
  },
});
