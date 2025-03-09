// src/hooks/useImagePreloader.ts
import { useEffect } from 'react';
import { config } from '../config';

interface PreloadOptions {
  width?: number;
  height?: number;
  priority?: 'high' | 'low';
}

/**
 * Hook to preload images when component mounts
 * Use for critical images like featured products
 */
const useImagePreloader = (
  imageUrls: string[],
  options: PreloadOptions = {}
): void => {
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const preloadImage = (url: string) => {
      if (!url) return;
      
      // Process URL considering config.imageBaseUrl
      let processedUrl = url.startsWith('http') ? url : `${config.imageBaseUrl}/${url}`;
      
      // Get optimized URL
      if (processedUrl.includes('unsplash.com')) {
        const separator = processedUrl.includes('?') ? '&' : '?';
        processedUrl = `${processedUrl}${separator}w=${options.width || 400}&q=80&fm=webp`;
      }

      // For high priority images, use fetch API with priority hint if available
      if (options.priority === 'high') {
        try {
          // @ts-ignore - TypeScript might not know about priority option
          fetch(processedUrl, { priority: 'high' })
            .catch(() => {
              // Fallback if fetch with priority fails
              const img = new Image();
              img.src = processedUrl;
            });
        } catch (e) {
          // Fallback for browsers without priority support
          const img = new Image();
          img.src = processedUrl;
        }
      } else {
        // Standard preloading
        const img = new Image();
        img.src = processedUrl;
      }
    };

    // Preload each image
    imageUrls.forEach(preloadImage);
  }, [imageUrls, options.width, options.height, options.priority]);
};

export default useImagePreloader;