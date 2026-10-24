/**
 * AESTHETIC GLASSMORPHISM CALCULATOR ENGINE
 * Features:
 * - Real-time calculation preview
 * - Robust PEMDAS mathematical evaluation (No raw eval security risk)
 * - Safe floating-point normalization (Fixes 0.1 + 0.2 = 0.3)
 * - Keyboard support with synchronized on-screen tactile animations
 * - Multi-theme switcher with LocalStorage persistence
 * - Audio feedback via Web Audio API synth
 * - Calculation history drawer with restore capability
 * - Clipboard copy & toast notifications
 */

class Calculator {
  constructor() {
    // State
    this.currentInput = '0';
    this.expression = '';
    this.lastEvaluated = false;
    this.soundEnabled = true;
    this.history = [];

    // DOM Elements
    this.mainDisplay = document.getElementById('mainDisplay');
    this.expressionDisplay = document.getElementById('expressionDisplay');
    this.previewDisplay = document.getElementById('previewDisplay');
    this.livePreviewWrapper = document.querySelector('.live-preview-wrapper');
    this.btnAc = document.getElementById('btn-ac');
    this.toast = document.getElementById('toast');
    this.historyPanel = document.getElementById('historyPanel');
    this.historyList = document.getElementById('historyList');
    this.themeMenu = document.getElementById('themeMenu');

    // Web Audio Context for synthesized tactile clicks
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.loadPreferences();
    this.bindEvents();
    this.updateDisplay();
  }

  // ------------------------------------------------------------------------
  // Preferences (Theme, Sound, History)
  // ------------------------------------------------------------------------
  loadPreferences() {
    // Theme
    const savedTheme = localStorage.getItem('calc_theme') || 'kitten';
    this.applyTheme(savedTheme);

    // Sound
    const savedSound = localStorage.getItem('calc_sound');
    if (savedSound !== null) {
      this.soundEnabled = savedSound === 'true';
      this.updateSoundIcon();
    }

    // History
    try {
      const savedHistory = localStorage.getItem('calc_history');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
        this.renderHistory();
      }
    } catch (e) {
      this.history = [];
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calc_theme', theme);

    // Update active check in menu
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  // ------------------------------------------------------------------------
  // Event Listeners (Clicks & Keyboard)
  // ------------------------------------------------------------------------
  bindEvents() {
    // Keypad clicks (event delegation)
    const keypad = document.querySelector('.keypad-grid');
    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const val = btn.dataset.val;

      this.triggerHaptic(btn);
      this.handleAction(action, val);
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Theme selector
    const themeBtn = document.getElementById('themeDropdownBtn');
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.themeMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        this.applyTheme(theme);
        this.themeMenu.classList.add('hidden');
        if (theme === 'kitten') {
          this.playSound('meow');
        }
        this.showToast(`Theme changed: ${opt.innerText.trim()}`);
      });
    });

    // Cute Kitten Mascot Interactive Click
    const kittenMascot = document.getElementById('kittenMascot');
    if (kittenMascot) {
      kittenMascot.addEventListener('click', () => {
        this.playSound('meow');
        kittenMascot.style.transform = 'scale(1.4) rotate(18deg)';
        setTimeout(() => {
          kittenMascot.style.transform = '';
        }, 320);
        const meowPhrases = [
          'Meow! 🐱🐾',
          'Purrrr~ 💕',
          'Nya! ✨🐾',
          'Pawsome calculating! 🐾',
          'Cutest math ever! 🎀🐱'
        ];
        const randomPhrase = meowPhrases[Math.floor(Math.random() * meowPhrases.length)];
        this.showToast(randomPhrase);
      });
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-dropdown-wrapper')) {
        this.themeMenu.classList.add('hidden');
      }
    });

    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('calc_sound', this.soundEnabled);
      this.updateSoundIcon();
      this.playSound('click');
      this.showToast(this.soundEnabled ? 'Audio feedback: ON' : 'Audio feedback: OFF');
    });

    // History toggle & panel actions
    document.getElementById('historyToggle').addEventListener('click', () => {
      this.historyPanel.classList.remove('hidden');
      this.renderHistory();
    });

    document.getElementById('closeHistoryBtn').addEventListener('click', () => {
      this.historyPanel.classList.add('hidden');
    });

    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
      this.history = [];
      localStorage.removeItem('calc_history');
      this.renderHistory();
      this.showToast('History cleared');
    });

    // Copy to clipboard
    document.getElementById('copyBtn').addEventListener('click', () => {
      this.copyCurrentResult();
    });
  }

  // ------------------------------------------------------------------------
  // Keyboard Handler with Visual Key Synchronization
  // ------------------------------------------------------------------------
  handleKeyboard(e) {
    // Prevent default scrolling / quick find for keys like '/', 'Enter', 'Space'
    if (['/', '*', '+', '-', 'Enter', ' ', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }

    const key = e.key;

    // Digits 0-9
    if (/^[0-9]$/.test(key)) {
      this.flashButton(key);
      this.inputNumber(key);
      return;
    }

    // Decimal point
    if (key === '.' || key === ',') {
      this.flashButton('.');
      this.inputDecimal();
      return;
    }

    // Operators
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      this.flashButton(key);
      this.inputOperator(key);
      return;
    }

    // Equals / Enter
    if (key === 'Enter' || key === '=') {
      this.flashButton('Enter');
      this.calculate();
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      this.flashButton('Backspace');
      this.deleteLast();
      return;
    }

    // Escape / Clear
    if (key === 'Escape' || key.toLowerCase() === 'c') {
      this.flashButton('Escape');
      this.allClear();
      return;
    }
  }

  // Visual synchronization: physically lights up the on-screen button
  flashButton(keyIdentifier) {
    const selector = `[data-key="${keyIdentifier}"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('is-pressed');
      this.playSound(btn.dataset.action || 'click');
      setTimeout(() => btn.classList.remove('is-pressed'), 140);
    }
  }

  triggerHaptic(btn) {
    this.playSound(btn.dataset.action || 'click');
  }

  // ------------------------------------------------------------------------
  // Web Audio Synthesizer (Realistic Tactile Feedback)
  // ------------------------------------------------------------------------
  playSound(type) {
    if (!this.soundEnabled) return;

    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      const currentTheme = document.documentElement.getAttribute('data-theme');

      // Adorable custom sound effects for Cute Kitten theme!
      if (currentTheme === 'kitten') {
        if (type === 'calculate' || type === 'meow') {
          // Playful kitten "mew" chime with soft harmonic glide
          const osc1 = this.audioCtx.createOscillator();
          const gain1 = this.audioCtx.createGain();
          osc1.connect(gain1);
          gain1.connect(this.audioCtx.destination);

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now); // D5
          osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5 rise
          osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.28); // E5 gentle descend

          gain1.gain.setValueAtTime(0.09, now);
          gain1.gain.linearRampToValueAtTime(0.12, now + 0.1);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

          osc1.start(now);
          osc1.stop(now + 0.32);
          return;
        }

        // Sweet soft paws tactile click
        let freq = 659.25; // E5
        let duration = 0.055;

        if (type === 'secondary') freq = 880;
        else if (type === 'operator') freq = 783.99; // G5
        else if (type === 'all-clear' || type === 'delete') freq = 440; // A4 purr drop

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.88, now + duration);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration);
        return;
      }

      let freq = 450;
      let duration = 0.04;

      if (type === 'secondary') {
        freq = 880;
        duration = 0.07;
      } else if (type === 'operator') freq = 560;
      else if (type === 'calculate') freq = 720;
      else if (type === 'all-clear' || type === 'delete') freq = 340;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio context might fail silently if autoplay policy blocked
    }
  }

  updateSoundIcon() {
    const soundOn = document.querySelector('.sound-on');
    const soundOff = document.querySelector('.sound-off');
    if (soundOn && soundOff) {
      soundOn.classList.toggle('hidden', !this.soundEnabled);
      soundOff.classList.toggle('hidden', this.soundEnabled);
    }
  }

  // ------------------------------------------------------------------------
  // Core Calculator Logic
  // ------------------------------------------------------------------------
  handleAction(action, val) {
    switch (action) {
      case 'number':
        this.inputNumber(val);
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'operator':
        this.inputOperator(val);
        break;
      case 'calculate':
        this.calculate();
        break;
      case 'delete':
        this.deleteLast();
        break;
      case 'all-clear':
        this.allClear();
        break;
    }
  }

  inputNumber(num) {
    if (this.lastEvaluated) {
      this.currentInput = num;
      this.expression = '';
      this.lastEvaluated = false;
    } else {
      if (this.currentInput === '0' || this.currentInput === 'Error') {
        this.currentInput = num;
      } else {
        this.currentInput += num;
      }
    }
    this.updateDisplay();
  }

  inputDecimal() {
    if (this.lastEvaluated) {
      this.currentInput = '0.';
      this.expression = '';
      this.lastEvaluated = false;
      this.updateDisplay();
      return;
    }

    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
      this.updateDisplay();
    }
  }

  inputOperator(op) {
    if (this.currentInput === 'Error') {
      this.allClear();
      return;
    }

    if (this.lastEvaluated) {
      this.expression = `${this.currentInput} ${this.formatOperator(op)} `;
      this.currentInput = '0';
      this.lastEvaluated = false;
      this.updateDisplay();
      return;
    }

    const trimmedExpr = this.expression.trim();
    const endsWithOp = /[+\-×÷/*]$/.test(trimmedExpr);

    if (this.currentInput === '0' && endsWithOp) {
      // Replace the previous operator if user taps a different one
      this.expression = trimmedExpr.slice(0, -1).trim() + ` ${this.formatOperator(op)} `;
    } else {
      this.expression += `${this.currentInput} ${this.formatOperator(op)} `;
      this.currentInput = '0';
    }

    this.updateDisplay();
  }

  deleteLast() {
    if (this.lastEvaluated) {
      this.allClear();
      return;
    }

    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
      if (this.currentInput === '-') this.currentInput = '0';
    } else {
      this.currentInput = '0';
    }
    this.updateDisplay();
  }

  allClear() {
    this.currentInput = '0';
    this.expression = '';
    this.lastEvaluated = false;
    this.updateDisplay();
  }

  // ------------------------------------------------------------------------
  // Real-Time Evaluation & Calculation Engine (Basic PEMDAS: +, -, *, /)
  // ------------------------------------------------------------------------
  calculate() {
    if (this.currentInput === 'Error') return;

    let fullExpr = this.expression;
    if (this.currentInput !== '0' || !/[+\-×÷/*]$/.test(this.expression.trim())) {
      fullExpr += this.currentInput;
    }

    const sanitized = this.normalizeExpression(fullExpr);
    if (!sanitized) return;

    const result = this.safeEvaluate(sanitized);

    if (result === null || isNaN(result) || !isFinite(result)) {
      this.currentInput = 'Error';
      this.expression = '';
      this.lastEvaluated = true;
      this.updateDisplay();
      this.showToast('Error: Division by zero');
      return;
    }

    const formattedResult = this.formatNumber(result);

    // Save to calculation history
    this.pushHistory(fullExpr, formattedResult);

    this.expression = '';
    this.currentInput = formattedResult;
    this.lastEvaluated = true;
    this.updateDisplay();
  }

  getRealtimePreview() {
    if (this.currentInput === 'Error') return '';
    if (!this.expression.trim()) return '';

    let candidate = this.expression + (this.currentInput !== '0' || !/[+\-×÷/*]$/.test(this.expression.trim()) ? this.currentInput : '');

    const sanitized = this.normalizeExpression(candidate);
    if (!sanitized) return '';
    if (/[+\-*/]$/.test(sanitized.trim())) return '';

    const result = this.safeEvaluate(sanitized);
    if (result !== null && !isNaN(result) && isFinite(result)) {
      return this.formatNumber(result);
    }
    return '';
  }

  safeEvaluate(exprStr) {
    try {
      // Tokenize numbers and operators (+, -, *, /)
      const tokens = exprStr.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
      if (!tokens) return null;

      // Handle leading negative numbers or unary minus
      const sanitizedTokens = [];
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === '-' && (i === 0 || ['+', '-', '*', '/'].includes(tokens[i - 1]))) {
          if (i + 1 < tokens.length && !isNaN(tokens[i + 1])) {
            sanitizedTokens.push(`-${tokens[i + 1]}`);
            i++;
            continue;
          }
        }
        sanitizedTokens.push(token);
      }

      // Shunting-yard algorithm for +, -, *, /
      const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
      const outputQueue = [];
      const opStack = [];

      for (const token of sanitizedTokens) {
        if (!isNaN(parseFloat(token))) {
          outputQueue.push(parseFloat(token));
        } else if (token in precedence) {
          while (
            opStack.length &&
            opStack[opStack.length - 1] in precedence &&
            precedence[opStack[opStack.length - 1]] >= precedence[token]
          ) {
            outputQueue.push(opStack.pop());
          }
          opStack.push(token);
        }
      }

      while (opStack.length) {
        outputQueue.push(opStack.pop());
      }

      // Evaluate Postfix (RPN) stack
      const evalStack = [];
      for (const token of outputQueue) {
        if (typeof token === 'number') {
          evalStack.push(token);
        } else {
          const b = evalStack.pop();
          const a = evalStack.pop();
          if (a === undefined || b === undefined) return null;

          let res = 0;
          switch (token) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
              if (b === 0) return null; // Divide by zero protection
              res = a / b;
              break;
          }
          evalStack.push(res);
        }
      }

      return evalStack.length === 1 ? evalStack[0] : null;
    } catch (e) {
      return null;
    }
  }

  normalizeExpression(str) {
    return str
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\s+/g, '');
  }

  formatOperator(op) {
    switch (op) {
      case '*': return '×';
      case '/': return '÷';
      case '-': return '−';
      case '+': return '+';
      default: return op;
    }
  }

  formatNumber(num) {
    if (isNaN(num)) return 'Error';
    const rounded = Number(Math.round(num + 'e12') + 'e-12');
    const str = rounded.toString();
    if (str.length > 12) {
      return rounded.toPrecision(8).replace(/\.?0+$/, '');
    }
    return str;
  }

  // ------------------------------------------------------------------------
  // UI Display Synchronization
  // ------------------------------------------------------------------------
  updateDisplay() {
    // 1. Main Display
    this.mainDisplay.value = this.currentInput;

    // 2. Expression Line
    this.expressionDisplay.textContent = this.expression;

    // 3. Dynamic AC / C Label
    const mainSym = this.btnAc.querySelector('.main-symbol') || this.btnAc;
    if (this.currentInput !== '0' && !this.lastEvaluated) {
      mainSym.textContent = 'C';
    } else {
      mainSym.textContent = 'AC';
    }

    // 4. Real-time Live Preview
    const preview = this.getRealtimePreview();
    if (preview && preview !== this.currentInput) {
      this.previewDisplay.textContent = preview;
      this.livePreviewWrapper.classList.remove('is-inactive');
    } else {
      this.livePreviewWrapper.classList.add('is-inactive');
    }

    // Auto-scroll expression if long
    this.expressionDisplay.parentElement.scrollLeft = this.expressionDisplay.parentElement.scrollWidth;
  }

  // ------------------------------------------------------------------------
  // History & Utilities
  // ------------------------------------------------------------------------
  pushHistory(expr, result) {
    const item = {
      id: Date.now(),
      expression: expr,
      result: result,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.history.unshift(item);
    if (this.history.length > 30) this.history.pop();

    localStorage.setItem('calc_history', JSON.stringify(this.history));
  }

  renderHistory() {
    if (!this.history.length) {
      this.historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
      return;
    }

    this.historyList.innerHTML = this.history.map(item => `
      <div class="history-item" data-res="${item.result}" title="Click to use result">
        <div class="history-item-exp">${item.expression} =</div>
        <div class="history-item-res">${item.result}</div>
      </div>
    `).join('');

    // Clicking a history item restores the result onto the calculator
    this.historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const res = el.getAttribute('data-res');
        this.currentInput = res;
        this.expression = '';
        this.lastEvaluated = false;
        this.updateDisplay();
        this.historyPanel.classList.add('hidden');
        this.showToast(`Restored: ${res}`);
      });
    });
  }

  copyCurrentResult() {
    const val = this.mainDisplay.value;
    if (!val || val === 'Error') return;

    navigator.clipboard.writeText(val).then(() => {
      this.showToast(`Copied ${val} to clipboard!`);
    }).catch(() => {
      // Fallback
      const input = document.createElement('textarea');
      input.value = val;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.showToast(`Copied ${val} to clipboard!`);
    });
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.add('hidden');
    }, 2200);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});
