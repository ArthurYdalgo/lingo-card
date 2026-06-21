import flagIT from "../public/it.svg";
import flagEN from "../public/uk.svg";

export const appConfig = {
    // The UI language
    uiLanguage: "pt",

    // The native language key in your data schema (e.g., 'pt')
    nativeDataKey: "pt",

    // Available languages to study
    targetLanguages: [
        {
            code: "it",
            label: "Italiano",
            flag: flagIT,
            ttsLang: "it-IT",
            voiceKeywords: ["Alice", "Luca", "Premium", "Enhanced"],
        },
        // {
        //     code: "en",
        //     label: "Inglês",
        //     flag: flagEN,
        //     ttsLang: "en-US",
        //     voiceKeywords: ["Samantha", "Alex", "Premium"],
        // },
    ],
    defaultTargetLang: "it",
};
