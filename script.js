// Import Transformers.js from CDN
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Configure environment
env.allowRemoteModels = true;
env.allowLocalModels = false;

// Application state
class ChatApp {
    constructor() {
        this.generator = null;
        this.isGenerating = false;
        this.currentModel = 'Xenova/distilgpt2';
        this.modelLoaded = false;
        this.conversationHistory = [];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }
    
    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chat-messages'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-button'),
            modelSelect: document.getElementById('model-select'),
            loadModelButton: document.getElementById('load-model-button'),
            modelStatus: document.getElementById('model-status'),
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingText: document.getElementById('loading-text'),
            progressFill: document.getElementById('progress-fill')
        };
    }
    
    bindEvents() {
        // Send message events
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input validation
        this.elements.userInput.addEventListener('input', () => {
            const isEmpty = this.elements.userInput.value.trim() === '';
            this.elements.sendButton.disabled = isEmpty || this.isGenerating || !this.modelLoaded;
        });
        
        // Model loading
        this.elements.loadModelButton.addEventListener('click', () => {
            const selectedModel = this.elements.modelSelect.value;
            if (selectedModel !== this.currentModel || !this.modelLoaded) {
                this.loadModel(selectedModel);
            }
        });
        
        // Auto-resize textarea
        this.elements.userInput.addEventListener('input', () => {
            this.elements.userInput.style.height = 'auto';
            this.elements.userInput.style.height = Math.min(this.elements.userInput.scrollHeight, 120) + 'px';
        });
    }
    
    async initializeApp() {
        try {
            this.updateStatus('loading', 'Initializing AI model...');
            await this.loadModel(this.currentModel);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.updateStatus('error', 'Failed to load AI model');
            this.hideLoadingOverlay();
        }
    }
    
    async loadModel(modelName) {
        try {
            this.showLoadingOverlay(`Loading ${this.getModelDisplayName(modelName)}...`);
            this.updateProgress(10);
            
            // Clear previous model
            this.generator = null;
            this.modelLoaded = false;
            
            this.updateLoadingText('Downloading model files...');
            this.updateProgress(30);
            
            // Determine the task based on model
            const task = this.getModelTask(modelName);
            
            // Load the model
            this.generator = await pipeline(task, modelName, {
                progress_callback: (progress) => {
                    if (progress.status === 'downloading') {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        this.updateProgress(30 + (percent * 0.6)); // 30% to 90%
                        this.updateLoadingText(`Downloading: ${percent}%`);
                    } else if (progress.status === 'ready') {
                        this.updateProgress(95);
                        this.updateLoadingText('Initializing model...');
                    }
                }
            });
            
            this.updateProgress(100);
            this.currentModel = modelName;
            this.modelLoaded = true;
            
            // Update UI
            this.updateStatus('ready', `${this.getModelDisplayName(modelName)} ready`);
            this.elements.sendButton.disabled = this.elements.userInput.value.trim() === '';
            
            // Hide loading overlay after a short delay
            setTimeout(() => {
                this.hideLoadingOverlay();
                this.elements.userInput.focus();
            }, 1000);
            
            console.log('Model loaded successfully:', modelName);
            
        } catch (error) {
            console.error('Error loading model:', error);
            this.updateStatus('error', 'Failed to load model');
            this.hideLoadingOverlay();
            
            // Show error message in chat
            this.addMessage('bot', `Sorry, I couldn't load the ${this.getModelDisplayName(modelName)} model. Please try a different model or refresh the page.`);
        }
    }
    
    getModelTask(modelName) {
        // Determine the appropriate task based on model name
        if (modelName.includes('DialoGPT') || modelName.includes('BlenderBot')) {
            return 'conversational';
        } else if (modelName.includes('Instruct') || modelName.includes('chat')) {
            return 'text-generation';
        } else {
            return 'text-generation';
        }
    }
    
    getModelDisplayName(modelName) {
        const displayNames = {
            'Xenova/distilgpt2': 'DistilGPT-2',
            'Xenova/gpt2': 'GPT-2',
            'HuggingFaceTB/SmolLM-135M-Instruct': 'SmolLM-135M',
            'microsoft/DialoGPT-small': 'DialoGPT-Small'
        };
        return displayNames[modelName] || modelName.split('/').pop();
    }
    
    async sendMessage() {
        const userMessage = this.elements.userInput.value.trim();
        if (!userMessage || this.isGenerating || !this.modelLoaded) return;
        
        // Add user message to chat
        this.addMessage('user', userMessage);
        this.elements.userInput.value = '';
        this.elements.userInput.style.height = 'auto';
        
        // Update button state
        this.isGenerating = true;
        this.elements.sendButton.disabled = true;
        
        // Show typing indicator
        const typingId = this.addTypingIndicator();
        
        try {
            // Add to conversation history
            this.conversationHistory.push({ role: 'user', content: userMessage });
            
            // Generate response
            const response = await this.generateResponse(userMessage);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add bot response
            this.addMessage('bot', response);
            this.conversationHistory.push({ role: 'assistant', content: response });
            
            // Keep conversation history manageable
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-8);
            }
            
        } catch (error) {
            console.error('Error generating response:', error);
            this.removeTypingIndicator(typingId);
            this.addMessage('bot', 'Sorry, I encountered an error while processing your message. Please try again.');
        } finally {
            this.isGenerating = false;
            this.elements.sendButton.disabled = false;
            this.elements.userInput.focus();
        }
    }
    
    async generateResponse(userMessage) {
        try {
            let prompt;
            
            // Format prompt based on model type
            if (this.currentModel.includes('Instruct') || this.currentModel.includes('chat')) {
                // For instruction-tuned models
                prompt = this.formatInstructPrompt(userMessage);
            } else if (this.currentModel.includes('DialoGPT')) {
                // For conversational models
                prompt = this.formatConversationPrompt(userMessage);
            } else {
                // For general text generation models
                prompt = this.formatGeneralPrompt(userMessage);
            }
            
            const result = await this.generator(prompt, {
                max_new_tokens: 100,
                temperature: 0.7,
                do_sample: true,
                top_p: 0.9,
                repetition_penalty: 1.1,
                pad_token_id: 50256
            });
            
            let response;
            if (Array.isArray(result)) {
                response = result[0].generated_text || result[0].text || '';
            } else {
                response = result.generated_text || result.text || '';
            }
            
            // Clean up the response
            response = this.cleanResponse(response, prompt);
            
            return response || "I'm not sure how to respond to that. Could you try asking something else?";
            
        } catch (error) {
            console.error('Generation error:', error);
            throw error;
        }
    }
    
    formatInstructPrompt(userMessage) {
        return `Human: ${userMessage}\n\nAssistant:`;
    }
    
    formatConversationPrompt(userMessage) {
        // Build context from recent conversation
        let context = '';
        const recentHistory = this.conversationHistory.slice(-4);
        
        for (const msg of recentHistory) {
            if (msg.role === 'user') {
                context += msg.content + '\n';
            } else {
                context += msg.content + '\n';
            }
        }
        
        return context + userMessage;
    }
    
    formatGeneralPrompt(userMessage) {
        // For general models, provide some context to make it more conversational
        return `This is a friendly conversation between a human and an AI assistant.\n\nHuman: ${userMessage}\n\nAI:`;
    }
    
    cleanResponse(response, prompt) {
        // Remove the prompt from the response
        if (response.startsWith(prompt)) {
            response = response.substring(prompt.length);
        }
        
        // Clean up common artifacts
        response = response
            .replace(/^(AI:|Assistant:|Human:)/i, '')
            .replace(/\n\n.*$/s, '') // Remove extra content after double newlines
            .replace(/\[.*?\]/g, '') // Remove bracketed content
            .trim();
            
        // Remove repetitive patterns
        const sentences = response.split(/[.!?]+/);
        if (sentences.length > 2) {
            // Check for repetition and cut off if found
            const uniqueSentences = [];
            for (const sentence of sentences) {
                const cleanSentence = sentence.trim();
                if (cleanSentence && !uniqueSentences.includes(cleanSentence)) {
                    uniqueSentences.push(cleanSentence);
                }
            }
            response = uniqueSentences.join('. ').trim();
        }
        
        // Ensure response ends properly
        if (response && !response.match(/[.!?]$/)) {
            response += '.';
        }
        
        return response;
    }
    
    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = content;
        messageContent.appendChild(messageParagraph);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messageContent.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);
        
        this.elements.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        return 'typing-indicator';
    }
    
    removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    updateStatus(status, message) {
        this.elements.modelStatus.className = `status ${status}`;
        
        const iconMap = {
            loading: 'fas fa-spinner fa-spin',
            ready: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle'
        };
        
        this.elements.modelStatus.innerHTML = `<i class="${iconMap[status]}"></i> ${message}`;
    }
    
    showLoadingOverlay(message = 'Loading...') {
        this.elements.loadingOverlay.classList.remove('hidden');
        this.updateLoadingText(message);
        this.updateProgress(0);
    }
    
    hideLoadingOverlay() {
        this.elements.loadingOverlay.classList.add('hidden');
    }
    
    updateLoadingText(text) {
        this.elements.loadingText.textContent = text;
    }
    
    updateProgress(percent) {
        this.elements.progressFill.style.width = `${percent}%`;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

// Handle visibility change to pause/resume when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Tab is hidden, pausing operations');
    } else {
        console.log('Tab is visible, resuming operations');
    }
});

// Service worker registration for offline capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}