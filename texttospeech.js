document.addEventListener('DOMContentLoaded', () => {
    const languageOption = document.querySelectorAll('select');
    const fromText = document.querySelector('#fromText');
    const toText = document.querySelector('#toText');
    const fromVoice = document.querySelector('#fromVoice');
    const toVoice = document.querySelector('#toVoice');
    const cpyBtn = document.querySelector('#cpyBtn');
    const wordCount = document.querySelector('#wordCount');
    const swapLang = document.querySelector('#swap-lang');
    const imageInput = document.querySelector('#imageInput');
    const extractTextBtn = document.querySelector('#extractTextBtn');
    const pauseBtn = document.querySelector('#pauseBtn');
    const forwardBtn = document.querySelector('#forwardBtn');
    const backwardBtn = document.querySelector('#backwardBtn');

    let currentSpeech = null;
    let isPaused = false;
    let pausedAtIndex = 0;
    let sentences = [];

    const language = {
    "am-ET": "Amharic",
    "ar-SA": "Arabic",
    "be-BY": "Bielarus",
    "bem-ZM": "Bemba",
    "bi-VU": "Bislama",
    "bjs-BB": "Bajan",
    "bn-IN": "Bengali",
    "bo-CN": "Tibetan",
    "br-FR": "Breton",
    "bs-BA": "Bosnian",
    "ca-ES": "Catalan",
    "cop-EG": "Coptic",
    "cs-CZ": "Czech",
    "cy-GB": "Welsh",
    "da-DK": "Danish",
    "dz-BT": "Dzongkha",
    "de-DE": "German",
    "dv-MV": "Maldivian",
    "el-GR": "Greek",
    "en-GB": "English",
    "es-ES": "Spanish",
    "et-EE": "Estonian",
    "eu-ES": "Basque",
    "fa-IR": "Persian",
    "fi-FI": "Finnish",
    "fn-FNG": "Fanagalo",
    "fo-FO": "Faroese",
    "fr-FR": "French",
    "gl-ES": "Galician",
    "gu-IN": "Gujarati",
    "ha-NE": "Hausa",
    "he-IL": "Hebrew",
    "hi-IN": "Hindi",
    "hr-HR": "Croatian",
    "hu-HU": "Hungarian",
    "id-ID": "Indonesian",
    "is-IS": "Icelandic",
    "it-IT": "Italian",
    "ja-JP": "Japanese",
    "kk-KZ": "Kazakh",
    "km-KM": "Khmer",
    "kn-IN": "Kannada",
    "ko-KR": "Korean",
    "ku-TR": "Kurdish",
    "ky-KG": "Kyrgyz",
    "la-VA": "Latin",
    "lo-LA": "Lao",
    "lv-LV": "Latvian",
    "men-SL": "Mende",
    "mg-MG": "Malagasy",
    "mi-NZ": "Maori",
    "ms-MY": "Malay",
    "mt-MT": "Maltese",
    "my-MM": "Burmese",
    "ne-NP": "Nepali",
    "niu-NU": "Niuean",
    "nl-NL": "Dutch",
    "no-NO": "Norwegian",
    "ny-MW": "Nyanja",
    "ur-PK": "Pakistani",
    "pau-PW": "Palauan",
    "pa-IN": "Panjabi",
    "ps-PK": "Pashto",
    "pis-SB": "Pijin",
    "pl-PL": "Polish",
    "pt-PT": "Portuguese",
    "rn-BI": "Kirundi",
    "ro-RO": "Romanian",
    "ru-RU": "Russian",
    "sg-CF": "Sango",
    "si-LK": "Sinhala",
    "sk-SK": "Slovak",
    "sm-WS": "Samoan",
    "sn-ZW": "Shona",
    "so-SO": "Somali",
    "sq-AL": "Albanian",
    "sr-RS": "Serbian",
    "sv-SE": "Swedish",
    "sw-SZ": "Swahili",
    "ta-LK": "Tamil",
    "te-IN": "Telugu",
    "tet-TL": "Tetum",
    "tg-TJ": "Tajik",
    "th-TH": "Thai",
    "ti-TI": "Tigrinya",
    "tk-TM": "Turkmen",
    "tl-PH": "Tagalog",
    "tn-BW": "Tswana",
    "to-TO": "Tongan",
    "tr-TR": "Turkish",
    "uk-UA": "Ukrainian",
    "uz-UZ": "Uzbek",
    "vi-VN": "Vietnamese",
    "wo-SN": "Wolof",
    "xh-ZA": "Xhosa",
    "yi-YD": "Yiddish",
    "zu-ZA": "Zulu"
    };

    const populateDropdowns = () => {
        languageOption.forEach((select, index) => {
            select.innerHTML = "";
            for (let countryCode in language) {
                let selected = "";
                if (index === 0 && countryCode === 'en-GB') {
                    selected = "selected";
                } 
                if (index === 1 && countryCode === 'bn-IN') {
                    selected = "selected";
                }
                let option = `<option value="${countryCode}" ${selected}>${language[countryCode]}</option>`;
                select.insertAdjacentHTML('beforeend', option);
            }
        });
    };

    populateDropdowns();

    const updateWordCount = () => {
        const currentLength = fromText.value.length;
        wordCount.textContent = `${currentLength} / 5000`;
    };

    fromText.addEventListener('input', updateWordCount);

    fromText.addEventListener('input', () => {
        const content = fromText.value;
        const fromLang = document.querySelector('#from-lang').value;
        const toLang = document.querySelector('#to-lang').value;
        const transLINK = `https://api.mymemory.translated.net/get?q=${content}&langpair=${fromLang}|${toLang}`;

        fetch(transLINK)
            .then(response => response.json())
            .then(data => {
                toText.value = data.responseData.translatedText;
            })
            .catch(error => console.error('Error:', error));
    });

    function startSpeech(text, lang) {
        if (!text.trim()) return;

        // Split the text into sentences
        sentences = text.split(/(?<=[.!?])\s+/); // Split by punctuation marks (., ?, !)

        // If there is an ongoing speech, stop it
        if (speechSynthesis.speaking || speechSynthesis.paused) {
            speechSynthesis.cancel();
        }

        // Reset state when speech starts
        isPaused = false;
        pausedAtIndex = 0;

        // Speak the text starting from the first sentence
        speakSentence(pausedAtIndex, lang);
    }

    function speakSentence(index, lang) {
        if (index >= sentences.length) return;

        const sentence = sentences[index];
        currentSpeech = new SpeechSynthesisUtterance(sentence);
        currentSpeech.lang = lang;

        // On sentence end, move to next sentence or stop
        currentSpeech.onend = () => {
            if (!isPaused) {
                pausedAtIndex++;
                speakSentence(pausedAtIndex, lang); // Continue with the next sentence
            }
        };

        speechSynthesis.speak(currentSpeech);
    }

    fromVoice.addEventListener('click', () => {
        const fromLang = document.querySelector('#from-lang').value;
        startSpeech(fromText.value, fromLang);
    });

    toVoice.addEventListener('click', () => {
        const toLang = document.querySelector('#to-lang').value;
        startSpeech(toText.value, toLang);
    });

    pauseBtn.addEventListener('click', () => {
        if (speechSynthesis.speaking || speechSynthesis.paused) {
            if (!isPaused) {
                speechSynthesis.pause();  // Pause speech
                isPaused = true;
            } else {
                speechSynthesis.resume();  // Resume speech
                isPaused = false;
                speakSentence(pausedAtIndex, document.querySelector('#from-lang').value); // Ensure it resumes from the right sentence
            }
        }
    });

    forwardBtn.addEventListener('click', () => {
        if (pausedAtIndex < sentences.length - 1) {
            pausedAtIndex++;
            if (isPaused) {
                speechSynthesis.resume();  // Resume speech if paused
            }
            speakSentence(pausedAtIndex, document.querySelector('#from-lang').value); // Continue with the next sentence
        }
    });

    backwardBtn.addEventListener('click', () => {
        if (pausedAtIndex > 0) {
            pausedAtIndex--;
            if (isPaused) {
                speechSynthesis.resume();  // Resume speech if paused
            }
            speakSentence(pausedAtIndex, document.querySelector('#from-lang').value); // Move back to the previous sentence
        }
    });

    cpyBtn.addEventListener('click', () => {
        if (toText.value.trim()) {
            navigator.clipboard.writeText(toText.value);
        } else {
            console.log('No translated text to copy!');
        }
    });

    swapLang.addEventListener('click', () => {
        const fromLang = document.querySelector('#from-lang');
        const toLang = document.querySelector('#to-lang');
        const tempValue = fromLang.value;
        fromLang.value = toLang.value;
        toLang.value = tempValue;

        const tempText = fromText.value;
        fromText.value = toText.value;
        toText.value = tempText;
    });

    const extractTextFromImage = (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const apiKey = 'K84362960388957';

        fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
                'apikey': apiKey
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("OCR API response:", data);
            if (data && data.ParsedResults && data.ParsedResults.length > 0) {
                const extractedText = data.ParsedResults[0].ParsedText;
                fromText.value = extractedText;
                updateWordCount();
            } else {
                fromText.value = "No text found in the image.";
                alert("OCR did not extract any text. Please try a clearer image.");
            }
        })
        .catch((error) => {
            console.error("Error during OCR:", error);
            fromText.value = "Error extracting text.";
        });
    };

    extractTextBtn.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fromText.value = "Processing image...";
            updateWordCount();
            console.log("Selected file:", file);
            extractTextFromImage(file);
        } else {
            alert("Please select an image file.");
        }
    });

    
});
