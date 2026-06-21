import fs from 'fs';
import readline from 'readline';

// Update this path if your data.js is located somewhere else
import { categories, words } from './src/data.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== Flashcards Data Migration ===");

rl.question("What is the language key for the old pronunciations (e.g., 'it', 'en', 'fr')? ", (langKey) => {
    
    // 1. Map over the words array to transform the data
    const migratedWords = words.map(word => {
        let newPronunciation = word.pronunciation;
        
        // If pronunciation is a string, convert it to an object with the provided language key
        if (typeof newPronunciation === 'string') {
            newPronunciation = { [langKey]: word.pronunciation };
        }

        return {
            ...word,
            pronunciation: newPronunciation
        };
    });

    // 2. Format the output back into a valid JS module format
    const output = `export const categories = ${JSON.stringify(categories, null, 4)};\n\nexport const words = ${JSON.stringify(migratedWords, null, 4)};\n`;

    // 3. Write to a new file so we don't accidentally overwrite your original before you verify it
    const outputPath = './src/data.migrated.js';
    fs.writeFileSync(outputPath, output, 'utf-8');

    console.log(`\n✅ Conversion complete!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`\nYou can now rename 'data.migrated.js' to 'data.js' to use the new format.`);
    
    rl.close();
});