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

  constructor(options = {}) {
    this.rows = [];
    this.columns = [];
    this.rowId = 0;
    this.columnId = 0;
    this.options = {
      showDividers: options.showDividers ?? true,
      centerOnWrite: options.centerOnWrite ?? false,
      colors: options.colors || {}
    };
  }

  addColumn(header) {
    const column = {
      header,
      id: this.columnId++,
      parent: this
    };
    this.columns.push(column);
    return column;
  }

  addRow(...cells) {
    if (cells.length > this.columns.length) {
      throw new Error('Too many columns supplied for the row');
    }
    const row = {
      cells: cells.map(c => String(c ?? '')),
      id: this.rowId++,
      parent: this
    };
    this.rows.push(row);
    return row;
  }

  removeColumnAt(index) {
    this.columns.splice(index, 1);
  }

  removeRowAt(index) {
    this.rows.splice(index, 1);
  }

  _calculateColWidth() {
    let maxWidth = 0;
    
    for (const col of this.columns) {
      if (col.header.length > maxWidth) {
        maxWidth = col.header.length;
      }
    }
    
    for (const row of this.rows) {
      for (const cell of row.cells) {
        if (cell.length > maxWidth) {
          maxWidth = cell.length;
        }
      }
    }
    
    return maxWidth + 4;
  }

  _buildTopLine(colWidth) {
    const { downright, downleft, leftright, downleftright } = AsciiTable.PIPES;
    let line = downright;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (i > 0) line += downleftright;
      line += leftright.repeat(colWidth - 1);
    }
    
    line += downleft;
    return line;
  }

  _buildBottomLine(colWidth) {
    const { upright, upleft, leftright, upleftright } = AsciiTable.PIPES;
    let line = upright;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (i > 0) line += upleftright;
      line += leftright.repeat(colWidth - 1);
    }
    
    line += upleft;
    return line;
  }

  _buildDivider(colWidth) {
    const { updownright, updownleft, leftright, updownleftright } = AsciiTable.PIPES;
    let line = updownright;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (i > 0) line += updownleftright;
      line += leftright.repeat(colWidth - 1);
    }
    
    line += updownleft;
    return line;
  }

  toString() {
    if (this.columns.length === 0) return '';
    
    const colWidth = this._calculateColWidth();
    const lines = [];
    const { updown } = AsciiTable.PIPES;

    lines.push(this._buildTopLine(colWidth));

    const headers = this.columns.map(col => {
      const padding = colWidth - col.header.length - 3;
      return padding > 0 ? col.header + ' '.repeat(padding) : col.header;
    });
    lines.push(`${updown} ${headers.join(` ${updown} `)} ${updown}`);

    for (const row of this.rows) {
      if (this.options.showDividers) {
        lines.push(this._buildDivider(colWidth));
      }

      const cells = [];
      for (let i = 0; i < this.columns.length; i++) {
        const cellValue = row.cells[i] || '';
        const padding = colWidth - cellValue.length - 3;
        cells.push(padding > 0 ? cellValue + ' '.repeat(padding) : cellValue);
      }
      
      lines.push(`${updown} ${cells.join(` ${updown} `)} ${updown}`);
    }

    lines.push(this._buildBottomLine(colWidth));

    return lines.join('\n');
  }

  print() {
    console.log(this.toString());
  }
}
