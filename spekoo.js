const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = false; // Only final results
  recognition.maxAlternatives = 1;

  const toggleBtn = document.getElementById('toggleBtn');
  const recognizedTextDiv = document.getElementById('recognizedText');
  const translatedTextDiv = document.getElementById('translatedText');
  const recognizeLangSelect = document.getElementById('recognizeLang');
  const translateLangSelect = document.getElementById('translateLang');
  const voiceSelect = document.getElementById('voiceSelect');
  const themeLabel = document.getElementById('themeLabel');

  let isListening = false;
  let lastRecognized = "";
  let silenceTimer;
  let isDesktopAlertShown = false;

  const languages = [
  
  
  
   
  { name: "Afrikaans (South Africa)", code: "af-ZA", translate: "af" },
  { name: "Afrikaans (Namibia)", code: "af-NA", translate: "af" },

  { name: "Albanian (Albania)", code: "sq-AL", translate: "sq" },
  { name: "Albanian (Kosovo)", code: "sq-XK", translate: "sq" },

  { name: "Amharic (Ethiopia)", code: "am-ET", translate: "am" },
      
    
  ];

  languages.forEach(lang => {
    const opt1 = document.createElement("option");
    opt1.value = lang.code;
    opt1.textContent = lang.name;
    recognizeLangSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = lang.translate;
    opt2.textContent = lang.name;
    translateLangSelect.appendChild(opt2);
  });

  recognizeLangSelect.value = "en-US";
  translateLangSelect.value = "hi";

  recognition.onresult = function(event) {
    clearTimeout(silenceTimer);
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    if (transcript !== lastRecognized) {
      lastRecognized = transcript;
      const previous = recognizedTextDiv.innerHTML.replace(/<strong>(.*?)<\/strong>/, '$1');
      recognizedTextDiv.innerHTML = `<strong>${transcript}</strong>` + (previous ? `<br>${previous}` : '');
      translateText(transcript, translateLangSelect.value);
    }

    // Stop after 1500ms of silence
    silenceTimer = setTimeout(() => {
      recognition.stop();
    }, 1500);
  };

  recognition.onend = () => {
    if (isListening) {
      recognition.start();
    } else {
      console.log("Recognition stopped intentionally.");
    }
  };

  function isDesktop() {
    return window.innerWidth > 768 && !/Mobi|Android/i.test(navigator.userAgent);
  }

  function showCustomAlert(message) {
    document.getElementById("customAlertText").textContent = message;
    document.getElementById("customAlert").style.display = "block";
  }

  function closeCustomAlert() {
    document.getElementById("customAlert").style.display = "none";
  }

  toggleBtn.onclick = () => {
    if (isListening) {
      recognition.stop();
      clearTimeout(silenceTimer);
      toggleBtn.textContent = "🎤 Start Listening";
      toggleBtn.classList.remove("stop");
      isListening = false;
    } else {
      recognition.lang = recognizeLangSelect.value;
      if (isDesktop() && !isDesktopAlertShown) {
        showCustomAlert("For better speech recognition on desktop, please use an external microphone.");
        isDesktopAlertShown = true;
      }
      recognition.start();
      toggleBtn.textContent = "🛑 Stop Listening";
      toggleBtn.classList.add("stop");
      isListening = true;
    }
  };

  function translateText(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const translation = data[0].map(item => item[0]).join('');
        let existing = translatedTextDiv.innerText.trim();
        translatedTextDiv.innerText = translation + (existing ? '\n' + existing : '');
        translatedTextDiv.scrollTop = 0;
        speakText(translation);
      })
      .catch(() => {
        translatedTextDiv.innerText = 'Translation error';
      });
  }

  function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voiceSelect.value;
    const voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }


document.addEventListener("DOMContentLoaded", function () {
  showCustomAlert(
    "👋 Welcome to Spekoo — Your Live Speech-to-Speech Translator!\n\n" +
    "1️⃣ Choose the language you want to speak\n" +
    "2️⃣ Select the language and voice for the translation\n" +
    "3️⃣ Tap the \"Start\" button 🎤\n" +
    "4️⃣ Begin speaking naturally 🗣️\n\n" +
    "Spekoo will take care of the rest. Let's break language barriers together!"
  );
});




function showCustomAlert(message) {
  document.getElementById("customAlertText").innerText = message;
  document.getElementById("customAlert").style.display = "block";
}

function closeCustomAlert() {
  document.getElementById("customAlert").style.display = "none";
}




  function copyTranslatedText() {
    const lines = translatedTextDiv.innerText.trim().split('\n').reverse();
    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText).then(() => {
      showCustomAlert("Translated Text copied 📄");
    });
  }
  
  
  function opyTranslatedText() {
  const lines = translatedTextDiv.innerText.trim().split('\n').reverse();
  const fullText = lines.join('\n');

  // Override closeCustomAlert temporarily
  window.closeCustomAlert = function() {
    document.getElementById("customAlert").style.display = "none";
    window.open("https://www.google.com", "_blank");
  };

  showCustomAlert("For Download .mp3 with voice use Spekoo Application.🎥");
}


  

  function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeLabel.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";
    const currentLang = translateLangSelect.value.toLowerCase();
    voices
      .filter(v => v.lang.toLowerCase().startsWith(currentLang))
      .forEach(voice => {
        const opt = document.createElement("option");
        opt.value = voice.name;
        opt.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(opt);
      });

    if (voiceSelect.options.length === 0) {
      voiceSelect.innerHTML = '<option>No voice available</option>';
    }
  }

  translateLangSelect.addEventListener("change", populateVoices);
  window.speechSynthesis.onvoiceschanged = populateVoices;
  window.onload = populateVoices;