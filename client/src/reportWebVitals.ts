type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';

interface WebVitalMetric {
  id: string;
  name: MetricName;
  value: number;
  delta?: number;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

const reportWebVitals = (onPerfEntry?: (metric: WebVitalMetric) => void): void => {
  if (!onPerfEntry || !(onPerfEntry instanceof Function)) {
    return;
  }

  // Measure CLS
  let clsValue = 0;
  const observeCLS = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    onPerfEntry({
      id: 'cls',
      name: 'CLS',
      value: clsValue,
      delta: clsValue
    });
  });

  // Measure LCP
  const observeLCP = new PerformanceObserver((list) => {
    const entry = list.getEntries().at(-1);
    if (entry) {
      onPerfEntry({
        id: 'lcp',
        name: 'LCP',
        value: entry.startTime,
        delta: entry.startTime
      });
    }
  });

  // Measure FID
  const observeFID = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0] as FirstInputEntry;
    if (entry) {
      const value = entry.processingStart - entry.startTime;
      onPerfEntry({
        id: 'fid',
        name: 'FID',
        value,
        delta: value
      });
    }
  });

  // Measure TTFB
  const measureTTFB = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      onPerfEntry({
        id: 'ttfb',
        name: 'TTFB',
        value: navigation.responseStart,
        delta: navigation.responseStart
      });
    }
  };

  try {
    // Start observing
    observeCLS.observe({ type: 'layout-shift', buffered: true });
    observeLCP.observe({ type: 'largest-contentful-paint', buffered: true });
    observeFID.observe({ type: 'first-input', buffered: true });
    
    // Measure TTFB immediately
    measureTTFB();
  } catch (error) {
    console.warn('Web Vitals measurement failed:', error);
  }
};

export type { WebVitalMetric };
export default reportWebVitals;
