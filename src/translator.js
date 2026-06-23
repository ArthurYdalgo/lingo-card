import { execSync } from 'child_process';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import { pathToFileURL } from 'url';
import crypto from 'crypto';

const rl = readline.createInterface({ input, output });

// --- CONCURRENCY SAFETY ---
const INSTANCE_ID = crypto.randomBytes(6).toString('hex');

// --- CONFIGURATION ---
const SOURCE_LANG = "pt"; 
const SOURCE_LANG_NAME = "Portuguese"; 

const DEST_LANG = "es"; 
const DEST_LANG_NAME = "Spanish"; 
// ---------------------

function getOllamaModels() {
    try {
        const output = execSync('ollama ls').toString().trim().split('\n');
        if (output.length < 2) return [];
        return output.slice(1).map(line => line.split(/\s+/)[0]);
    } catch (error) {
        console.error("Failed to execute 'ollama ls'. Is Ollama running?");
        process.exit(1);
    }
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-') 
        .replace(/^-+|-+$/g, '');
}

function savePartial(categories, wordsState, modelName) {
    const timestamp = Date.now();
    const modelSlug = slugify(modelName);
    
    const partialFilename = `./data.partial.${modelSlug}.${INSTANCE_ID}.${timestamp}.js`;
    
    const outputContent = `export const categories = ${JSON.stringify(categories, null, 4)};\n\nexport const words = ${JSON.stringify(wordsState, null, 4)};\n`;
    fs.writeFileSync(partialFilename, outputContent, 'utf-8');
    
    try {
        const files = fs.readdirSync('./');
        const instancePrefix = `data.partial.${modelSlug}.${INSTANCE_ID}.`;
        
        const partialFiles = files
            .filter(file => file.startsWith(instancePrefix) && file.endsWith('.js'))
            .map(file => {
                const parts = file.split('.');
                const ts = parseInt(parts[parts.length - 2]); 
                return { file, ts };
            })
            .sort((a, b) => a.ts - b.ts);

        while (partialFiles.length > 5) {
            const oldest = partialFiles.shift();
            fs.unlinkSync(`./${oldest.file}`);
        }
    } catch (e) {
        // Silent fail for cleanup
    }
}

async function askLLM(prompt, modelName) {
    try {
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: prompt }],
                stream: false
            })
        });

        const data = await response.json();
        let answer = data.message.content.trim();
        
        // Clean up common LLM formatting quirks
        answer = answer.replace(/^["']|["']$/g, ''); 
        answer = answer.replace(/\.$/, ''); 
        
        return answer.trim();
    } catch (e) {
        console.error(`  ↳ LLM connection failed. Returning empty string.`);
        return ""; 
    }
}

async function processWordItem(item, modelName) {
    const sourceWord = item[SOURCE_LANG];
    const categoryContext = item.category || "General Context";
    
    if (!sourceWord) return item;

    console.log(`\n[Inst: ${INSTANCE_ID}] Translating: ${sourceWord} [Category: ${categoryContext}]`);

    // --- Gather example sentences for context ---
    let exampleContext = "";
    if (item.examples && Array.isArray(item.examples) && item.examples.length > 0) {
        const sentences = item.examples.map(ex => `"${ex[SOURCE_LANG]}"`).join("\n");
        exampleContext = `\n\nFor additional context on how this exact word is used, here are some example sentences:\n${sentences}`;
    }

    // 1. Translate the main word
    const wordPrompt = `Translate the ${SOURCE_LANG_NAME} word "${sourceWord}" to ${DEST_LANG_NAME}. The category for this word is "${categoryContext}".${exampleContext}\n\nOutput ONLY the translated word in lowercase. Do not include any quotes, punctuation, conversational text, or explanations.`;
    
    const translatedWord = await askLLM(wordPrompt, modelName);
    console.log(`  ↳ Word: ${translatedWord}`);

    // 2. Get the pronunciation (TUNED PROMPT)
    const pronPrompt = `Provide a text-to-speech phonetic pronunciation guide for the ${DEST_LANG_NAME} translation: "${translatedWord}". 
RULES:
1. Break down words into syllables separated by hyphens (e.g., "air-port").
2. If there are multiple words, separate them with a SPACE (e.g., "su-it cai-si").
3. If there are alternative words separated by a slash (/), PRESERVE the slash and spaces around it (e.g., "op-tion on-e / op-tion two").
4. ONLY use standard English letters (A-Z, a-z), hyphens, spaces, and slashes.
5. NO special characters, NO accents, NO numbers, NO commas.
6. Hyphens must only go INSIDE words. A word MUST NOT start or end with a hyphen.
7. Output ONLY the pronunciation guide. Do not include quotes or explanations.`;
    
    let pronunciation = await askLLM(pronPrompt, modelName);
    
    // JS Failsafe: Updated to allow spaces (\s) and slashes (/)
    pronunciation = pronunciation.replace(/[^a-zA-Z-\s/]/g, ''); // Strip everything except letters, hyphens, spaces, slashes
    pronunciation = pronunciation.replace(/-+/g, '-');          // Deduplicate accidental double hyphens (--)
    pronunciation = pronunciation.replace(/-\s|\s-/g, ' ');     // Remove hyphens that ended up touching spaces
    pronunciation = pronunciation.replace(/-\/|\/-/g, '/');     // Remove hyphens that ended up touching slashes
    pronunciation = pronunciation.replace(/^-+|-+$/g, '');      // Strip leading/trailing hyphens from the whole string
    pronunciation = pronunciation.replace(/\s+/g, ' ').trim();  // Normalize multiple spaces into a single space
    
    console.log(`  ↳ Pronunciation: ${pronunciation}`);

    // 3. Process Examples
    let newExamples = [];
    if (item.examples && Array.isArray(item.examples)) {
        for (let i = 0; i < item.examples.length; i++) {
            const ex = item.examples[i];
            const sourceSentence = ex[SOURCE_LANG];
            
            const sentencePrompt = `Translate the following ${SOURCE_LANG_NAME} sentence to ${DEST_LANG_NAME}. The context/category for this sentence is "${categoryContext}". Output ONLY the translated sentence. Do not include quotes or explanations.\n\nSentence: "${sourceSentence}"`;
            const translatedSentence = await askLLM(sentencePrompt, modelName);
            
            newExamples.push({
                [DEST_LANG]: translatedSentence,
                ...ex
            });
            console.log(`  ↳ Example ${i + 1}: ${translatedSentence}`);
        }
    }

    // 4. Reconstruct object
    const newItem = {
        id: item.id,
        category: item.category,
        pt: item.pt,
        it: item.it,
        [DEST_LANG]: translatedWord,
        pronunciation: {
            ...item.pronunciation,
            [DEST_LANG]: pronunciation
        },
        examples: newExamples
    };

    return newItem;
}

async function main() {
    console.log(`Starting Translator Agent (Instance: ${INSTANCE_ID})`);
    console.log("Locating Ollama models...\n");
    
    const models = getOllamaModels();
    
    if (models.length === 0) {
        console.log("No models found.");
        process.exit(0);
    }

    models.forEach((model, index) => {
        console.log(`[${index + 1}] ${model}`);
    });

    const answer = await rl.question('\nSelect model number: ');
    const selectedIndex = parseInt(answer) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= models.length) {
        console.log("Invalid selection. Exiting.");
        process.exit(1);
    }

    const selectedModel = models[selectedIndex];
    console.log(`\nUsing model: ${selectedModel}\n`);

    let categories = [];
    let words = [];
    try {
        const fileUrl = pathToFileURL('./data.js').href;
        const dataModule = await import(fileUrl);
        categories = dataModule.categories || [];
        words = dataModule.words || [];
        console.log(`Loaded ${words.length} items from data.js\n`);
    } catch (e) {
        console.error("Critical error reading data.js.", e);
        process.exit(1);
    }

    let processedWords = [];

    for (let i = 0; i < words.length; i++) {
        console.log(`\n--- Progress: ${i + 1} / ${words.length} ---`);
        
        if (words[i][DEST_LANG]) {
            console.log(`Skipping: ${words[i][SOURCE_LANG]} (Already translated)`);
            processedWords.push(words[i]);
            continue;
        }

        const processedItem = await processWordItem(words[i], selectedModel);
        processedWords.push(processedItem);

        const pendingWords = words.slice(i + 1);
        const fullCurrentState = processedWords.concat(pendingWords);
        savePartial(categories, fullCurrentState, selectedModel);
    }

    const modelSlug = slugify(selectedModel);
    const finalFilename = `./data.added.${modelSlug}.${INSTANCE_ID}.js`;
    const outputContent = `export const categories = ${JSON.stringify(categories, null, 4)};\n\nexport const words = ${JSON.stringify(processedWords, null, 4)};\n`;
    
    fs.writeFileSync(finalFilename, outputContent, 'utf-8');
    
    console.log(`\nComplete! Data saved to ${finalFilename}`);
    rl.close();
}

main();