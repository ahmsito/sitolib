import { EventEmitter } from 'events';
import { hostname } from 'os';

export class Core extends EventEmitter {
  static instance = null;

  static getInstance() {
    if (!Core.instance) {
      Core.instance = new Core();
    }
    return Core.instance;
  }

  constructor() {
    super();
    this.writeQueue = [];
    this.startProps = null;
    this.pauseConsole = false;
    this.headerPrintedLast = false;
    this.colorRotation = 0;
    this.colorRotationStart = 0;
    this.processing = false;
  }

  start(startProps = {}) {
    // Only clear screen if this is the first start
    if (!this.startProps) {
      process.stdout.write('\x1Bc');
    }
    
    this.startProps = {
      username: startProps.username || process.env.USER || process.env.USERNAME || 'user',
      host: startProps.host || hostname(),
      logoString: startProps.logoString || null,
      version: startProps.version || null,
      motd: startProps.motd || null,
      author: startProps.author || {},
      silentStart: startProps.silentStart || true,
      debugMode: startProps.debugMode || false,
      colorRotation: startProps.colorRotation || 0,
      colorRotationOffset: startProps.colorRotationOffset || 5,
      showNextLine: startProps.showNextLine || false,
      userColor: startProps.userColor || '#0354cc',
      hostColor: startProps.hostColor || '#6407f7'
    };

    this.colorRotation = this.startProps.colorRotation;
    this.colorRotationStart = this.startProps.colorRotation;

    this.printLogo();
    
    if (!this.processing) {
      this.startWorkLoop();
    }

    if (!this.startProps.silentStart) {
      this.writeLine({ label: { text: 'ok' } }, 'Core initialized');
    }
  }

  clear() {
    this.writeQueue = [];
    this.colorRotation = this.colorRotationStart;
    console.clear();
    this.printLogo();
    this.emit('clear');
  }

  printLogo() {
    if (this.startProps?.logoString) {
      const lines = this.startProps.logoString.split('\n');
      lines.forEach(line => {
        this.writeLine({ label: { show: false }, time: { show: false }, verticalRainbow: true, center: true }, line);
      });
    }

    if (this.startProps?.author?.name) {
      this.writeLine({ label: { show: false }, time: { show: false }, horizontalRainbow: true, center: true }, ` > Made by ${this.startProps.author.name}`);
    }

    if (this.startProps?.author?.url) {
      this.writeLine({ label: { show: false }, time: { show: false }, horizontalRainbow: true, center: true }, ` > Author URL: ${this.startProps.author.url}`);
    }

    if (this.startProps?.version) {
      this.writeLine({ label: { show: false }, time: { show: false }, horizontalRainbow: true, center: true }, ` > Version ${this.startProps.version}`);
    }

    if (this.startProps?.debugMode) {
      this.writeLine({ label: { show: false }, time: { show: false }, horizontalRainbow: true, center: true }, ' > Debug mode enabled');
    }

    this.writeLine({ label: { show: false }, time: { show: false } });

    if (this.startProps?.motd) {
      this.printMOTD();
    }
  }

  printMOTD() {
    const divider = '═'.repeat(60);
    const halfDiv = divider.substring(0, Math.round(divider.length / 2));
    
    this.writeLine({ horizontalRainbow: true, label: { show: false }, time: { show: false }, center: true }, `${halfDiv} MOTD ${halfDiv}`);
    this.writeLine({ label: { show: false }, time: { show: false } });
    this.writeLine({ label: { show: false }, time: { show: false }, center: true }, this.startProps.motd);
    this.writeLine({ label: { show: false }, time: { show: false } });
    this.writeLine({ horizontalRainbow: true, label: { show: false }, time: { show: false }, center: true }, `${halfDiv} MOTD ${halfDiv}`);
    this.writeLine({ label: { show: false }, time: { show: false } });
  }

  createAlert(title, color, ...lines) {
    const divider = '═'.repeat(60);
    const halfDiv = divider.substring(0, Math.round(divider.length / 2));
    
    this.writeLine({ label: { show: false }, time: { show: false }, center: true }, color, `${halfDiv} ${title} ${halfDiv}`);
    this.writeLine({ label: { show: false }, time: { show: false } });
    lines.forEach(line => {
      this.writeLine({ label: { show: false }, time: { show: false }, center: true }, line);
    });
    this.writeLine({ label: { show: false }, time: { show: false } });
    this.writeLine({ label: { show: false }, time: { show: false }, center: true }, color, `${halfDiv} ${title} ${halfDiv}`);
    this.writeLine({ label: { show: false }, time: { show: false } });
  }

  writeLine(props = {}, ...messages) {
    if (arguments.length === 0 || (Object.keys(props).length === 0 && messages.length === 0)) {
      this.writeQueue.push({
        time: { show: false },
        label: { show: false },
        coloringGroups: [[null, '']],
        horizontalRainbow: false,
        verticalRainbow: false,
        center: false,
        showHeaderAfter: false
      });
      return;
    }
    
    const msgProps = this._parseMessageProps(props, messages);
    this.writeQueue.push(msgProps);
    this.emit('itemAdded', msgProps);
  }

  _parseMessageProps(props, messages) {
    const defaults = {
      time: { show: true, text: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      label: { show: true, text: 'info', color: null },
      coloringGroups: [],
      horizontalRainbow: props.horizontalRainbow || false,
      verticalRainbow: props.verticalRainbow || false,
      center: props.center || false,
      showHeaderAfter: props.showHeaderAfter || false
    };

    if (props.time !== undefined) {
      if (props.time === null || (typeof props.time === 'object' && props.time.show === false)) {
        defaults.time.show = false;
      } else if (typeof props.time === 'object') {
        defaults.time = { ...defaults.time, ...props.time };
      }
    }

    if (props.label !== undefined) {
      if (props.label === null || (typeof props.label === 'object' && props.label.show === false)) {
        defaults.label.show = false;
      } else if (typeof props.label === 'object') {
        defaults.label = { ...defaults.label, ...props.label };
        if (props.label.text) {
          defaults.label = this._autoFormatLabel(defaults.label);
        }
      }
    }

    let currentColor = '#c8c8c8';
    messages.forEach(msg => {
      if (typeof msg === 'string' && msg.startsWith('#') && msg.length === 7) {
        currentColor = msg;
      } else if (typeof msg === 'string') {
        defaults.coloringGroups.push([currentColor, msg]);
      }
    });

    return defaults;
  }

  _autoFormatLabel(label) {
    const labelMap = {
      ok: { color: '#00ff00', text: '  OK  ' },
      success: { color: '#00ff00', text: '  OK  ' },
      work: { color: '#ffff00', text: ' WORK ' },
      working: { color: '#ffff00', text: ' WORK ' },
      fail: { color: '#ff0000', text: ' FAIL ' },
      failure: { color: '#ff0000', text: ' FAIL ' },
      info: { color: '#00ffff', text: ' INFO ' },
      general: { color: '#00ffff', text: ' INFO ' },
      skip: { color: '#ffff00', text: ' SKIP ' },
      conf: { color: '#008b8b', text: ' CONF ' },
      help: { color: '#006400', text: ' HELP ' }
    };

    const key = label.text.toLowerCase();
    if (labelMap[key]) {
      return { ...label, ...labelMap[key], text: labelMap[key].text.toUpperCase() };
    }
    return label;
  }

  startWorkLoop() {
    this.processing = true;
    setImmediate(() => this._workLoop());
  }

  _workLoop() {
    if (!this.processing) return;

    if (this.writeQueue.length > 0 && !this.pauseConsole) {
      const props = this.writeQueue.shift();
      this._processWrite(props);
      this.emit('itemFinished', props);
    }

    setImmediate(() => this._workLoop());
  }

  _processWrite(props) {
    let output = '';

    if (props.time?.show) {
      const timeColor = this._hsvToRgb(this.colorRotation, 1, 1);
      output += `[${this._colorize(props.time.text, timeColor)}] `;
    }

    if (props.center) {
      const totalLen = props.coloringGroups.reduce((sum, grp) => sum + grp[1].length, 0);
      const padding = Math.round((process.stdout.columns / 2) - (totalLen / 2));
      output += ' '.repeat(Math.max(0, padding));
    }

    if (props.horizontalRainbow) {
      const text = props.coloringGroups.map(g => g[1]).join('');
      text.split('').forEach(char => {
        const color = this._hsvToRgb(this.colorRotation, 1, 1);
        output += this._colorize(char, color);
        this.colorRotation++;
      });
    } else if (props.verticalRainbow) {
      const text = props.coloringGroups.map(g => g[1]).join('');
      const color = this._hsvToRgb(this.colorRotation, 1, 1);
      output += this._colorize(text, color);
    } else {
      props.coloringGroups.forEach(([color, text]) => {
        if (color === 'rainbow') {
          const rainbowColor = this._hsvToRgb(this.colorRotation, 1, 1);
          output += this._colorize(text, rainbowColor);
        } else {
          output += this._colorize(text, color);
        }
      });
    }

    if (props.label?.show) {
      const remaining = process.stdout.columns - this._stripAnsi(output).length - props.label.text.length - 4;
      output += ' '.repeat(Math.max(0, remaining));
      output += ` [${this._colorize(props.label.text, props.label.color)}]`;
    }

    console.log(output);

    this.colorRotation += this.startProps?.colorRotationOffset || 5;
    if (this.colorRotation >= 360) this.colorRotation = 0;
  }

  _colorize(text, color) {
    if (!color) return text;
    const rgb = this._hexToRgb(color);
    return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`;
  }

  _hexToRgb(hex) {
    if (typeof hex === 'object') return hex;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 200, g: 200, b: 200 };
  }

  _hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r, g, b;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  _stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  delay(ms) {
    return new Promise(resolve => {
      const check = () => {
        if (this.writeQueue.length === 0) {
          setTimeout(resolve, ms);
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }

  async readLine(prompt = '') {
    const readline = await import('readline');
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(prompt, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }
}
