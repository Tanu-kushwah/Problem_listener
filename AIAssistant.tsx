import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Send, Volume2, Settings, Minimize2, MicOff, Play, Pause } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'नमस्कार! मैं आपका Digital Saathi हूं। आपको किस चीज़ में मदद चाहिए? आप बोल सकते हैं या लिख सकते हैं।',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null); // Ref to store speechSynthesis instance
  const [hindiVoice, setHindiVoice] = useState<SpeechSynthesisVoice | null>(null); // State to store the Hindi voice

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current?.getVoices();
        // Log all available voices to debug
        console.log("Available voices:", voices); 
        const foundHindiVoice = voices?.find(voice => 
          voice.lang.includes('hi') || voice.lang.includes('IN')
        );
        if (foundHindiVoice) {
          setHindiVoice(foundHindiVoice);
          console.log("Hindi voice found:", foundHindiVoice);
        } else {
          setHindiVoice(null); // No Hindi voice found
          console.log("No Hindi voice found.");
        }
      };

      // Load voices immediately if they are already available
      loadVoices();
      // Listen for voices changed event to ensure voices are loaded
      synthRef.current.onvoiceschanged = loadVoices;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Speech Recognition language set to Hindi

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input received:', transcript);
        setInputValue(transcript);
        setIsListening(false);
        
        // Auto-send the voice message after a short delay
        setTimeout(() => {
          handleSendMessage(transcript, true);
        }, 500);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error message
        const errorMessage = getErrorMessage(event.error);
        alert(errorMessage);
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };
    } else {
      setVoiceSupported(false);
      console.log('Speech recognition not supported');
    }

    // Auto-speak welcome message when opened
    if (isOpen && messages.length === 1) {
      setTimeout(() => {
        speakText(messages[0].content);
      }, 1000);
    }
  }, [isOpen, messages]); // Added messages to dependency array

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'no-speech':
        return 'कोई आवाज़ नहीं सुनाई दी। कृपया फिर से कोशिश करें।';
      case 'audio-capture':
        return 'माइक्रोफोन की अनुमति दें और फिर कोशिश करें।';
      case 'not-allowed':
        return 'माइक्रोफोन की अनुमति दें। Settings में जाकर microphone को allow करें।';
      default:
        return 'Voice recognition में समस्या है। कृपया फिर कोशिश करें।';
    }
  };

  // Text to Speech function
  const speakText = (text: string) => {
    if (synthRef.current) {
      // Stop any ongoing speech
      synthRef.current.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use the pre-selected Hindi voice if available
      if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log("Speaking with Hindi voice:", hindiVoice.name);
      } else {
        // Fallback: Try to find a Hindi voice on the fly if not pre-selected,
        // or use default if no Hindi voice is found.
        const voices = synthRef.current.getVoices();
        const foundHindiVoice = voices.find(voice => 
          voice.lang.includes('hi') || voice.lang.includes('IN')
        );
        if (foundHindiVoice) {
          utterance.voice = foundHindiVoice;
          console.log("Speaking with fallback Hindi voice:", foundHindiVoice.name);
        } else {
          console.warn("No specific Hindi voice found for speaking. Using default voice for 'hi-IN'.");
          // If no specific Hindi voice, the browser will use its default for 'hi-IN'
          // which might be an English voice attempting to pronounce Hindi.
        }
      }
      
      utterance.lang = 'hi-IN'; // Explicitly set language for pronunciation
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = (messageText?: string, isVoiceMessage = false) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: isVoiceMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Show typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'ai',
      content: 'टाइप कर रहा है...',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingMessage]);

    // Simulate AI response with realistic delay
    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(aiMessage));
      
      // Speak the AI response
      setTimeout(() => {
        speakText(aiResponse);
      }, 500);
    }, 1500);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('बिजली') || lowerInput.includes('electricity') || lowerInput.includes('light')) {
      return 'बिजली की समस्या के लिए मैं आपकी पूरी मदद करूंगा। आपको क्या चाहिए:\n\n1. नया बिजली कनेक्शन\n2. बिजली बिल की समस्या\n3. बिजली नहीं आ रही\n4. मीटर की समस्या\n\nकृपया बताएं कि कौन सी समस्या है? मैं तुरंत फॉर्म भरने या शिकायत दर्ज करने में मदद करूंगा।';
    } else if (lowerInput.includes('पानी') || lowerInput.includes('water')) {
      return 'पानी की समस्या के लिए मैं यहाँ हूं। बताइए:\n\n1. नया पानी कनेक्शन चाहिए\n2. पानी नहीं आ रहा\n3. पानी का बिल\n4. पाइप लीक हो रहा है\n\nआप जो भी समस्या बताएंगे, मैं तुरंत संबंधित विभाग में शिकायत दर्ज कर दूंगा और आपको reference number भी दूंगा।';
    } else if (lowerInput.includes('फॉर्म') || lowerInput.includes('form')) {
      return 'फॉर्म भरने में मैं expert हूं! बताइए कौन सा फॉर्म:\n\n1. सरकारी योजना का फॉर्म\n2. बैंक का फॉर्म\n3. राशन कार्ड\n4. आधार कार्ड\n5. पासपोर्ट\n\nआप बस बोलकर जानकारी दे दीजिए, मैं पूरा फॉर्म भर दूंगा। कोई गलती नहीं होगी।';
    } else if (lowerInput.includes('दवाई') || lowerInput.includes('अस्पताल') || lowerInput.includes('medical') || lowerInput.includes('डॉक्टर')) {
      return 'स्वास्थ्य सेवा के लिए मैं तुरंत मदद करूंगा:\n\n1. नजदीकी अस्पताल - मैं आपके area के सबसे पास वाले hospital बता दूंगा\n2. दवाई की दुकान\n3. डॉक्टर की appointment\n4. Emergency number\n\nआपकी location बताइए या कौन सी बीमारी है? मैं तुरंत सही जगह का पता बता दूंगा।';
    } else if (lowerInput.includes('खेती') || lowerInput.includes('farming') || lowerInput.includes('किसान') || lowerInput.includes('फसल')) {
      return 'किसान भाई, खेती-बाड़ी की हर समस्या का समाधान यहाँ है:\n\n1. बीज और खाद की जानकारी\n2. सरकारी योजनाएं\n3. फसल बीमा\n4. मंडी के भाव\n5. मौसम की जानकारी\n\nआप कौन सी फसल उगाते हैं? या कोई specific problem है? मैं तुरंत सही guidance दूंगा।';
    } else if (lowerInput.includes('हैलो') || lowerInput.includes('नमस्कार') || lowerInput.includes('hi')) {
      return 'नमस्कार! मैं आपका Digital Saathi हूं। मैं आपकी हर सरकारी काम में मदद कर सकता हूं:\n\n✅ फॉर्म भरना\n✅ शिकायत दर्ज करना\n✅ सरकारी योजनाओं की जानकारी\n✅ अस्पताल, स्कूल खोजना\n\nआप बस बोलकर बताइए कि क्या चाहिए। मैं तुरंत मदद करूंगा!';
    } else {
      return 'मैं आपकी बात समझ गया हूं। आपकी मदद के लिए मैं यहाँ हूं। कृपया थोड़ा और specific बताएं:\n\n• कौन सा काम करवाना है?\n• कौन सा फॉर्म भरना है?\n• कोई शिकायत करनी है?\n\nआप बोलकर भी बता सकते हैं, मैं सुन रहा हूं और समझ जाऊंगा।';
    }
  };

  const handleVoiceInput = () => {
    if (!voiceSupported) {
      alert('आपका browser voice recognition support नहीं करता। कृपया Chrome, Firefox या Edge का उपयोग करें।');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
        alert('Voice recognition start करने में समस्या है। कृपया microphone की permission check करें।');
      }
    }
  };

  const quickActions = [
    '🏛️ सरकारी फॉर्म भरना है',
    '💡 बिजली की शिकायत करनी है',
    '💧 पानी की समस्या है',
    '🏥 अस्पताल खोजना है',
    '🚜 खेती की मदद चाहिए',
    '📚 पढ़ाई की जानकारी चाहिए'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Chat Window */}
        <motion.div
          className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl transition-all duration-300 ${
            isMinimized ? 'h-20' : 'h-[700px]'
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">🤖</span>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-white">Digital Saathi AI</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">
                    {voiceSupported ? 'Voice Ready 🎤' : 'Text Only 📝'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isSpeaking && (
                <motion.button
                  onClick={stopSpeaking}
                  className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-full transition-colors"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Volume2 className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">बोल रहा है - रोकें</span>
                </motion.button>
              )}
              
              <motion.button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Minimize2 className="w-6 h-6 text-gray-400" />
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-96">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-lg px-6 py-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                          : message.id === 'typing'
                          ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {message.type === 'user' ? (
                            <span className="text-sm font-medium">आप</span>
                          ) : (
                            <span className="text-sm font-medium">🤖 Digital Saathi</span>
                          )}
                          {message.isVoice && (
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">🎤 Voice</span>
                          )}
                        </div>
                        {message.type === 'ai' && message.id !== 'typing' && (
                          <button
                            onClick={() => speakText(message.content)}
                            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors flex items-center space-x-1"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>सुनें</span>
                          </button>
                        )}
                      </div>
                      <p className="text-base leading-relaxed whitespace-pre-line">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('hi-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-6 pb-4">
                <p className="text-gray-400 text-sm mb-3">Quick Actions - एक क्लिक में:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSendMessage(action)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-sm text-white transition-all duration-300 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-6 pt-0">
                <div className="flex items-center space-x-4 bg-white/10 border border-white/20 rounded-2xl p-4">
                  <motion.button
                    onClick={handleVoiceInput}
                    className={`p-4 rounded-full transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 animate-pulse shadow-lg' 
                        : voiceSupported
                        ? 'bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700'
                        : 'bg-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={voiceSupported ? { scale: 1.1 } : {}}
                    whileTap={voiceSupported ? { scale: 0.9 } : {}}
                    disabled={!voiceSupported}
                  >
                    {isListening ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </motion.button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={voiceSupported ? "यहाँ लिखें या माइक दबाकर बोलें..." : "यहाँ लिखें..."}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-base"
                  />

                  <motion.button
                    onClick={() => handleSendMessage()}
                    className="p-4 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 rounded-full transition-all duration-300 disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="w-6 h-6 text-white" />
                  </motion.button>
                </div>

                {isListening && (
                  <motion.div
                    className="text-center mt-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <p className="text-red-400 text-xl font-bold">🎤 सुन रहा हूं... अब बोलिए</p>
                    <p className="text-gray-400 text-sm mt-1">स्पष्ट आवाज़ में बोलें</p>
                    <div className="flex justify-center mt-3">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-8 bg-red-400 rounded-full"
                            animate={{
                              scaleY: [0.3, 1, 0.3],
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {!voiceSupported && (
                  <div className="text-center mt-2">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Voice feature के लिए Chrome, Firefox या Edge browser का उपयोग करें
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistant;