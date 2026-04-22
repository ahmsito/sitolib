# Sitolib

A lightweight Node.js library with CLIUI features and more.

## Installation

```bash
npm install sitolib
```

## Quick Start

```javascript
import { Core, AsciiTable, Formatting, Hashing } from 'sitolib';

// Initialize Core
const core = Core.getInstance();
core.start({ version: '1.0.0' });

// Create a table
const table = new AsciiTable();
table.addColumn('Name');
table.addColumn('Status');
table.addRow('Server', 'Running');
table.print();

// Use formatting utilities
const fmt = Formatting.getInstance();
console.log(fmt.createDivider('SECTION'));

// Hash strings
const hash = Hashing.hashString('password123');
```

## Features

- ASCII tables with customizable borders
- Colorful console logging with labels
- Rainbow text effects (horizontal & vertical)
- Message queuing system
- Centered text output
- Custom color support
- Alert boxes
- MOTD (Message of the Day) display

## Usage

### ASCII Tables

```javascript
import { AsciiTable } from 'sitolib';

const table = new AsciiTable({ showDividers: true });

table.addColumn('Name');
table.addColumn('Age');
table.addColumn('City');

table.addRow('Alice', '25', 'New York');
table.addRow('Bob', '30', 'Los Angeles');

table.print();
```

### Core Logging

```javascript
import { Core } from 'sitolib';

const core = Core.getInstance();

core.start({
  logoString: 'Your ASCII Logo',
  version: '1.0.0',
  author: { name: 'Your Name', url: 'https://example.com' },
  motd: 'Welcome message'
});

// Different label types
core.writeLine({ label: { text: 'ok' } }, 'Success message');
core.writeLine({ label: { text: 'fail' } }, 'Error message');
core.writeLine({ label: { text: 'info' } }, 'Info message');
core.writeLine({ label: { text: 'work' } }, 'Working...');

// Rainbow effects
core.writeLine({ horizontalRainbow: true }, 'Rainbow text!');

// Custom colors
core.writeLine({}, '#ff0000', 'Red ', '#00ff00', 'Green');

// Alert boxes
core.createAlert('WARNING', '#ff0000', 'Important message');
```

## API

### AsciiTable

#### Constructor
`new AsciiTable(options)`

Options:
- `showDividers` (boolean): Show row dividers. Default: `true`

#### Methods
- `addColumn(header)` - Add a column
- `addRow(...cells)` - Add a row
- `removeColumnAt(index)` - Remove column
- `removeRowAt(index)` - Remove row
- `toString()` - Get table as string
- `print()` - Print to console

### Core

#### Methods
- `getInstance()` - Get singleton instance
- `start(options)` - Initialize with logo, version, etc.
- `writeLine(props, ...messages)` - Write formatted message
- `createAlert(title, color, ...lines)` - Create alert box
- `clear()` - Clear console and reset
- `delay(ms)` - Async delay
- `readLine(prompt)` - Read user input

#### Message Properties
- `label` - { text: 'ok'|'fail'|'info'|'work'|'skip'|'conf'|'help' }
- `time` - { show: boolean }
- `horizontalRainbow` - Rainbow effect across text
- `verticalRainbow` - Single color from rainbow
- `center` - Center the text

### Hashing

```javascript
import { Hashing } from 'sitolib';

// SHA256 (default)
const hash = Hashing.hashString('password123');

// MD5
const md5 = Hashing.hashMD5('text');

// SHA512
const sha512 = Hashing.hashSHA512('text');

// Custom algorithm
const custom = Hashing.hash('text', 'sha1');
```

## License

MIT
