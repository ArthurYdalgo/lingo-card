import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";

// --- Extracted Data & Utilities ---
import { categories, words } from "./data";
import { loadVoices, speakText, getPronunciation } from "./utils/speech";
import { appConfig } from "./config";
import { translations } from "./i18n";

// --- Minimalist SVGs ---
const SearchIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
const VolumeIcon = () => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
);
const StarOutline = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);
const StarSolid = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);
const RefreshIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"></polyline>
        <polyline points="23 20 23 14 17 14"></polyline>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
    </svg>
);
const ChevronLeft = () => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);
const ChevronRight = () => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
const CheckIcon = ({ size = 24, color = "currentColor" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
const XIcon = ({ size = 24, color = "currentColor" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const UndoIcon = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M3 7v6h6"></path>
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
    </svg>
);

// --- Componente de Exemplo ---
const ExampleItem = ({ example, activeLangCode, nativeKey, t, playAudio }) => {
    const [showNative, setShowNative] = useState(false);

    const targetExample = example[activeLangCode];
    const nativeExample = example[nativeKey];

    return (
        <div className="example-item">
            <div className="ex-it-wrapper">
                <span
                    className="ex-it"
                    onClick={() => setShowNative(!showNative)}>
                    {targetExample}
                </span>
                <button
                    className="ex-audio-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        playAudio(targetExample);
                    }}
                    title={t.listenExample || "Ouvir Exemplo"}>
                    <VolumeIcon />
                </button>
            </div>
            {showNative && nativeExample && (
                <div className="ex-pt">{nativeExample}</div>
            )}
            {nativeExample && (
                <button
                    className="btn-translate"
                    onClick={() => setShowNative(!showNative)}>
                    {showNative
                        ? t.hideTranslation || "Ocultar tradução"
                        : t.seeTranslation || "Ver tradução"}
                </button>
            )}
        </div>
    );
};

// --- Main App ---
export default function App() {
    // --- Generic Configurations ---
    const t = translations[appConfig.uiLanguage];
    const nativeKey = appConfig.nativeDataKey;

    const [activeLangCode, setActiveLangCode] = useState(
        appConfig.defaultTargetLang,
    );
    const targetLangConfig = appConfig.targetLanguages.find(
        (l) => l.code === activeLangCode,
    );

    const playAudio = useCallback(
        (text) => {
            speakText(text, targetLangConfig, t);
        },
        [targetLangConfig, t],
    );

    // --- App States ---
    const [view, setView] = useState("home");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [numWordsToPractice, setNumWordsToPractice] = useState(20);
    const [practiceList, setPracticeList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showExamples, setShowExamples] = useState(false);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [userTranslation, setUserTranslation] = useState("");
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showLangModal, setShowLangModal] = useState(false);

    // --- Settings & Data Persistence ---
    const [favorites, setFavorites] = useState(() => {
        // 1. Check for the new generic format first
        const savedNew = localStorage.getItem("fc-favorites");
        if (savedNew) return JSON.parse(savedNew);

        return {};
    });

    const [autoPlay, setAutoPlay] = useState(() => {
        const saved = localStorage.getItem("fc-autoplay");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [retryMode, setRetryMode] = useState(() => {
        const saved = localStorage.getItem("fc-retrymode");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [writeMode, setWriteMode] = useState(() => {
        const saved = localStorage.getItem("fc-writemode");
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [submitOnEnter, setSubmitOnEnter] = useState(() => {
        const saved = localStorage.getItem("fc-submitonenter");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [reverseMode, setReverseMode] = useState(() => {
        const saved = localStorage.getItem("fc-reversemode");
        return saved !== null ? JSON.parse(saved) : false;
    });

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem("fc-favorites", JSON.stringify(favorites));
    }, [favorites]);
    useEffect(() => {
        localStorage.setItem("fc-autoplay", JSON.stringify(autoPlay));
    }, [autoPlay]);
    useEffect(() => {
        localStorage.setItem("fc-retrymode", JSON.stringify(retryMode));
    }, [retryMode]);
    useEffect(() => {
        localStorage.setItem("fc-writemode", JSON.stringify(writeMode));
    }, [writeMode]);
    useEffect(() => {
        localStorage.setItem("fc-submitonenter", JSON.stringify(submitOnEnter));
    }, [submitOnEnter]);
    useEffect(() => {
        localStorage.setItem("fc-reversemode", JSON.stringify(reverseMode));
    }, [reverseMode]);

    useEffect(() => {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => window.speechSynthesis.cancel();
    }, []);

    // --- Keybindings ---
    const handleKeyDown = useCallback(
        (e) => {
            if (view !== "practice" || isTransitioning || showCompletionModal)
                return;
            if (e.target.tagName === "INPUT") return;

            if (e.code === "Space") {
                e.preventDefault();
                if (!isRevealed) handleRevealCard();
            } else if (e.code === "ArrowRight") {
                if (
                    isRevealed &&
                    !answers[
                        practiceList[currentIndex]?.id + "-" + currentIndex
                    ]
                ) {
                    handleAnswer("correct");
                } else if (isRevealed) {
                    nextCard();
                }
            } else if (e.code === "ArrowLeft") {
                if (
                    isRevealed &&
                    !answers[
                        practiceList[currentIndex]?.id + "-" + currentIndex
                    ]
                ) {
                    handleAnswer("incorrect");
                } else if (isRevealed) {
                    prevCard();
                }
            }
        },
        [
            view,
            isRevealed,
            answers,
            currentIndex,
            practiceList,
            isTransitioning,
            showCompletionModal,
        ],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // --- Flow Actions ---
    const goHome = () => {
        setView("home");
        setSelectedCategory(null);
        setAnswers({});
        setSearchQuery("");
        setUserTranslation("");
        setShowCompletionModal(false);
        window.speechSynthesis.cancel();
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setView("setup");
    };

    const pickRandomCategory = () => {
        const randomIndex = Math.floor(Math.random() * categories.length);
        handleCategorySelect(categories[randomIndex]);
    };

    const startPractice = () => {
        let filteredWords = [];
        const currentLangFavorites = favorites[activeLangCode] || [];

        if (selectedCategory === t.favorites) {
            filteredWords = words.filter((w) =>
                currentLangFavorites.includes(w.id),
            );
        } else if (selectedCategory === t.allWords) {
            filteredWords = [...words];
        } else {
            filteredWords = words.filter(
                (w) => w.category === selectedCategory,
            );
        }

        if (filteredWords.length === 0) {
            alert(
                t.noWordsFound ||
                    "Nenhuma palavra encontrada para esta seleção.",
            );
            return;
        }

        const shuffled = filteredWords.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numWordsToPractice || 20);

        setPracticeList(selected);
        setCurrentIndex(0);
        setAnswers({});
        setIsRevealed(false);
        setShowExamples(false);
        setIsTransitioning(false);
        setUserTranslation("");
        setShowCompletionModal(false);
        setView("practice");
    };

    const handleRevealCard = () => {
        if (isTransitioning) return;
        setIsRevealed(true);
        if (autoPlay) {
            const currentWordTargetText =
                practiceList[currentIndex][activeLangCode];
            playAudio(currentWordTargetText);
        }
    };

    const nextCard = () => {
        if (isTransitioning || currentIndex >= practiceList.length - 1) return;
        if (!isRevealed) {
            window.speechSynthesis.cancel();
            setCurrentIndex((prev) => prev + 1);
            setUserTranslation("");
            return;
        }
        setIsTransitioning(true);
        setIsRevealed(false);
        setShowExamples(false);
        window.speechSynthesis.cancel();
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setUserTranslation("");
            setIsTransitioning(false);
        }, 350);
    };

    const prevCard = () => {
        if (isTransitioning || currentIndex <= 0) return;
        if (!isRevealed) {
            window.speechSynthesis.cancel();
            setCurrentIndex((prev) => prev - 1);
            setUserTranslation("");
            return;
        }
        setIsTransitioning(true);
        setIsRevealed(false);
        setShowExamples(false);
        window.speechSynthesis.cancel();
        setTimeout(() => {
            setCurrentIndex((prev) => prev - 1);
            setUserTranslation("");
            setIsTransitioning(false);
        }, 350);
    };

    const toggleFavorite = (wordId) => {
        setFavorites((prev) => {
            const currentLangFavs = prev[activeLangCode] || [];
            if (currentLangFavs.includes(wordId)) {
                return {
                    ...prev,
                    [activeLangCode]: currentLangFavs.filter(
                        (id) => id !== wordId,
                    ),
                };
            } else {
                return {
                    ...prev,
                    [activeLangCode]: [...currentLangFavs, wordId],
                };
            }
        });
    };

    const checkCompletion = (newAnswers) => {
        const answeredCount = Object.keys(newAnswers).length;
        if (answeredCount > 0 && answeredCount === practiceList.length) {
            setTimeout(() => setShowCompletionModal(true), 500);
        }
    };

    const handleAnswer = (status) => {
        const currentWord = practiceList[currentIndex];
        const currentAnswerKey = currentWord.id + "-" + currentIndex;

        if (status === null) {
            const previousStatus = answers[currentAnswerKey];
            setAnswers((prev) => {
                const next = { ...prev };
                delete next[currentAnswerKey];
                return next;
            });

            if (previousStatus === "incorrect" && retryMode) {
                setPracticeList((prev) => {
                    const newList = [...prev];
                    for (let i = newList.length - 1; i > currentIndex; i--) {
                        if (newList[i].id === currentWord.id) {
                            newList.splice(i, 1);
                            break;
                        }
                    }
                    return newList;
                });
            }
            return;
        }

        setAnswers((prev) => {
            const newAnswers = { ...prev, [currentAnswerKey]: status };
            checkCompletion(newAnswers);
            return newAnswers;
        });

        if (status === "incorrect" && retryMode) {
            setPracticeList((prev) => [
                ...prev,
                { ...currentWord, _recycledKey: Date.now() },
            ]);
        }
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        return categories.filter((c) =>
            c.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [searchQuery]);

    const score = Object.values(answers).filter((a) => a === "correct").length;
    const answeredCardsCount = Object.keys(answers).length;
    const progressPercent =
        practiceList.length > 0
            ? Math.round((answeredCardsCount / practiceList.length) * 100)
            : 0;
    const scorePercent =
        practiceList.length > 0
            ? Math.round((score / practiceList.length) * 100)
            : 0;

    // Active Favorites Logic
    const currentLangFavorites = favorites[activeLangCode] || [];

    // --- TELA INICIAL ---
    if (view === "home") {
        return (
            <div className="app-container">
                {/* Language Selector Modal */}
                {showLangModal && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowLangModal(false)}>
                        <div
                            className="lang-modal-content"
                            onClick={(e) => e.stopPropagation()}>
                            <h3>{t.selectLanguage || "Selecione o Idioma"}</h3>
                            <div className="lang-options-container">
                                {appConfig.targetLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`lang-option-btn ${activeLangCode === lang.code ? "active" : ""}`}
                                        onClick={() => {
                                            setActiveLangCode(lang.code);
                                            setShowLangModal(false);
                                        }}>
                                        <span className="lang-option-flag">
                                            {/* Render as a standard image tag */}
                                            <img
                                                src={lang.flag}
                                                alt={lang.label}
                                                className="flag-svg"
                                            />
                                        </span>
                                        <span className="lang-option-label">
                                            {lang.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="btn-modal-secondary"
                                onClick={() => setShowLangModal(false)}>
                                {t.cancel || "Cancelar"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Updated Header */}
                <header className="home-header">
                    <div>
                        <h1>{t.appTitle || "Flashcards"}</h1>
                    </div>

                    <div className="header-actions">
                        {appConfig.targetLanguages.length > 1 && (
                            <button
                                className="btn-header-circle"
                                onClick={() => setShowLangModal(true)}
                                title={t.changeLanguage || "Mudar Idioma"}>
                                <img
                                    src={targetLangConfig.flag}
                                    alt="Bandeira do idioma"
                                    className="flag-svg"
                                />
                            </button>
                        )}
                        <button
                            className="btn-header-circle"
                            onClick={pickRandomCategory}
                            title={t.randomCategory}>
                            🎲
                        </button>
                    </div>
                </header>

                <div className="search-container">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="categories-grid">
                    <div
                        className="category-card special"
                        onClick={() => handleCategorySelect(t.allWords)}>
                        <span className="cat-title">{t.allWords}</span>
                        <span className="cat-count">
                            {words.length} {t.cardsCount}
                        </span>
                    </div>
                    <div
                        className="category-card special"
                        onClick={() => handleCategorySelect(t.favorites)}>
                        <span className="cat-title">{t.favorites}</span>
                        <span className="cat-count">
                            {currentLangFavorites.length} {t.cardsCount}
                        </span>
                    </div>

                    {filteredCategories.map((cat, index) => {
                        const count = words.filter(
                            (w) => w.category === cat,
                        ).length;
                        return (
                            <div
                                key={index}
                                className="category-card"
                                onClick={() => handleCategorySelect(cat)}>
                                <span className="cat-title">{cat}</span>
                                <span className="cat-count">
                                    {count} {t.cardsCount}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- TELA DE SETUP ---
    if (view === "setup") {
        let availableWordsCount =
            selectedCategory === t.favorites
                ? currentLangFavorites.length
                : selectedCategory === t.allWords
                  ? words.length
                  : words.filter((w) => w.category === selectedCategory).length;

        return (
            <div className="app-container">
                <header style={{ display: "flex", alignItems: "center" }}>
                    <button className="btn-back" onClick={goHome}>
                        ←
                    </button>
                    <h2
                        style={{
                            margin: 0,
                            textTransform: "uppercase",
                            fontSize: "1.2rem",
                            color: "var(--text-light)",
                        }}>
                        {selectedCategory}
                    </h2>
                </header>

                <div className="setup-container" style={{ marginTop: "32px" }}>
                    <h3>{t.howManyCards}</h3>
                    <p style={{ color: "var(--text-light)", marginTop: "8px" }}>
                        <strong>{availableWordsCount}</strong>{" "}
                        {t.availableCards}
                    </p>
                    <input
                        type="number"
                        className="setup-input"
                        value={numWordsToPractice}
                        onChange={(e) =>
                            setNumWordsToPractice(
                                parseInt(e.target.value, 10) || "",
                            )
                        }
                        min="1"
                        max={availableWordsCount}
                    />

                    <div className="settings-toggles">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={autoPlay}
                                onChange={(e) => setAutoPlay(e.target.checked)}
                            />
                            {t.autoPlayAudio} ({targetLangConfig.label})
                        </label>
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={retryMode}
                                onChange={(e) => setRetryMode(e.target.checked)}
                            />
                            {t.retryMode}
                        </label>
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={reverseMode}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setReverseMode(isChecked);
                                    if (isChecked) setWriteMode(false);
                                }}
                            />
                            {t.reverseMode}
                        </label>
                        {!reverseMode && (
                            <>
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={writeMode}
                                        onChange={(e) =>
                                            setWriteMode(e.target.checked)
                                        }
                                    />
                                    {t.writeMode}
                                </label>
                                {writeMode && (
                                    <label
                                        className="toggle-label"
                                        style={{
                                            paddingLeft: "28px",
                                            opacity: 0.8,
                                        }}>
                                        <input
                                            type="checkbox"
                                            checked={submitOnEnter}
                                            onChange={(e) =>
                                                setSubmitOnEnter(
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        {t.revealEnter}
                                    </label>
                                )}
                            </>
                        )}
                    </div>

                    <button className="btn-primary" onClick={startPractice}>
                        {t.startPractice}
                    </button>
                </div>
            </div>
        );
    }

    // --- TELA DE PRÁTICA ---
    const currentWord = practiceList[currentIndex];

    // Dynamic Language Mapping
    const targetWord = currentWord[activeLangCode];
    const nativeWord = currentWord[nativeKey];
    const pronunciationText = getPronunciation(currentWord, activeLangCode);

    const isFavorite = currentLangFavorites.includes(currentWord?.id);
    const currentAnswerKey = currentWord?.id + "-" + currentIndex;
    const currentAnswer = answers[currentAnswerKey];

    return (
        <div className="app-container practice-view">
            {/* Modal Conclusão */}
            {showCompletionModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{t.congrats || "Parabéns! 🎉"}</h2>
                        <p>
                            {t.completedSession ||
                                "Você revisou todos os cards desta sessão."}
                        </p>
                        <div className="modal-stats">
                            <div className="stat-box">
                                <span className="stat-value">{score}</span>
                                <span className="stat-label">
                                    {t.correctHits || "Acertos"}
                                </span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">
                                    {scorePercent}%
                                </span>
                                <span className="stat-label">
                                    {t.accuracy || "Precisão"}
                                </span>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button
                                className="btn-modal-secondary"
                                onClick={() => setShowCompletionModal(false)}>
                                {t.stayHere || "Ficar Aqui"}
                            </button>
                            <button
                                className="btn-modal-primary"
                                onClick={goHome}>
                                {t.backToMenu || "Voltar ao Menu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="practice-header">
                <button className="btn-back" onClick={goHome}>
                    ✕ {t.back || "Sair"}
                </button>
                <span className="deck-name">{selectedCategory}</span>
                <span className="card-counter">
                    {currentIndex + 1}/{practiceList.length}
                </span>
            </header>

            {/* Progress Bar */}
            <div className="progress-section">
                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="progress-stats">
                    <span></span>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <span>
                            {score} {t.correctHits || "acertadas"}
                        </span>
                        <span
                            style={{
                                color: "var(--accent)",
                                fontWeight: "bold",
                            }}>
                            {scorePercent}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Navegação e 3D Flip Card */}
            <div className="card-nav-wrapper">
                <button
                    className="chevron-btn"
                    onClick={prevCard}
                    disabled={currentIndex === 0 || isTransitioning}>
                    <ChevronLeft />
                </button>

                <div
                    className={`flip-container ${isRevealed ? "revealed" : ""}`}
                    onClick={() => !isRevealed && handleRevealCard()}>
                    <div className="flip-inner">
                        {/* FRONT (Língua Nativa / Reverso) */}
                        <div className="flip-front">
                            <div className="card-top-bar">
                                <div className="status-indicator">
                                    {currentAnswer === "correct" && (
                                        <CheckIcon
                                            size={24}
                                            color="var(--accent)"
                                        />
                                    )}
                                    {currentAnswer === "incorrect" && (
                                        <XIcon
                                            size={24}
                                            color="var(--danger)"
                                        />
                                    )}
                                </div>
                                <button
                                    className="fav-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(currentWord.id);
                                    }}>
                                    {isFavorite ? (
                                        <StarSolid />
                                    ) : (
                                        <StarOutline />
                                    )}
                                </button>
                            </div>

                            <div className="card-content">
                                <span className="lang-overline">
                                    {reverseMode
                                        ? targetLangConfig.label.toUpperCase()
                                        : t.nativeLabel || "PORTUGUÊS"}
                                </span>
                                <h2 className="word-main-pt">
                                    {reverseMode ? targetWord : nativeWord}
                                </h2>
                                {writeMode && !reverseMode && (
                                    <input
                                        type="text"
                                        className="write-input"
                                        placeholder={`${t.typeIn || "Digite em"} ${targetLangConfig.label.toLowerCase()}...`}
                                        value={userTranslation}
                                        onChange={(e) =>
                                            setUserTranslation(e.target.value)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                submitOnEnter &&
                                                !isRevealed
                                            ) {
                                                e.stopPropagation();
                                                handleRevealCard();
                                            }
                                        }}
                                    />
                                )}
                            </div>

                            <div className="card-footer">
                                <RefreshIcon />{" "}
                                {t.tapToReveal || "toque para revelar"}
                            </div>
                        </div>

                        {/* BACK (Língua Alvo / Reverso) */}
                        <div className="flip-back">
                            <div className="card-top-bar">
                                <button
                                    className="audio-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playAudio(targetWord);
                                    }}>
                                    <VolumeIcon />
                                </button>
                                <button
                                    className="fav-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(currentWord.id);
                                    }}>
                                    {isFavorite ? (
                                        <StarSolid />
                                    ) : (
                                        <StarOutline />
                                    )}
                                </button>
                            </div>

                            <div className="card-content">
                                <span
                                    className="lang-overline"
                                    style={{ opacity: 0.8, color: "#e5e7eb" }}>
                                    {reverseMode ? targetWord : nativeWord}
                                </span>
                                <h2 className="word-main-it">
                                    {reverseMode ? nativeWord : targetWord}
                                </h2>

                                {pronunciationText && (
                                    <span className="pronunciation-text">
                                        {t.pronunciation || "Pronúncia"}:{" "}
                                        {pronunciationText}
                                    </span>
                                )}

                                {writeMode &&
                                    !reverseMode &&
                                    userTranslation && (
                                        <div className="user-answer-check">
                                            <span
                                                className="lang-overline"
                                                style={{
                                                    opacity: 0.8,
                                                    color: "#e5e7eb",
                                                }}>
                                                {t.yourAnswer || "SUA RESPOSTA"}
                                                :
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "1.2rem",
                                                    fontWeight: "bold",
                                                }}>
                                                {userTranslation}
                                            </span>
                                        </div>
                                    )}
                            </div>

                            {/* Avaliação no Verso do Card */}
                            <div className="card-eval-footer">
                                {!currentAnswer ? (
                                    <div className="eval-result-inline">
                                        <button
                                            className="btn-eval-icon text-incorrect"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAnswer("incorrect");
                                            }}>
                                            <XIcon size={24} />
                                        </button>
                                        <button
                                            className="btn-eval-icon text-correct"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAnswer("correct");
                                            }}>
                                            <CheckIcon size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="eval-result-inline">
                                        <button
                                            className="btn-undo-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAnswer(null);
                                            }}
                                            title={t.undo || "Desfazer"}>
                                            <UndoIcon size={20} />
                                        </button>
                                        <span
                                            className={`eval-result-icon ${currentAnswer === "correct" ? "text-correct" : "text-incorrect"}`}>
                                            {currentAnswer === "correct" ? (
                                                <CheckIcon size={24} />
                                            ) : (
                                                <XIcon size={24} />
                                            )}
                                        </span>
                                        <div className="eval-spacer"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className="chevron-btn"
                    onClick={nextCard}
                    disabled={
                        currentIndex === practiceList.length - 1 ||
                        isTransitioning
                    }>
                    <ChevronRight />
                </button>
            </div>

            {/* --- Exemplos Ocultos --- */}
            {isRevealed && (
                <div className="reveal-content visible">
                    {currentWord.examples &&
                        currentWord.examples.length > 0 && (
                            <div className="examples-container">
                                {!showExamples ? (
                                    <>
                                        <ExampleItem
                                            example={currentWord.examples[0]}
                                            activeLangCode={activeLangCode}
                                            nativeKey={nativeKey}
                                            t={t}
                                            playAudio={playAudio}
                                        />
                                        {currentWord.examples.length > 1 && (
                                            <button
                                                className="btn-secondary"
                                                onClick={() =>
                                                    setShowExamples(true)
                                                }>
                                                {t.seeMoreExamples ||
                                                    "Ver mais exemplos"}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    currentWord.examples.map((ex, idx) => (
                                        <ExampleItem
                                            key={idx}
                                            example={ex}
                                            activeLangCode={activeLangCode}
                                            nativeKey={nativeKey}
                                            t={t}
                                            playAudio={playAudio}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
