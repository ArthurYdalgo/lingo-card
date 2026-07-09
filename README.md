# Flashcards App

This is a customizable, Progressive Web App (PWA) flashcards application that you, as a developer, can clone/fork and modify to your liking. 

The app features a dynamic onboarding flow where users can select their **native language** and the **language they want to learn** upon first boot. The app will automatically localize the UI and filter the flashcards based on these selections. You can seamlessly customize it to your needs by changing the `src/i18n.js`, `src/config.js`, and `src/data.js` files.

## ✨ Features

* **Dynamic Language Selection:** An intuitive onboarding flow allows users to choose their native language and target learning language. These can be swapped at any time via the settings menu.
* **Text-to-Speech (TTS) Integration:** Uses the native Web Speech API to provide accurate pronunciation. You can even target specific premium voices via keywords.
* **Multiple Study Modes:** * **Standard/Autoplay:** Listen and reveal cards.
    * **Reverse Mode:** Practice translating from the target language back to your native language.
    * **Write Mode:** Type out your translations and verify your spelling/accuracy.
    * **Retry Mode:** Automatically recycle incorrect cards to the end of the deck for spaced repetition.
* **Favorites System:** Star specific words to create custom study decks focused only on your saved items.
* **Contextual Learning:** Cards don't just show words; they include multiple example sentences to demonstrate real-world usage.
* **PWA Ready:** Built to be installed on mobile devices for a native-like experience.

---

## 🛠 Prerequisites

To run it locally, ensure you have **Node.js** (v18+ recommended) installed on your machine.

---

## 🚀 Running the App Locally

To run the app locally, you can use the following commands:

```bash
# Install dependencies
npm install

# Run the app in development mode
npm run dev

```

---

## ⚙️ Customizing the App

The application is built to be highly modular. Here is how you can tailor it to your specific languages and content.

### 1. Internationalization (`src/i18n.js`)

The app automatically switches its UI language to match the user's selected native language. You can add or modify translations for UI elements in `src/i18n.js`. To add a new UI language, simply duplicate an existing object (like `en` or `pt`), rename the key to match your language code, and translate the strings (like `appTitle`, `startPractice`, etc.).

### 2. General Configuration (`src/config.js`)

This file drives the core behavior of the app. It houses a unified `languages` array that handles both native and target languages. Here you may change:

* `languages`: An array of all available languages in the app. Each object takes:
* `code`: The language code (matches keys in `data.js` and `i18n.js`).
* `label`: The display label (e.g., "Italiano", "English").
* `flag`: An imported SVG file from the `public` folder.
* `ttsLang`: The language code for the text-to-speech engine (e.g., `"it-IT"`).
* `voiceKeywords`: An array of keywords (like `["Alice", "Luca", "Premium"]`) used to prioritize high-quality voices in the Web Speech API.
* `nativeSalutation`: The phrase used on the first-time boot screen so users can identify their native language (e.g., `"I speak English"`, `"Eu falo português"`).


* `defaultTargetLang`: The fallback learning language if none is set.
* `defaultNativeLang`: The fallback native language if none is set.

### 3. Flashcard Data (`src/data.js`)

#### The `categories` variable

Define your deck categories. Note: If you want these to be translated in the UI, map them in the `categories` object within your `src/i18n.js` file.

#### The `words` variable

Here you'll define the actual flashcard data. Each word object requires:

* `id`: A unique string identifier.
* `category`: A string matching one of the categories defined above.
* **Language Keys:** An arbitrary amount of language keys (e.g., `"pt"`, `"it"`, `"en"`) corresponding to the `code` in your `languages` array, each with a string value of the translated word.
* `pronunciation`: An object containing phonetic spelling per target language.
* `examples`: A list of objects containing example sentences translated into your supported languages.

**Example Format:**

```javascript
export const categories = [
    "Aeroporto",
    // more categories...
]

export const words = [
    {
        "id": "cat1_1",
        "category": "Aeroporto",
        "it": "aeroporto",
        "en": "airport",
        "pt": "aeroporto",
        "pronunciation": {
            "it": "a-e-ro-por-to",
            "en": "air-port"
        },
        "examples": [
            {
                "it": "Il nostro volo parte dall'aeroporto principale.",
                "pt": "Nosso voo parte do aeroporto principal.",
                "en": "Our flight departs from the main airport."
            }
        ]
    }
]

```

---

### Local LLM translation (Optional)

In case you want to add a new language to the data.js, you may modify and run the `src/translator.js`. Look for the `--- CONFIGURATION ---` section, and choose which of the existing language it will translate from and to which new language.

The script works by iterating over every word and making short prompts to translate the word, the pronunciation, and the example sentences, instead of asking for a full rebuild of the js file. This is to avoid hitting the token limit of the LLM. For every translated object of the words list, it will create a `data.partial.${modelName}.${randomHash}.${timestamp}.js` file, and keep the latest 5 ones. That way if the process is interrupted, you can resume from the last partial file and no progress will be lost. In the end a `data.added.${modelName}.${randomHash}.js` file will be created which you can (and should) check for any errors or missing translations before you overwrite the `data.js` file with it.

> [!WARNING]
> LLMs are not perfect, and can (and most likely will) make mistakes. You should always check the output of the translation before using it in your app to prevent it from inadvertently teaching your users incorrect translations.

#### Pre-requisites

You must have ollama running on you machine. Then pull a model (if you haven't done it already) with

```bash
ollama pull gemma3:12b

```

The model may be a different one that you see prefer. This was the one used to translate from portuguese to english.

#### Using the `src/translator.js` script

Then run the script with:

```bash
node src/translator.js

```

It will list all the ollama models you have installed and ask you to choose one. Then just wait for the script to finish running (which took around 8 hours or so in a M3 Macbook Air with 16GB of RAM running a `gemma3:12b` model)

## 🌍 Deployment & PWA Setup

### GitHub Pages Setup

There's a workflow in `.github/workflows/deploy.yml` meant to deploy the application to [GitHub Pages](https://pages.github.com/).

1. Enable it in your Repo's Settings > Pages.
2. Click on "Deploy from a branch" and switch it to "Github Actions".
3. *Note: You can uncomment the trigger in the YAML file to make deployments run automatically when pushed to the main branch.*

### Vite Configuration (`vite.config.js`)

If you are deploying to GitHub Pages, change the `base` path in `vite.config.js` from `"lingo-card"` to the name of your forked repository.

### Progressive Web App (`manifest.json`)

To provide the best mobile experience, modify the `public/manifest.json` file:

* Change the `name` and `short_name` to fit your app.
* Update the scope and start URLs, changing `lingo-card` to match your repo name if hosting on GitHub Pages.
* Replace the placeholder icons in the `public` folder with your own app logos.

