import { stripVTControlCharacters } from 'node:util';

interface AsciiTableOptions {
  showDividers?: boolean;
  centerOnWrite?: boolean;
  colors?: Record<string, string>;
}

interface Column {
  header: string;
  id: number;
  parent: AsciiTable;
}

interface Row {
  cells: string[];
  id: number;
  parent: AsciiTable;
}

export class AsciiTable {
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

  constructor(options: AsciiTableOptions = {}) {
    this.options = {
      showDividers: options.showDividers ?? true,
      centerOnWrite: options.centerOnWrite ?? false,
      colors: options.colors || {}
    };
  }

  addColumn(header: string): Column {
    const column: Column = {
      header,
      id: this.columnId++,
      parent: this
    };
    this.columns.push(column);
    return column;
  }

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

  removeColumnAt(index: number): void {
    this.columns.splice(index, 1);
  }

  removeRowAt(index: number): void {
    this.rows.splice(index, 1);
  }

  private _getStringWidth(str: string): number {
    // Remove control characters and normalize
    str = stripVTControlCharacters(str);
    str = str.normalize('NFC');
    
    let width = 0;
    for (const char of str) {
      const code = char.codePointAt(0);
      
      if (code === undefined) continue;
      
      // Full-width characters (CJK, emojis, etc.)
      if (this._isFullWidthCodePoint(code)) {
        width += 2;
      } else if (!this._isZeroWidthCodePoint(code)) {
        width += 1;
      }
    }
    
    return width;
  }

  private _isFullWidthCodePoint(code: number): boolean {
    return code >= 0x1100 && (
      code <= 0x115f ||
      code === 0x2329 || code === 0x232a ||
      (code >= 0x2e80 && code <= 0x3247 && code !== 0x303f) ||
      (code >= 0x3250 && code <= 0x4dbf) ||
      (code >= 0x4e00 && code <= 0xa4c6) ||
      (code >= 0xa960 && code <= 0xa97c) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6b) ||
      (code >= 0xff01 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1b000 && code <= 0x1b001) ||
      (code >= 0x1f200 && code <= 0x1f251) ||
      (code >= 0x1f300 && code <= 0x1f64f) ||
      (code >= 0x20000 && code <= 0x3fffd)
    );
  }

  private _isZeroWidthCodePoint(code: number): boolean {
    return (
      code <= 0x1F || // C0 control codes
      (code >= 0x7F && code <= 0x9F) || // C1 control codes
      (code >= 0x300 && code <= 0x36F) || // Combining diacritical marks
      (code >= 0x200B && code <= 0x200F) || // Zero-width spaces
      (code >= 0xFE00 && code <= 0xFE0F) || // Variation selectors
      code === 0xFEFF // Zero-width no-break space
    );
  }

  private _calculateColWidth(): number {
    let maxWidth = 0;
    
    for (const col of this.columns) {
      const width = this._getStringWidth(col.header);
      if (width > maxWidth) {
        maxWidth = width;
      }
    }
    
    for (const row of this.rows) {
      for (const cell of row.cells) {
        const width = this._getStringWidth(cell);
        if (width > maxWidth) {
          maxWidth = width;
        }
      }
    }
    
    return maxWidth + 4;
  }

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

  toString(): string {
    if (this.columns.length === 0) return '';
    
    const colWidth = this._calculateColWidth();
    const lines: string[] = [];
    const { updown } = AsciiTable.PIPES;

    lines.push(this._buildTopLine(colWidth));

    const headers = this.columns.map(col => {
      const width = this._getStringWidth(col.header);
      const padding = colWidth - width - 3;
      return padding > 0 ? col.header + ' '.repeat(padding) : col.header;
    });
    lines.push(`${updown} ${headers.join(` ${updown} `)} ${updown}`);

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

    lines.push(this._buildBottomLine(colWidth));

    return lines.join('\n');
  }

  print(): void {
    console.log(this.toString());
  }
}
