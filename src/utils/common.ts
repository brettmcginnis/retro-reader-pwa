/**
 * Generates a unique ID using timestamp and random values
 * @returns A unique string ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Extracts title from a URL by removing protocol, www, and file extensions
 * @param url - The URL to extract title from
 * @returns The extracted title
 */
export function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let title = urlObj.pathname.split('/').pop() || urlObj.hostname;
    
    // Remove file extension
    title = title.replace(/\.[^/.]+$/, '');
    
    // Remove www prefix
    if (title.startsWith('www.')) {
      title = title.substring(4);
    }
    
    // Replace underscores and hyphens with spaces
    title = title.replace(/[_-]/g, ' ');
    
    // Capitalize first letter of each word
    title = title.replace(/\b\w/g, (l) => l.toUpperCase());
    
    return title || 'Untitled Guide';
  } catch {
    return 'Untitled Guide';
  }
}

/**
 * Wraps an error with additional context
 * @param error - The original error
 * @param context - Additional context for the error
 * @returns A new error with the added context
 */
export function wrapError(error: unknown, context: string): Error {
  const originalMessage = error instanceof Error ? error.message : String(error);
  return new Error(`${context}: ${originalMessage}`);
}