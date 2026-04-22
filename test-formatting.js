import { Formatting } from './index.js';

const fmt = Formatting.getInstance();

console.log('Simple divider:');
console.log(fmt.createDivider());

console.log('\nDivider with title:');
console.log(fmt.createDivider('SECTION'));

console.log('\nCentered text:');
console.log(fmt.center('This text is centered'));

console.log('\nSpaced text:');
console.log('[' + fmt.space('Name', 20) + ']');
console.log('[' + fmt.space('Age', 20) + ']');
console.log('[' + fmt.space('City', 20) + ']');
