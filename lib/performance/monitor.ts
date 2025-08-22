// lib/performance/monitor.ts

interface PerformanceEntry {
  label: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface MemoryInfo {
  used: string;
  total: string;
  limit: string;
  percentage: string;
}

interface EnvironmentInfo {
  timestamp: string;
  environment: string;
  userAgent: string;
  viewport: string;
  connection: any;
  platform: string;
  language: string;
  cookieEnabled: string | boolean;
  onLine: string | boolean;
}

interface PerformanceReport {
  pageType: string;
  pageSlug: string;
  totalDuration: number;
  entries: PerformanceEntry[];
  memoryUsage?: {
    used: string;
    total: string;
    limit: string;
  };
  browserInfo?: {
    userAgent: string;
    viewport: string;
    connection: string;
  };
  timestamp: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private entries: Map<string, PerformanceEntry> = new Map();
  private reports: PerformanceReport[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled =
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_PERF_LOGGING === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_PERF_LOGGING === 'true';
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }

  start(label: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const entry: PerformanceEntry = {
      label,
      startTime: this.now(),
      metadata
    };

    this.entries.set(label, entry);
  }

  end(label: string, metadata?: Record<string, any>): number {
    if (!this.isEnabled) return 0;

    const entry = this.entries.get(label);
    if (!entry) {
      return 0;
    }

    const endTime = this.now();
    const duration = endTime - entry.startTime;

    entry.endTime = endTime;
    entry.duration = duration;
    entry.metadata = { ...entry.metadata, ...metadata };

    const getColorAndEmoji = (duration: number) => {
      if (duration < 50) return { color: '🟢', level: 'FAST' };
      if (duration < 100) return { color: '🟡', level: 'OK' };
      if (duration < 500) return { color: '🟠', level: 'SLOW' };
      return { color: '🔴', level: 'VERY SLOW' };
    };

    const { color, level } = getColorAndEmoji(duration);

    return duration;
  }

  measure<T>(label: string, fn: () => T, metadata?: Record<string, any>): T {
    if (!this.isEnabled) return fn();

    this.start(label, metadata);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) return fn();

    this.start(label, metadata);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  logMemoryUsage(label: string): MemoryInfo | undefined {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        const memoryInfo: MemoryInfo = {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
        };

        console.log(`💾 [MEMORY] ${label}:`, memoryInfo);
        return memoryInfo;
      }
    } catch (error) {
      // Silently fail if memory API is not available
    }
    return undefined;
  }

  logEnvironmentInfo(label: string): EnvironmentInfo {
    if (!this.isEnabled) return {} as EnvironmentInfo;

    const isServer = typeof window === 'undefined';

    const info: EnvironmentInfo = {
      timestamp: new Date().toISOString(),
      environment: isServer ? 'server' : 'client',
      userAgent: !isServer && typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      viewport:
        !isServer && typeof window !== 'undefined'
          ? `${window.innerWidth}x${window.innerHeight}`
          : 'Server',
      connection:
        !isServer && typeof navigator !== 'undefined' && 'connection' in navigator
          ? (navigator as any).connection?.effectiveType || 'Unknown'
          : 'Server',
      platform: !isServer && typeof navigator !== 'undefined' ? navigator.platform : 'Server',
      language: !isServer && typeof navigator !== 'undefined' ? navigator.language : 'Server',
      cookieEnabled:
        !isServer && typeof navigator !== 'undefined' ? navigator.cookieEnabled : 'Server',
      onLine: !isServer && typeof navigator !== 'undefined' ? navigator.onLine : 'Server'
    };

    console.log(`🌐 [ENV] ${label}:`, info);
    return info;
  }

  generateReport(pageType: string, pageSlug: string): PerformanceReport {
    if (!this.isEnabled) return {} as PerformanceReport;

    const completedEntries = Array.from(this.entries.values())
      .filter((entry) => entry.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));

    const totalDuration = completedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const report: PerformanceReport = {
      pageType,
      pageSlug,
      totalDuration,
      entries: completedEntries,
      timestamp: new Date().toISOString()
    };

    if (
      typeof window !== 'undefined' &&
      typeof performance !== 'undefined' &&
      'memory' in performance
    ) {
      try {
        const memory = (performance as any).memory;
        report.memoryUsage = {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        };
      } catch (error) {
        // Silently fail if memory API is not available
      }
    }

    if (typeof navigator !== 'undefined') {
      report.browserInfo = {
        userAgent: navigator.userAgent,
        viewport:
          typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
        connection:
          'connection' in navigator
            ? (navigator as any).connection?.effectiveType || 'Unknown'
            : 'Unknown'
      };
    }

    this.reports.push(report);

    console.log(`📊 [PERFORMANCE REPORT] ${pageType}/${pageSlug}:`, {
      totalTime: `${totalDuration.toFixed(2)}ms`,
      operationCount: completedEntries.length,
      slowestOperation: completedEntries[0]
        ? `${completedEntries[0].label} (${completedEntries[0].duration?.toFixed(2)}ms)`
        : 'None',
      memoryUsed: report.memoryUsage?.used || 'Unknown'
    });

    if (process.env.NODE_ENV === 'development') {
      console.table(
        completedEntries.map((entry) => ({
          Operation: entry.label,
          Duration: `${entry.duration?.toFixed(2)}ms`,
          Percentage: `${(((entry.duration || 0) / totalDuration) * 100).toFixed(1)}%`,
          Metadata: entry.metadata ? JSON.stringify(entry.metadata) : '-'
        }))
      );
    }

    return report;
  }

  clear(): void {
    this.entries.clear();
  }

  getReports(): PerformanceReport[] {
    return this.reports;
  }

  exportReportsAsCSV(): string {
    if (!this.isEnabled || this.reports.length === 0) return '';

    const headers = [
      'Timestamp',
      'PageType',
      'PageSlug',
      'TotalDuration',
      'Operation',
      'OperationDuration',
      'MemoryUsed'
    ];
    const rows = [headers.join(',')];

    this.reports.forEach((report) => {
      report.entries.forEach((entry) => {
        rows.push(
          [
            report.timestamp,
            report.pageType,
            report.pageSlug,
            report.totalDuration.toFixed(2),
            entry.label,
            (entry.duration || 0).toFixed(2),
            report.memoryUsage?.used || 'Unknown'
          ].join(',')
        );
      });
    });

    return rows.join('\n');
  }

  async sendToAnalytics(report: PerformanceReport): Promise<void> {
    if (!this.isEnabled || process.env.NODE_ENV !== 'production') return;

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.warn('Failed to send performance data:', error);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export const startTiming = (label: string, metadata?: Record<string, any>) =>
  performanceMonitor.start(label, metadata);

export const endTiming = (label: string, metadata?: Record<string, any>) =>
  performanceMonitor.end(label, metadata);

export const measureSync = <T>(label: string, fn: () => T, metadata?: Record<string, any>) =>
  performanceMonitor.measure(label, fn, metadata);

export const measureAsync = <T>(
  label: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
) => performanceMonitor.measureAsync(label, fn, metadata);

export const logMemory = (label: string) => performanceMonitor.logMemoryUsage(label);

export const logEnvironment = (label: string) => performanceMonitor.logEnvironmentInfo(label);

export const generatePerformanceReport = (pageType: string, pageSlug: string) =>
  performanceMonitor.generateReport(pageType, pageSlug);

export const clearPerformanceData = () => performanceMonitor.clear();

import { useEffect, useRef } from 'react';

export function usePerformanceMonitoring(label: string, metadata?: Record<string, any>) {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const now =
      typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    startTimeRef.current = now;
    performanceMonitor.start(label, metadata);

    return () => {
      performanceMonitor.end(label);
    };
  }, [label]);

  return {
    measure: <T>(fn: () => T) => performanceMonitor.measure(`${label}-operation`, fn),
    measureAsync: <T>(fn: () => Promise<T>) =>
      performanceMonitor.measureAsync(`${label}-operation`, fn),
    logMemory: () => performanceMonitor.logMemoryUsage(label)
  };
}

export default performanceMonitor;
