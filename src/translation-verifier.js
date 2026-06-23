// Import the data from your file (adjust the path if necessary)
import { words } from './data.js';

// Alternative: If you are using CommonJS instead of ES Modules, use:
// const { words } = require('./data.js');

function findPronunciationErrors(data) {
    const possibleErrors = data.filter(item => {
        // 1. Ensure the required keys exist to prevent runtime crashes
        if (!item.en || !item.pronunciation || !item.pronunciation.en) {
            return false;
        }

        // 2. Clean up the strings by trimming leading/trailing whitespace
        const enText = item.en.trim();
        const pronunText = item.pronunciation.en.trim();

        // 3. Check Condition 1: 'en' key has only one word (no spaces inside)
        // We split by one or more spaces using the regex /\s+/
        const isSingleEnglishWord = enText.split(/\s+/).length === 1;

        // 4. Check Condition 2: 'pronunciation.en' has more than one word (space separated)
        const isMultiplePronunciationWords = pronunText.split(/\s+/).length > 1;

        // 5. Return true if both conditions are met
        return isSingleEnglishWord && isMultiplePronunciationWords;
    });

    return possibleErrors;
}

// Run the function and store the results
const flaggedItems = findPronunciationErrors(words);

// Output the results
console.log(`🔎 Found ${flaggedItems.length} possible error(s).\n`);

let languageKey = 'en';

if (flaggedItems.length > 0) {
    flaggedItems.forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Word: "${item[languageKey]}"`);
        console.log(`Pronunciation: "${item.pronunciation[languageKey]}"`);
        console.log('-----------------------------------');
    });
} else {
    console.log('✅ No errors found matching this criteria.');
}