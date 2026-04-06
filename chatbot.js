document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('chatbot-fab');
  const chatWindow = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesContainer = document.getElementById('chatbot-messages');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  const API_KEY = "AIzaSyAG2quIIlj-D69bOnx5hzLlekmp3DEh4RA";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  // System context to ensure the bot behaves exactly like Aayush R
  const systemContext = `You are Aayush R, a Senior Product Designer from Bengaluru, India with 8+ years of experience across healthcare, enterprise software, consumer retail, and defense. You care about the intersection of clarity and craft. You have worked at Narayana Health, 314e Corporation, and Titan Company Limited.
Your tone is professional but extremely friendly and approachable. Keep your responses concise (1-3 sentences maximum). Talk in the first person ("I", "me"). Answer questions about your experience, resume, or design philosophy based on the persona of Aayush R. Never break character.`;

  // Store conversation history for context
  let conversationHistory = [];

  // Toggle chat window
  fab.addEventListener('click', () => {
    chatWindow.classList.remove('hidden');
    fab.style.transform = 'scale(0)';
    inputEl.focus();
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    fab.style.transform = '';
  });

  // Handle send message
  const sendMessage = async () => {
    const text = inputEl.value.trim();
    if (!text) return;

    // Add user message to UI
    appendMessage(text, 'user');
    inputEl.value = '';
    sendBtn.disabled = true;

    // Show typing indicator
    const typingId = showTypingIndicator();

    // Prepare messages payload
    conversationHistory.push({ role: "user", parts: [{ text: text }] });
    
    // Construct payload with system instructions
    const payload = {
      system_instruction: {
        parts: [{ text: systemContext }]
      },
      contents: conversationHistory
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      removeTypingIndicator(typingId);
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const botText = data.candidates[0].content.parts[0].text;
        appendMessage(botText, 'bot');
        conversationHistory.push({ role: "model", parts: [{ text: botText }] });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Chatbot API Error:', error);
      removeTypingIndicator(typingId);
      appendMessage("Sorry, I'm taking a coffee break right now. Feel free to reach out via email!", 'bot');
      // remove the last user message from history if failed to respond
      conversationHistory.pop();
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // UI Helpers
  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    // basic markdown bold stripping for cleaner UI if needed, but we keep it simple
    contentDiv.textContent = text.replace(/\*\*/g, ''); 
    
    msgDiv.appendChild(contentDiv);
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message bot';
    msgDiv.id = id;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content typing-indicator';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      contentDiv.appendChild(dot);
    }
    
    msgDiv.appendChild(contentDiv);
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
