/**
 * ASCII Table Generator
 * Creates beautiful bordered tables for terminal output with proper Unicode width handling
 * @module asciitable
 */

import { stripVTControlCharacters } from 'node:util';

/**
 * Configuration options for AsciiTable
 */
interface AsciiTableOptions {
  /** Show horizontal dividers between rows */
  showDividers?: boolean;
  /** Center content when writing */
  centerOnWrite?: boolean;
  /** Custom color mappings */
  colors?: Record<string, string>;
}

/**
 * Represents a table column
 */
interface Column {
  /** Column header text */
  header: string;
  /** Unique column identifier */
  id: number;
  /** Reference to parent table */
  parent: AsciiTable;
}

/**
 * Represents a table row
 */
interface Row {
  /** Cell values in the row */
  cells: string[];
  /** Unique row identifier */
  id: number;
  /** Reference to parent table */
  parent: AsciiTable;
}

/**
 * ASCII Table class for creating bordered tables in the terminal
 * Supports emojis, full-width characters, and proper Unicode width calculation
 */
export class AsciiTable {
  /** Box drawing characters for table borders */
  static PIPES = {
    downright: '╔',
    downleft: '╗',
    leftright: '═',
    updown: '║',
    upright: '╚',
    upleft: '╝',
    downleftright: '╦',
    upleftright: '╩',
    updownleft: '╣',
    updownright: '╠',
    updownleftright: '╬'
  };

  private rows: Row[] = [];
  private columns: Column[] = [];
  private rowId = 0;
  private columnId = 0;
  private options: Required<AsciiTableOptions>;

  /**
   * Creates a new ASCII table
   * @param options - Table configuration options
   */
  constructor(options: AsciiTableOptions = {}) {
    this.options = {
      showDividers: options.showDividers ?? true,
      centerOnWrite: options.centerOnWrite ?? false,
      colors: options.colors || {}
    };
  }

  /**
   * Adds a column to the table
   * @param header - Column header text
   * @returns The created column object
   */
  addColumn(header: string): Column {
    const column: Column = {
      header,
      id: this.columnId++,
      parent: this
    };
    this.columns.push(column);
    return column;
  }

  /**
   * Adds a row to the table
   * @param cells - Cell values for the row
   * @returns The created row object
   * @throws Error if too many cells are provided
   */
  addRow(...cells: (string | number)[]): Row {
    if (cells.length > this.columns.length) {
      throw new Error('Too many columns supplied for the row');
    }
    
    const row: Row = {
      cells: cells.map(c => String(c ?? '')),
      id: this.rowId++,
      parent: this
    };
    this.rows.push(row);
    return row;
  }

  /**
   * Removes a column at the specified index
   * @param index - Column index to remove
   */
  removeColumnAt(index: number): void {
    this.columns.splice(index, 1);
  }

  /**
   * Removes a row at the specified index
   * @param index - Row index to remove
   */
  removeRowAt(index: number): void {
    this.rows.splice(index, 1);
  }

  /**
   * Calculates the display width of a string, accounting for:
   * - Full-width characters (CJK, emojis)
   * - Zero-width characters
   * - Control sequences
   * @param str - String to measure
   * @returns Display width in terminal columns
   */
  private _getStringWidth(str: string): number {
    // Remove control characters and normalize
    str = stripVTControlCharacters(str);
    str = str.normalize('NFC');
    
    let width = 0;
    for (const char of str) {
      const code = char.codePointAt(0);
      
      if (code === undefined) continue;
      
      // Full-width characters take 2 columns
      if (this._isFullWidthCodePoint(code)) {
        width += 2;
      } else if (!this._isZeroWidthCodePoint(code)) {
        width += 1;
      }
    }
    
    return width;
  }

  /**
   * Checks if a Unicode code point is full-width
   * Includes CJK characters, emojis, and other wide characters
   * @param code - Unicode code point
   * @returns True if the character is full-width
   */
  private _isFullWidthCodePoint(code: number): boolean {
    return code >= 0x1100 && (
      code <= 0x115f ||  // Hangul Jamo
      code === 0x2329 || code === 0x232a ||  // Angle brackets
      (code >= 0x2e80 && code <= 0x3247 && code !== 0x303f) ||  // CJK Radicals
      (code >= 0x3250 && code <= 0x4dbf) ||  // CJK
      (code >= 0x4e00 && code <= 0xa4c6) ||  // CJK Unified Ideographs
      (code >= 0xa960 && code <= 0xa97c) ||  // Hangul Jamo Extended-A
      (code >= 0xac00 && code <= 0xd7a3) ||  // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) ||  // CJK Compatibility
      (code >= 0xfe10 && code <= 0xfe19) ||  // Vertical Forms
      (code >= 0xfe30 && code <= 0xfe6b) ||  // CJK Compatibility Forms
      (code >= 0xff01 && code <= 0xff60) ||  // Fullwidth Forms
      (code >= 0xffe0 && code <= 0xffe6) ||  // Fullwidth Forms
      (code >= 0x1b000 && code <= 0x1b001) ||  // Kana Supplement
      (code >= 0x1f200 && code <= 0x1f251) ||  // Enclosed Ideographic
      (code >= 0x1f300 && code <= 0x1f64f) ||  // Emojis
      (code >= 0x20000 && code <= 0x3fffd)  // CJK Extension
    );
  }

  /**
   * Checks if a Unicode code point is zero-width
   * @param code - Unicode code point
   * @returns True if the character has zero width
   */
  private _isZeroWidthCodePoint(code: number): boolean {
    return (
      code <= 0x1F ||  // C0 control codes
      (code >= 0x7F && code <= 0x9F) ||  // C1 control codes
      (code >= 0x300 && code <= 0x36F) ||  // Combining diacritical marks
      (code >= 0x200B && code <= 0x200F) ||  // Zero-width spaces
      (code >= 0xFE00 && code <= 0xFE0F) ||  // Variation selectors
      code === 0xFEFF  // Zero-width no-break space
    );
  }

  /**
   * Calculates the maximum column width needed
   * @returns Column width in characters
   */
  private _calculateColWidth(): number {
    let maxWidth = 0;
    
    // Check header widths
    for (const col of this.columns) {
      const width = this._getStringWidth(col.header);
      if (width > maxWidth) {
        maxWidth = width;
      }
    }
    
    // Check cell widths
    for (const row of this.rows) {
      for (const cell of row.cells) {
        const width = this._getStringWidth(cell);
        if (width > maxWidth) {
          maxWidth = width;
        }
      }
    }
    
    return maxWidth + 4;  // Add padding
  }

  /**
   * Builds the top border line
   * @param colWidth - Column width
   * @returns Formatted top border
   */
  private _buildTopLine(colWidth: number): string {
    const { downright, downleft, leftright, downleftright } = AsciiTable.PIPES;
    let line = downright;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (i > 0) line += downleftright;
      line += leftright.repeat(colWidth - 1);
    }
    
    line += downleft;
    return line;
  }

  /**
   * Builds the bottom border line
   * @param colWidth - Column width
   * @returns Formatted bottom border
   */
  private _buildBottomLine(colWidth: number): string {
    const { upright, upleft, leftright, upleftright } = AsciiTable.PIPES;
    let line = upright;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (i > 0) line += upleftright;
      line += leftright.repeat(colWidth - 1);
    }
    
    line += upleft;
    return line;
  }

  /**
   * Builds a divider line between rows
   * @param colWidth - Column width
   * @returns Formatted divider
   */
  private _buildDivider(colWidth: number): string {
    const { updownright, updownleft, leftright, updownleftright } = AsciiTable.PIPES;
    let line = updownright;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (i > 0) line += updownleftright;
      line += leftright.repeat(colWidth - 1);
    }
    
    line += updownleft;
    return line;
  }

  /**
   * Converts the table to a string representation
   * @returns Formatted table as a string
   */
  toString(): string {
    if (this.columns.length === 0) return '';
    
    const colWidth = this._calculateColWidth();
    const lines: string[] = [];
    const { updown } = AsciiTable.PIPES;

    // Top border
    lines.push(this._buildTopLine(colWidth));

    // Headers
    const headers = this.columns.map(col => {
      const width = this._getStringWidth(col.header);
      const padding = colWidth - width - 3;
      return padding > 0 ? col.header + ' '.repeat(padding) : col.header;
    });
    lines.push(`${updown} ${headers.join(` ${updown} `)} ${updown}`);

    // Rows
    for (const row of this.rows) {
      if (this.options.showDividers) {
        lines.push(this._buildDivider(colWidth));
      }

      const cells: string[] = [];
      for (let i = 0; i < this.columns.length; i++) {
        const cellValue = row.cells[i] || '';
        const width = this._getStringWidth(cellValue);
        const padding = colWidth - width - 3;
        cells.push(padding > 0 ? cellValue + ' '.repeat(padding) : cellValue);
      }
      
      lines.push(`${updown} ${cells.join(` ${updown} `)} ${updown}`);
    }

    // Bottom border
    lines.push(this._buildBottomLine(colWidth));

    return lines.join('\n');
  }

  /**
   * Prints the table to the console
   */
  print(): void {
    console.log(this.toString());
  }
}
