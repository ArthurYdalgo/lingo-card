# Flashcards App

This is a customizable flashcards app that you as a developer can clone/fork and modify to your liking. Depending on your/your users' native language and the languages they're studying.

In this current version, this app is meant for a portuguese native speaker learning italian. You can customize it to your needs by changing the `src/i18n.js`, `src/config.js` and `data.js` files. You might also need to add a flag svg in the `public` folder and import it in the `src/config.js` file.

# Using pages

There's a workflow in `.github/workflows/deploy.yml` meant to deploy the application to [GitHub Pages](https://pages.github.com/), like this one: https://arthurydalgo.github.io/lingo-card

You'll have to enable it in your Repo's Settings > Pages (click on "Deploy from a branch" and switch it to "Github Actions"). You can uncomment the part that makes the deployment run when something is pushed into the main branch, if you want.

## vite.config.js

Change the "lingo-card" to the name of the repo when you fork it. You'll also need to change it in the `public/manifest.json` file (as mentioned below)

# Manifest file

You can modify the `public/manifest.json` file to fit your needs, like changing `name`, `short_name`, etc. You should also change the `lingo-card` to the name of your repo (in case you're using GitHub Pages). This is used in case you want to create a better experience for PWAs.

# Customizing the App

## src/i18n.js

Here you can change the translations for the ui elements. You can add as many languages as you want, just make sure to add the corresponding language code in the `src/config.js` file.

## src/config.js

Here you may change:

- uiLanguage: the language code for the `i18n.js` translations to use for the ui elements
- nativeDataKey: the key in the `words` variable in `data.js` that corresponds to the native language
- targetLanguages
    - code: the language code for the target language (which should be the same as the key in the `words` variable in `data.js`)
    - label: the label for the language in the native language
    - flag: an svg that should exist in the `public` folder
    - ttsLang: the language code for the text-to-speech engine
    - voiceKeywords: an array of keywords that can be used to find a voice in the text-to-speech engine
- defaultTargetLanguage

## data.js

### The  `const categories` variable
Over here you'll define the categories in the native language, like `"Airport"`, or `"Aeroporto"`, etc...

### The `const words` variable

Here you'll define the words in the native language. Each word has:

- unique `id` (string)
- an arbitrary amount of language keys, each with a string value of the word in that language.
- a `category` (string), which must match one of the categories defined in the `categories` variable
- a `pronounciations` (object), which is an object with the keys being the target language codes, and the values being a string with the pronounciation in that language.
- an `examples` list, which is a list of objects, each object having a language key and a string with an example sentence in that language.

### Example

(This is an example in case a portuguese native speaker is learning italian and english)

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
        "pronunciation": {
            "it": "a-e-ro-por-to",
            "en": "air-port",
        },
        "examples": [
            {
                "it": "Il nostro volo parte dall'aeroporto principale.",
                "pt": "Nosso voo parte do aeroporto principal.",
                "en": "Our flight departs from the main airport."
            },
            {
                "it": "L'aeroporto è molto affollato oggi.",
                "pt": "O aeroporto está muito lotado hoje.",
                "en": "The airport is very crowded today."
            },
            {
                "it": "Quanto dista l'aeroporto dal centro?",
                "pt": "Qual a distância do aeroporto até o centro?",
                "en": "How far is the airport from the city center?"
            }
        ]
    },
    // more words...
]
```

# Running the app locally

To run the app locally, you can use the following commands:

```bash
# Install dependencies
npm install

# Run the app in development mode
npm run dev
```