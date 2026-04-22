export const Formatting = {
  createDivider(title: string | null = null): string {
    const width = Math.round(process.stdout.columns / 1.25);
    const divider = '═'.repeat(width);
    
    if (title) {
      const half = divider.substring(0, Math.round(divider.length / 2));
      return `${half} ${title} ${half}`;
    }
    
    return divider;
  },

  center(input: string): string {
    const padding = Math.round((process.stdout.columns / 2) - (input.length / 2));
    return ' '.repeat(Math.max(0, padding)) + input;
  },

  space(input: string, length: number): string {
    const spacesNeeded = length - input.length;
    return input + ' '.repeat(Math.max(0, spacesNeeded));
  }
};
