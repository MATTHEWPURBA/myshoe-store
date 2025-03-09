// src/utils/placeholderGenerator.ts

/**
 * Generate SVG placeholder for shoes
 * Creates a stylish, lightweight SVG that represents a shoe silhouette
 */
export const generateShoePlaceholder = (
    width = 300,
    height = 200,
    bgColor = '#f3f4f6',
    outlineColor = '#d1d5db',
    textColor = '#9ca3af'
  ): string => {
    // A simple shoe silhouette path
    const shoePath = 'M50,130 C70,120 100,120 150,135 C200,150 220,130 240,120 C260,110 270,110 280,120 C290,130 290,140 280,150 C270,160 260,165 240,170 C220,175 200,180 150,170 C100,160 70,150 60,150 C50,150 40,140 50,130 Z';
    
    // Create the SVG with shoe silhouette
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 300 200">
        <rect width="100%" height="100%" fill="${bgColor}" />
        <path d="${shoePath}" fill="${bgColor}" stroke="${outlineColor}" stroke-width="2" />
        <text x="150" y="90" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle">Loading image...</text>
      </svg>
    `;
    
    // Encode the SVG for use in a data URL
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
  };
  
  /**
   * Generate a simple, colored SVG placeholder
   * Useful for generic placeholders with custom dimensions
   */
  export const generateSimplePlaceholder = (
    width = 300,
    height = 300,
    text = 'Loading...',
    bgColor = '#f0f0f0',
    textColor = '#888888'
  ): string => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="${bgColor}" />
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `;
    
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
  };
  
  /**
   * Generate a dominant color based on the image URL
   * This creates a consistent color for placeholders based on the image URL
   */
  export const getDominantColorFromUrl = (url: string): string => {
    // Generate a "hash" from the URL string
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the hash to generate an HSL color
    // Using HSL ensures we get pleasing colors that aren't too dark or too light
    const hue = Math.abs(hash % 360); 
    const saturation = 25 + (Math.abs((hash >> 8) % 30)); // 25-55%
    const lightness = 80 + (Math.abs((hash >> 16) % 10)); // 80-90%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };