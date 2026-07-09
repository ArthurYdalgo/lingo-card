// config.js
import flagIT from "../public/it.svg";
import flagEN from "../public/uk.svg";
import flagPT from "../public/br.svg";

export const appConfig = {
    feedbackEmail: 'arthur.ydalgo.dev@gmail.com',

    // All available languages for BOTH native and target selection
    languages: [
        {
            code: "pt",
            label: "Português",
            flag: flagPT,
            ttsLang: "pt-BR",
            voiceKeywords: ["Luciana", "Thiago", "Premium", "Enhanced"],
            nativeSalutation: "Eu falo português",
        },
        {
            code: "en",
            label: "English",
            flag: flagEN,
            ttsLang: "en-US",
            voiceKeywords: ["Samantha", "Alex", "Premium"],
            nativeSalutation: "I speak English",
        },
        {
            code: "it",
            label: "Italiano",
            flag: flagIT,
            ttsLang: "it-IT",
            voiceKeywords: ["Alice", "Luca", "Premium", "Enhanced"],
            nativeSalutation: "Parlo italiano",
        }
    ],
    
    // Fallbacks
    defaultTargetLang: "en",
    defaultNativeLang: "pt",
};