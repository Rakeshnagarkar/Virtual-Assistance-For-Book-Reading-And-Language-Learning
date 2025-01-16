const recordBtn = document.querySelector(".record"),
      result = document.querySelector(".result"),
      downloadBtn = document.querySelector(".download"),
      inputLanguage = document.querySelector("#language"),
      clearBtn = document.querySelector(".clear");

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let recording = false;

const languages = [
    {
      name: "English",
      code: "en",
    },
    {
      name: "Afrikaans",
      code: "af",
    },
    {
      name: "Albanian",
      code: "sq",
    },
    {
      name: "Arabic",
      code: "ar",
    },
    {
      name: "Armenian",
      code: "hy",
    },
    {
      name: "Azerbaijani",
      code: "az",
    },
    {
      name: "Basque",
      code: "eu",
    },
    {
      name: "Belarusian",
      code: "be",
    },
    {
      name: "Bulgarian",
      code: "bg",
    },
    {
      name: "Catalan",
      code: "ca",
    },
    {
      name: "Chinese (Simplified)",
      code: "zh-CN",
    },
    {
      name: "Chinese (Traditional)",
      code: "zh-TW",
    },
    {
      name: "Croatian",
      code: "hr",
    },
    {
      name: "Czech",
      code: "cs",
    },
    {
      name: "Danish",
      code: "da",
    },
    {
      name: "Dutch",
      code: "nl",
    },
    {
      name: "Estonian",
      code: "et",
    },
    {
      name: "Filipino",
      code: "tl",
    },
    {
      name: "Finnish",
      code: "fi",
    },
    {
      name: "French",
      code: "fr",
    },
    {
      name: "Galician",
      code: "gl",
    },
    {
      name: "Georgian",
      code: "ka",
    },
    {
      name: "German",
      code: "de",
    },
    {
      name: "Greek",
      code: "el",
    },
    {
      name: "Haitian Creole",
      code: "ht",
    },
    {
      name: "Hebrew",
      code: "iw",
    },
    {
      name: "Hindi",
      code: "hi",
    },
    {
      name: "Hungarian",
      code: "hu",
    },
    {
      name: "Icelandic",
      code: "is",
    },
    {
      name: "Indonesian",
      code: "id",
    },
    {
      name: "Irish",
      code: "ga",
    },
    {
      name: "Italian",
      code: "it",
    },
    {
      name: "Japanese",
      code: "ja",
    },
    {
      name: "Korean",
      code: "ko",
    },
    {
      name: "Latvian",
      code: "lv",
    },
    {
      name: "Lithuanian",
      code: "lt",
    },
    {
      name: "Macedonian",
      code: "mk",
    },
    {
      name: "Malay",
      code: "ms",
    },
    {
      name: "Maltese",
      code: "mt",
    },
    {
      name: "Norwegian",
      code: "no",
    },
    {
      name: "Persian",
      code: "fa",
    },
    {
      name: "Polish",
      code: "pl",
    },
    {
      name: "Portuguese",
      code: "pt",
    },
    {
      name: "Romanian",
      code: "ro",
    },
    {
      name: "Russian",
      code: "ru",
    },
    {
      name: "Serbian",
      code: "sr",
    },
    {
      name: "Slovak",
      code: "sk",
    },
    {
      name: "Slovenian",
      code: "sl",
    },
    {
      name: "Spanish",
      code: "es",
    },
    {
      name: "Swahili",
      code: "sw",
    },
    {
      name: "Swedish",
      code: "sv",
    },
    {
      name: "Thai",
      code: "th",
    },
    {
      name: "Turkish",
      code: "tr",
    },
    {
      name: "Ukrainian",
      code: "uk",
    },
    {
      name: "Urdu",
      code: "ur",
    },
    {
      name: "Vietnamese",
      code: "vi",
    },
    {
      name: "Welsh",
      code: "cy",
    },
    {
      name: "Yiddish",
      code: "yi",
    },
  ];
  

function populateLanguages() {
    languages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.innerHTML = lang.name;
        inputLanguage.appendChild(option);
    });
}

populateLanguages();

function speechToText() {
    try {
        recognition = new SpeechRecognition();
        recognition.lang = inputLanguage.value;
        recognition.interimResults = true;
        recordBtn.classList.add("recording");
        recordBtn.querySelector("p").innerHTML = "Listening...";
        recognition.start();
        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            if (event.results[0].isFinal) {
                result.innerHTML += " " + speechResult;
                const interimElem = result.querySelector("p.interim");
                if (interimElem) interimElem.remove();
            } else {
                let interimElem = result.querySelector("p.interim");
                if (!interimElem) {
                    interimElem = document.createElement("p");
                    interimElem.classList.add("interim");
                    result.appendChild(interimElem);
                }
                interimElem.innerHTML = speechResult;
            }
            downloadBtn.disabled = false;
        };
        recognition.onspeechend = stopRecording;
        recognition.onerror = (event) => {
            stopRecording();
            alert(`Error occurred: ${event.error}`);
        };
    } catch (error) {
        console.error("Speech recognition error:", error);
    }
}

recordBtn.addEventListener("click", () => {
    if (!recording) {
        speechToText();
        recording = true;
    } else {
        stopRecording();
    }
});

function stopRecording() {
    if (recognition) recognition.stop();
    recordBtn.classList.remove("recording");
    recordBtn.querySelector("p").innerHTML = "Start Listening";
    recording = false;
}

function download() {
    const text = result.innerText.trim();
    if (text) {
        const element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
        element.setAttribute("download", "speech.txt");
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

downloadBtn.addEventListener("click", download);
clearBtn.addEventListener("click", () => {
    result.innerHTML = "";
    downloadBtn.disabled = true;
});
