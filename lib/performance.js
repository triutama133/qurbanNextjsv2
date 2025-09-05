// Utility untuk performance monitoring
export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          
          console.log('Performance metrics:', {
            pageLoadTime: `${pageLoadTime}ms`,
            domContentLoadedTime: `${domContentLoadedTime}ms`,
            timestamp: new Date().toISOString()
          });

          // In production, send to analytics service
          if (process.env.NODE_ENV === 'production') {
            // gtag('event', 'page_load_time', {
            //   value: pageLoadTime,
            //   custom_parameter: domContentLoadedTime
            // });
          }
        }, 0);
      });
    }
  }

  static measureApiCall(apiName, startTime, endTime, success = true) {
    const duration = endTime - startTime;
    
    console.log('API Performance:', {
      api: apiName,
      duration: `${duration}ms`,
      success,
      timestamp: new Date().toISOString()
    });

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to service like DataDog, New Relic, etc.
    }
  }

  static measureComponentRender(componentName, renderTime) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime}ms`);
    }
  }
}

// Hook untuk measuring component performance
import { useEffect, useRef } from 'react';

export function usePerformanceLog(componentName) {
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    PerformanceMonitor.measureComponentRender(componentName, renderTime);
  });
}

// Wrapper untuk API calls dengan performance monitoring
export async function apiCall(url, options = {}, apiName = 'unknown') {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    
    PerformanceMonitor.measureApiCall(apiName, startTime, endTime, response.ok);
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    PerformanceMonitor.measureApiCall(apiName, startTime, endTime, false);
    throw error;
  }
}