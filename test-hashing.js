import { Hashing } from './index.js';

console.log('Testing Hashing Module\n');

const testString = 'Hello, World!';

console.log(`Input: "${testString}"\n`);

console.log('SHA256:');
console.log(Hashing.hashString(testString));

console.log('\nMD5:');
console.log(Hashing.hashMD5(testString));

console.log('\nSHA512:');
console.log(Hashing.hashSHA512(testString));

console.log('\nCustom (SHA1):');
console.log(Hashing.hash(testString, 'sha1'));

// Test with different inputs
console.log('\n--- Multiple Inputs ---');
const inputs = ['password123', 'admin', 'test@example.com'];
inputs.forEach(input => {
  console.log(`\n"${input}" -> ${Hashing.hashString(input)}`);
});
