let cachedVoices = [];

export const loadVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
};

export const speakText = (text, targetLangConfig, i18nConfig) => {
  if (!('speechSynthesis' in window)) {
    alert(i18nConfig.noAudioSupport);
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLangConfig.ttsLang;
  utterance.rate = 0.9;

  const langVoices = cachedVoices.filter(v => v.lang.startsWith(targetLangConfig.code));
  const premiumVoice = langVoices.find(v => 
    targetLangConfig.voiceKeywords.some(keyword => v.name.includes(keyword))
  );
  
  utterance.voice = premiumVoice || langVoices[0] || null;
  window.speechSynthesis.speak(utterance);
};

export const getPronunciation = (word, activeLangCode) => {
    // 1. If it doesn't exist at all, return empty
    if (!word.pronunciation) return "";

    // 2. Fallback for old databases where it's a direct string
    if (typeof word.pronunciation === 'string') {
        return word.pronunciation;
    }

    // 3. New generic approach for multiple languages
    return word.pronunciation[activeLangCode] || "";
};