const dotenv = require('dotenv');
const path = require('path');

// Load from parent directory of src/scripts meaning root is ../../
// But if we run from root, we just use default.
// Let's assume running from server/ root.
dotenv.config();

console.log('Checking Environment Variables...');
console.log('CWD:', process.cwd());

const keys = [
    'OPENAI_API_KEY',
    'FATSECRET_CLIENT_ID',
    'FATSECRET_CLIENT_SECRET',
    'USDA_API_KEY',
    'GOOGLE_VISION_API_KEY'
];

keys.forEach(key => {
    const val = process.env[key];
    if (val) {
        const masked = val.substring(0, 4) + '...' + val.substring(val.length - 4);
        console.log(`✅ ${key}: Found (${masked})`);
    } else {
        console.error(`❌ ${key}: MISSING`);
    }
});

if (process.env.USDA_API_KEY) {
    console.log('ℹ️  Note: USDA_API_KEY is present (likely what was referred to as Spoonacular)');
}
