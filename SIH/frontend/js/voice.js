// Noventra AI Voice Assistant & Multilingual Speech Engine

let isListening = false;
let recognition = null;
let audioAnimId = null;

// Get Active Speech Recognition Code
function getActiveSpeechLanguage() {
  const currentLang = localStorage.getItem('livelihood_saathi_language') || 'en';
  if (currentLang === 'ta') return 'ta-IN';
  if (currentLang === 'hi') return 'hi-IN';
  return 'en-IN';
}

// Initialize Web Audio Waveform Canvas Animation
function initWaveformCanvas() {
  const canvas = document.getElementById('voiceWaveformCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let phase = 0;

  function renderWave() {
    canvas.width = canvas.parentElement.clientWidth || 600;
    canvas.height = 60;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isListening) {
      const bars = 40;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.sin(phase + i * 0.3) * 20 + Math.random() * 15 + 5;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#14b8a6');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 4, height);
      }
      phase += 0.15;
    } else {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let x = 0; x < canvas.width; x += 10) {
        ctx.lineTo(x, canvas.height / 2 + Math.sin(x * 0.02 + phase) * 3);
      }
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();
      phase += 0.03;
    }

    audioAnimId = requestAnimationFrame(renderWave);
  }

  if (audioAnimId) cancelAnimationFrame(audioAnimId);
  renderWave();
}

// Web Speech STT Recognition with Language Auto-Matching & Accents Support
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition unavailable on this browser.');
    return null;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    isListening = true;
    updateMicUI(true);
    const langCode = getActiveSpeechLanguage();
    const statusMsgs = {
      'ta-IN': '🔴 கேட்கிறது... மைக்ரோஃபோனில் தெளிவாகப் பேசுங்கள்.',
      'hi-IN': '🔴 सुन रहे हैं... माइक्रोफ़ोन में स्पष्ट बोलें।',
      'en-IN': '🔴 Listening... Speak clearly into your microphone.'
    };
    document.getElementById('voiceStatusLabel').textContent = statusMsgs[langCode] || statusMsgs['en-IN'];
  };

  rec.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Voice Input Captured:', transcript);
    addChatMessage('user', transcript);
    await processVoiceInput(transcript);
  };

  rec.onerror = (event) => {
    console.error('Speech error:', event.error);
    isListening = false;
    updateMicUI(false);
    document.getElementById('voiceStatusLabel').textContent = `Speech error: ${event.error}. Click mic to retry.`;
  };

  rec.onend = () => {
    isListening = false;
    updateMicUI(false);
  };

  return rec;
}

function updateMicUI(active) {
  const micFab = document.getElementById('mainMicFab');
  if (micFab) {
    if (active) {
      micFab.classList.add('listening');
      micFab.innerHTML = '<i class="fa-solid fa-square"></i>';
    } else {
      micFab.classList.remove('listening');
      micFab.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
  }
}

// Add Chat Message to UI
function addChatMessage(sender, text) {
  const historyBox = document.getElementById('chatHistoryBox');
  if (!historyBox) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}`;
  const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
  
  msgDiv.innerHTML = `
    <div class="chat-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
    <div class="chat-bubble">
      ${text}
      ${sender === 'ai' ? `
        <div class="audio-controls-row">
          <button class="btn btn-ghost btn-sm speak-text-btn" style="padding:2px 8px; font-size:0.75rem;"><i class="fa-solid fa-volume-high"></i> Listen</button>
        </div>
      ` : ''}
    </div>
  `;

  historyBox.appendChild(msgDiv);
  historyBox.scrollTop = historyBox.scrollHeight;

  const speakBtn = msgDiv.querySelector('.speak-text-btn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => speakText(text));
  }
}

// Multilingual Text-to-Speech Engine
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  const cleanText = text.replace(/<[^>]*>?/gm, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langCode = getActiveSpeechLanguage();
  utterance.lang = langCode;
  utterance.rate = 0.95; // Clear natural speed

  // Voice Selection matching language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === langCode || v.lang.startsWith(langCode.substring(0, 2)));
  if (matchedVoice) utterance.voice = matchedVoice;

  window.speechSynthesis.speak(utterance);
}

// Sequential Interactive Information Gathering Engine (Steps 1 & 2)
const INTERACTIVE_QUESTIONS = [
  { key: 'full_name', q: { en: "Welcome to Noventra! I will help you identify suitable livelihood opportunities and NSQF skill training. Before giving recommendations, I need to collect some details. First, what is your Full Name?", ta: "நொவென்ட்ராவிற்கு நல்வரவு! பொருத்தமான வாழ்வாதார வாய்ப்புகள் மற்றும் எச்.எஸ்.க்யூ.எஃப் தொழிற்பயிற்சியைக் கண்டறிய உதவுகிறேன். தொடங்க, உங்கள் முழுப் பெயர் என்ன?", hi: "नोवेंट्रा में आपका स्वागत है! मैं आपको उपयुक्त आजीविका अवसरों और एनएसक्यूएफ कौशल प्रशिक्षण की पहचान करने में मदद करूंगा। शुरू करने के लिए, आपका पूरा नाम क्या है?" } },
  { key: 'age', q: { en: "Thank you. What is your Age?", ta: "நன்றி. உங்கள் வயது என்ன?", hi: "धन्यवाद। आपकी आयु कितनी है?" } },
  { key: 'gender', q: { en: "What is your Gender?", ta: "உங்கள் பாலினம் என்ன?", hi: "आपका लिंग क्या है?" } },
  { key: 'mobile', q: { en: "What is your Mobile Number?", ta: "உங்கள் கைபேசி எண் என்ன?", hi: "आपका मोबाइल नंबर क्या है?" } },
  { key: 'district', q: { en: "Which District do you live in?", ta: "நீங்கள் எந்த மாவட்டத்தில் வசிக்கிறீர்கள்?", hi: "आप किस जिले में रहते हैं?" } },
  { key: 'village', q: { en: "Which Village or Town?", ta: "உங்கள் கிராமம் அல்லது நகரம் எது?", hi: "आपका गांव या शहर कौन सा है?" } },
  { key: 'education', q: { en: "What is your Highest Completed Education?", ta: "உங்கள் உயர்ந்த கல்வித்தகுதி என்ன?", hi: "आपकी उच्चतम शिक्षा क्या है?" } },
  { key: 'current_livelihood', q: { en: "What is your Current Occupation or Work?", ta: "உங்கள் தற்போதைய தொழில் அல்லது வேலை என்ன?", hi: "आपका वर्तमान व्यवसाय या कार्य क्या है?" } },
  { key: 'experience_years', q: { en: "How many Years of Experience do you have in this field?", ta: "இந்த துறையில் உங்களுக்கு எத்தனை வருட அனுபவம் உள்ளது?", hi: "इस क्षेत्र में आपका कितने वर्षों का अनुभव है?" } },
  { key: 'skills', q: { en: "What Existing Skills do you possess?", ta: "உங்களிடம் உள்ள தற்போதைய திறன்கள் என்ன?", hi: "आपके पास कौन से कौशल हैं?" } },
  { key: 'career_goal', q: { en: "What is your Desired Career Goal or Aspiration?", ta: "உங்கள் எதிர்கால வேலை அல்லது தொழிலின் இலக்கு என்ன?", hi: "आपका वांछित करियर लक्ष्य क्या है?" } },
  { key: 'interest', q: { en: "What are your specific Sector Interests?", ta: "உங்களுக்கு எந்தத் துறைகளில் ஆர்வம் உள்ளது?", hi: "आपकी विशेष रुचियां क्या हैं?" } },
  { key: 'preferred_language', q: { en: "What is your Preferred Language?", ta: "உங்கள் விருப்பமான மொழி எது?", hi: "आपकी पसंदीदा भाषा कौन सी है?" } }
];

let conversationStepIndex = -1;

function getCurrentLangKey() {
  return localStorage.getItem('livelihood_saathi_language') || 'en';
}

function startSequentialGathering() {
  conversationStepIndex = 0;
  const lang = getCurrentLangKey();
  const welcomeText = INTERACTIVE_QUESTIONS[0].q[lang] || INTERACTIVE_QUESTIONS[0].q.en;
  addChatMessage('ai', welcomeText);
  speakText(welcomeText);
}

// Process Voice / Text Input with Backend NLP API & Sequential Q&A
async function processVoiceInput(userText) {
  const statusLabel = document.getElementById('voiceStatusLabel');
  const activeLang = getCurrentLangKey();
  statusLabel.textContent = '⚡ Processing response...';

  try {
    let profile = JSON.parse(localStorage.getItem('livelihood_saathi_profile') || '{}');

    // Check if input is a complete descriptive sentence (Step 9)
    if (userText.length > 25 && (userText.toLowerCase().includes('i am') || userText.toLowerCase().includes('occupation') || userText.toLowerCase().includes('goal') || userText.includes('நான்'))) {
      const response = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText, profile, language: activeLang })
      });
      const data = await response.json();
      if (data.profile) profile = { ...profile, ...data.profile };
      localStorage.setItem('livelihood_saathi_profile', JSON.stringify(profile));
      if (window.syncGlobalProfileData) window.syncGlobalProfileData();

      const summaryMsgs = {
        en: `Thank you ${profile.full_name || ''}! I have extracted your profile: Occupation: ${profile.current_livelihood || 'N/A'}, Education: ${profile.education || 'N/A'}, Goal: ${profile.career_goal || 'N/A'}. Generating personalized NSQF recommendations...`,
        ta: `நன்றி ${profile.full_name || ''}! உங்கள் விவரங்கள் சேகரிக்கப்பட்டன. வேலை: ${profile.current_livelihood || 'N/A'}, கல்வி: ${profile.education || 'N/A'}, இலக்கு: ${profile.career_goal || 'N/A'}. பரிந்துரைகள் உருவாக்கப்படுகின்றன...`,
        hi: `धन्यवाद ${profile.full_name || ''}! आपका प्रोफ़ाइल निकाला गया है: व्यवसाय: ${profile.current_livelihood || 'N/A'}, शिक्षा: ${profile.education || 'N/A'}, लक्ष्य: ${profile.career_goal || 'N/A'}।`
      };
      const summaryText = summaryMsgs[activeLang] || summaryMsgs.en;
      addChatMessage('ai', summaryText);
      speakText(summaryText);
      window.location.hash = '#nsqf-recommendation';
      return;
    }

    // Step-by-step Q&A state machine (Step 2)
    if (conversationStepIndex >= 0 && conversationStepIndex < INTERACTIVE_QUESTIONS.length) {
      const currentQ = INTERACTIVE_QUESTIONS[conversationStepIndex];
      const key = currentQ.key;

      if (key === 'experience_years' || key === 'age') {
        const numMatch = userText.match(/\d+/);
        profile[key] = numMatch ? parseInt(numMatch[0]) : userText;
      } else if (key === 'skills') {
        profile[key] = userText.split(/,|மற்றும்|और/).map(s => s.trim());
      } else {
        profile[key] = userText;
      }

      localStorage.setItem('livelihood_saathi_profile', JSON.stringify(profile));
      if (window.syncGlobalProfileData) window.syncGlobalProfileData();

      conversationStepIndex++;
      if (conversationStepIndex < INTERACTIVE_QUESTIONS.length) {
        const nextQ = INTERACTIVE_QUESTIONS[conversationStepIndex];
        const nextText = nextQ.q[activeLang] || nextQ.q.en;
        setTimeout(() => {
          addChatMessage('ai', nextText);
          speakText(nextText);
        }, 500);
        return;
      } else {
        // Completed all 13 questions
        conversationStepIndex = -1;
        const completeMsgs = {
          en: `Thank you ${profile.full_name}! All details collected. Your profile is ready. Generating personalized recommendations now...`,
          ta: `நன்றி ${profile.full_name}! அனைத்து விவரங்களும் சேகரிக்கப்பட்டன. உங்கள் பரிந்துரைகள் தயார்...`,
          hi: `धन्यवाद ${profile.full_name}! सभी विवरण एकत्र कर लिए गए हैं।`
        };
        const compText = completeMsgs[activeLang] || completeMsgs.en;
        addChatMessage('ai', compText);
        speakText(compText);
        window.location.hash = '#nsqf-recommendation';
        return;
      }
    }

    // Default API analysis if out of sequence
    const response = await fetch('/api/analyze-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText, profile, language: activeLang })
    });
    const data = await response.json();
    if (data.profile) {
      profile = { ...profile, ...data.profile };
      localStorage.setItem('livelihood_saathi_profile', JSON.stringify(profile));
      if (window.syncGlobalProfileData) window.syncGlobalProfileData();
    }

    const recResponse = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    const recData = await recResponse.json();
    let voiceSummary = recData.voice_summary;
    if (!voiceSummary) {
      voiceSummary = (recData.recommendations && recData.recommendations[0]) ? recData.recommendations[0].description : 'Your profile has been analyzed successfully!';
    }

    addChatMessage('ai', `<strong>Extracted Profile Insight:</strong><br/>${voiceSummary}`);
    speakText(voiceSummary);

    statusLabel.textContent = 'Voice assistant ready. Click microphone to speak.';
  } catch (err) {
    console.error(err);
    addChatMessage('ai', 'I could not process the voice input properly. Please try again.');
    statusLabel.textContent = 'Error processing response.';
  }
}

// DOM Setup
document.addEventListener('DOMContentLoaded', () => {
  initWaveformCanvas();
  recognition = initSpeechRecognition();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  const mainMicFab = document.getElementById('mainMicFab');
  const quickVoiceBtn = document.getElementById('quickVoiceBtn');

  const toggleMic = () => {
    if (!recognition) {
      recognition = initSpeechRecognition();
    }
    if (!recognition) {
      showToast('Speech Recognition not supported on this browser.', 'error');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = getActiveSpeechLanguage();
      window.location.hash = '#voice-assistant';
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition start caught:', e);
      }
    }
  };

  if (mainMicFab) mainMicFab.addEventListener('click', toggleMic);
  if (quickVoiceBtn) quickVoiceBtn.addEventListener('click', toggleMic);

  // Quick prompt chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const promptText = chip.getAttribute('data-prompt');
      addChatMessage('user', promptText);
      await processVoiceInput(promptText);
    });
  });

  // Initial Greeting (Step 1)
  const historyBox = document.getElementById('chatHistoryBox');
  if (historyBox && historyBox.children.length <= 1) {
    startSequentialGathering();
  }

  const clearChatBtn = document.getElementById('clearChatBtn');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (historyBox) {
        historyBox.innerHTML = '';
        startSequentialGathering();
      }
    });
  }
});
