/**
 * Validates that a URL is not empty or whitespace-only
 * @param url - The URL string to validate
 * @returns true if valid, false otherwise
 */
export function validateUrl(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }
  
  // Check if the URL is empty or contains only whitespace
  return url.trim().length > 0;
}

/**
 * Validates that a title is not empty or whitespace-only
 * @param title - The title string to validate
 * @returns true if valid, false otherwise
 */
export function validateTitle(title: string): boolean {
  if (typeof title !== 'string') {
    return false;
  }
  
  // Check if the title is empty or contains only whitespace
  return title.trim().length > 0;
}
