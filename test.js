import { AsciiTable } from './cliui/asciitable/index.js';

// Create a new table
const table = new AsciiTable({ showDividers: true });

// Add columns
table.addColumn('Name');
table.addColumn('Age');
table.addColumn('City');

// Add rows
table.addRow('Alice', '25', 'New York');
table.addRow('Bob', '30', 'Los Angeles');
table.addRow('Charlie', '35', 'Chicago');

// Print the table
table.print();

console.log('\n--- Table without dividers ---\n');

// Create another table without dividers
const table2 = new AsciiTable({ showDividers: false });
table2.addColumn('Product');
table2.addColumn('Price');
table2.addRow('Laptop', '$999');
table2.addRow('Mouse', '$25');

table2.print();
