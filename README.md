# Sitolib

A lightweight TypeScript CLI UI library for Node.js with ASCII tables, colorful logging, and rainbow effects.

## Installation

```bash
npm install sitolib
```

## Quick Start

```javascript
import { Core, AsciiTable, Formatting } from 'sitolib';

// Initialize Core
const core = new Core();
core.start({ version: '1.0.0' });

// Create a table
const table = new AsciiTable();
table.addColumn('Name');
table.addColumn('Status');
table.addRow('Server', 'Running');
table.print();

// Use formatting utilities
console.log(Formatting.createDivider('SECTION'));
```

## Features

- ASCII tables with customizable borders
- Proper Unicode width handling (emojis, CJK characters)
- Colorful console logging with labels
- Rainbow text effects (horizontal & vertical)
- Event-driven message queue system
- Centered text output
- Custom color support (hex colors)
- Alert boxes
- MOTD (Message of the Day) display
- Portable terminal clearing (uses tput on Unix)
- Full TypeScript support with type definitions

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

const core = new Core();

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

### Formatting

```javascript
import { Formatting } from 'sitolib';

// Create dividers
console.log(Formatting.createDivider());
console.log(Formatting.createDivider('SECTION'));

// Center text
console.log(Formatting.center('Centered text'));

// Pad text
console.log(Formatting.space('Name', 20));
```

## Projects that use this
* [OpenMP Upgrader](https://github.com/ahmsito/openmp-upgrader)

## API Reference

### AsciiTable

#### Constructor
`new AsciiTable(options)`

Options:
- `showDividers` (boolean): Show row dividers. Default: `true`
- `centerOnWrite` (boolean): Center content when writing
- `colors` (object): Custom color mappings

#### Methods
- `addColumn(header: string)` - Add a column
- `addRow(...cells: (string | number)[])` - Add a row
- `removeColumnAt(index: number)` - Remove column
- `removeRowAt(index: number)` - Remove row
- `toString(): string` - Get table as string
- `print(): void` - Print to console

### Core

#### Methods
- `start(options: StartProps)` - Initialize with logo, version, etc.
- `writeLine(props: WriteLineProps, ...messages: string[])` - Write formatted message
- `createAlert(title: string, color: string, ...lines: string[])` - Create alert box
- `clear()` - Clear console and reset
- `delay(ms: number): Promise<void>` - Async delay
- `readLine(prompt: string): Promise<string>` - Read user input

#### Message Properties
- `label` - { text: 'ok'|'fail'|'info'|'work'|'skip'|'conf'|'help', show: boolean, color?: string }
- `time` - { show: boolean, text?: string }
- `horizontalRainbow` - Rainbow effect across text
- `verticalRainbow` - Single color from rainbow
- `center` - Center the text

### Formatting

Static utility object with methods:
- `createDivider(title?: string | null): string` - Create horizontal divider
- `center(input: string): string` - Center text in terminal
- `space(input: string, length: number): string` - Pad text to length

## License

MIT

