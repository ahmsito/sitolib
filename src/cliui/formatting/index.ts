/**
 * Formatting utilities for terminal output
 * @module formatting
 */

/**
 * Collection of formatting utilities for terminal text
 */
export const Formatting = {
  /**
   * Creates a horizontal divider line
   * @param title - Optional title to display in the center of the divider
   * @returns Formatted divider string
   */
  createDivider(title: string | null = null): string {
    const width = Math.round(process.stdout.columns / 1.25);
    const divider = '═'.repeat(width);
    
    if (title) {
      const half = divider.substring(0, Math.round(divider.length / 2));
      return `${half} ${title} ${half}`;
    }
    
    return divider;
  },

  /**
   * Centers text in the terminal
   * @param input - Text to center
   * @returns Centered text with padding
   */
  center(input: string): string {
    const padding = Math.round((process.stdout.columns / 2) - (input.length / 2));
    return ' '.repeat(Math.max(0, padding)) + input;
  },

  /**
   * Pads text with spaces to reach a specific length
   * @param input - Text to pad
   * @param length - Target length
   * @returns Padded text
   */
  space(input: string, length: number): string {
    const spacesNeeded = length - input.length;
    return input + ' '.repeat(Math.max(0, spacesNeeded));
  }
};
