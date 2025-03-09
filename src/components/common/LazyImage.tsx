// src/components/common/LazyImage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { generateShoePlaceholder, getDominantColorFromUrl } from '../../utils/placeholderGenerator';
import { config } from '../../config';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderType?: 'shoe' | 'color' | 'custom';
  customPlaceholder?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width = 300,
  height = 200,
  placeholderType = 'shoe',
  customPlaceholder,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Process the image URL considering config.imageBaseUrl
  const getProcessedSrc = (url: string): string => {
    // Handle empty or undefined URLs
    if (!url) {
      return '';
    }

    // Check if it's an absolute URL or a relative path
    let processedUrl = url.startsWith('http') ? url : `${config.imageBaseUrl}/${url}`;
    
    // Apply optimization parameters for Unsplash URLs
    if (processedUrl.includes('unsplash.com')) {
      const separator = processedUrl.includes('?') ? '&' : '?';
      // Add width, quality and WebP format if supported
      return `${processedUrl}${separator}w=${width}&q=80&fm=webp&fit=crop`;
    }
    
    return processedUrl;
  };

  // Get placeholder image source
  const getPlaceholder = (): string => {
    if (customPlaceholder) {
      return customPlaceholder;
    }
    
    if (placeholderType === 'shoe') {
      return generateShoePlaceholder(width, height);
    }
    
    if (placeholderType === 'color') {
      // Generate a background color based on the image URL for consistency
      const bgColor = getDominantColorFromUrl(src);
      const style = `background-color:${bgColor};width:100%;height:100%;display:block;`;
      return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" style="${style}"/></svg>`;
    }
    
    // Default placeholder
    return generateShoePlaceholder(width, height);
  };

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    // Skip intersection observer for Safari as it has good native lazy loading
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      setIsInView(true);
      return;
    }
    
    // Create Intersection Observer to detect when image enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '200px 0px', // Start loading when within 200px of viewport
        threshold: 0.01          // Trigger when just 1% is visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        height: 'inherit', // Use height from parent
        width: 'inherit',  // Use width from parent
      }}
    >
      {/* Show placeholder while main image is loading or if there's an error */}
      {(!isLoaded || !isInView || error) && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${getPlaceholder()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Main image (only loads when in viewport) */}
      {isInView && !error && (
        <img
          src={getProcessedSrc(src)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

export default LazyImage;