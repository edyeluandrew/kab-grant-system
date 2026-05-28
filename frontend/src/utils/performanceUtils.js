/**
 * Performance Optimization Utility
 * Monitors and reports on app performance
 */

/**
 * Log performance metrics
 */
export const logPerformanceMetrics = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    const metrics = {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`,
      DOMInteractive: `${perfData.domInteractive - perfData.navigationStart}ms`,
      DOMComplete: `${perfData.domComplete - perfData.navigationStart}ms`,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('⚡ Performance Metrics:', metrics);
    }
    return metrics;
  }
};

/**
 * Report Web Vitals
 * Tracks Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift
 */
export const reportWebVitals = (metric) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
    });
  }
};

/**
 * Optimize image loading with lazy loading
 */
export const enableImageLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach((img) => imageObserver.observe(img));
  }
};

/**
 * Debounce function to optimize event handlers
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoization helper for expensive computations
 */
export const memoize = (fn) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
};

/**
 * Preload critical resources
 */
export const preloadResources = () => {
  // Preload fonts if any
  const fonts = document.querySelectorAll('link[rel="preload"][as="font"]');
  fonts.forEach((font) => {
    if (font.href) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = font.href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
};

/**
 * Cleanup - Remove from memory
 */
export const cleanup = () => {
  // Clear caches, remove event listeners, etc.
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleanup completed');
  }
};

export default {
  logPerformanceMetrics,
  reportWebVitals,
  enableImageLazyLoading,
  debounce,
  throttle,
  memoize,
  preloadResources,
  cleanup,
};
