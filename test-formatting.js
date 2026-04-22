import { Formatting } from './dist/index.js';

console.log('Simple divider:');
console.log(Formatting.createDivider());

console.log('\nDivider with title:');
console.log(Formatting.createDivider('SECTION'));

console.log('\nCentered text:');
console.log(Formatting.center('This text is centered'));

console.log('\nSpaced text:');
console.log('[' + Formatting.space('Name', 20) + ']');
console.log('[' + Formatting.space('Age', 20) + ']');
console.log('[' + Formatting.space('City', 20) + ']');
