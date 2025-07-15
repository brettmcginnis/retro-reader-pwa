/**
 * Generates a screen identifier based on window width.
 * This allows different settings for different screen sizes.
 * @returns A string identifier for the current screen size
 */
export const getScreenIdentifier = (): string => {
  const width = window.innerWidth;
  
  // Round to nearest 50px to group similar screen sizes
  // This prevents creating too many distinct settings for minor size differences
  const roundedWidth = Math.round(width / 50) * 50;
  
  return `screen_${roundedWidth}`;
};

/**
 * Gets the current window width
 * @returns The current window inner width
 */
export const getWindowWidth = (): number => {
  return window.innerWidth;
};
