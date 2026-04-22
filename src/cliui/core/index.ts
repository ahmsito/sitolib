/**
 * Core CLI UI System
 * Provides colorful logging, rainbow text, and event-driven message queue processing
 * @module core
 */

import { EventEmitter } from 'events';
import { hostname } from 'os';
import { execSync } from 'child_process';

/**
 * Configuration options for starting the Core system
 */
interface StartProps {
  /** Username to display (defaults to system user) */
  username?: string;

  /** Hostname to display (defaults to system hostname) */
  host?: string;
  
  /** ASCII art logo string */
  logoString?: string | null;
  
  /** Version string to display */
  version?: string | null;
  
  /** Message of the day */
  motd?: string | null;
  
  /** Author information */
  author?: {
    name?: string;
    url?: string;
  };
  
  /** Suppress initialization message */
  silentStart?: boolean;
  
  /** Enable debug mode */
  debugMode?: boolean;
  
  /** Starting hue for rainbow colors (0-360) */
  colorRotation?: number;
  
  /** Hue increment for rainbow effect */
  colorRotationOffset?: number;
  
  /** Show next line indicator */
  showNextLine?: boolean;
  
  /** Color for username display */
  userColor?: string;
  
  /** Color for hostname display */
  hostColor?: string;
}

/**
 * Time display configuration
 */
interface TimeConfig {
  /** Whether to show the timestamp */
  show: boolean;
  
  /** Custom time text (auto-generated if not provided) */
  text?: string;
}

/**
 * Label display configuration
 */
interface LabelConfig {
  /** Whether to show the label */
  show: boolean;
  
  /** Label text (e.g., 'ok', 'fail', 'info') */
  text?: string;
  
  /** Label color (hex format) */
  color?: string | null;
}

/**
 * Properties for writing a line to the console
 */
interface WriteLineProps {
  /** Time configuration */
  time?: TimeConfig | null;
  
  /** Label configuration */
  label?: LabelConfig | null;
  
  /** Apply horizontal rainbow effect */
  horizontalRainbow?: boolean;
  
  /** Apply vertical rainbow effect */
  verticalRainbow?: boolean;
  
  /** Center the text */
  center?: boolean;
  
  /** Show header after this line */
  showHeaderAfter?: boolean;
}

/**
 * Internal message properties for queue processing
 */
interface MessageProps {
  time: TimeConfig;
  label: LabelConfig;
  coloringGroups: Array<[string | null, string]>;
  horizontalRainbow: boolean;
  verticalRainbow: boolean;
  center: boolean;
  showHeaderAfter: boolean;
}

/**
 * RGB color representation
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Core CLI UI system
 * Uses event-driven queue processing for efficient output
 */
export class Core extends EventEmitter {
  private writeQueue: MessageProps[] = [];
  private startProps: Required<StartProps> | null = null;
  private pauseConsole = false;
  private colorRotation = 0;
  private colorRotationStart = 0;
  private processing = false;

  /**
   * Creates a new Core instance
   * Sets up event-driven queue processing
   */
  constructor() {
    super();
    
    // Event-driven queue processing - only runs when items are added
    this.on('itemAdded', () => {
      if (!this.processing && !this.pauseConsole) {
        this._processQueue();
      }
    });
  }

  /**
   * Initializes the Core system
   * Clears screen, displays logo, and sets up configuration
   * @param startProps - Configuration options
   */
  start(startProps: StartProps = {}): void {
    // Only clear screen on first start
    if (!this.startProps) {
      this._clearScreen();
    }
    
    this.startProps = {
      username: startProps.username || process.env.USER || process.env.USERNAME || 'user',
      host: startProps.host || hostname(),
      logoString: startProps.logoString || null,
      version: startProps.version || null,
      motd: startProps.motd || null,
      author: startProps.author || {},
      silentStart: startProps.silentStart ?? true,
      debugMode: startProps.debugMode ?? false,
      colorRotation: startProps.colorRotation ?? 0,
      colorRotationOffset: startProps.colorRotationOffset ?? 5,
      showNextLine: startProps.showNextLine ?? false,
      userColor: startProps.userColor || '#0354cc',
      hostColor: startProps.hostColor || '#6407f7'
    };

    this.colorRotation = this.startProps.colorRotation;
    this.colorRotationStart = this.startProps.colorRotation;

    this.printLogo();

    if (!this.startProps.silentStart) {
      this.writeLine({ label: { show: true, text: 'ok' } }, 'Core initialized');
    }
  }

  /**
   * Clears the terminal screen using portable methods
   * Uses tput on Unix systems, ANSI escape codes on Windows
   * @private
   */
  private _clearScreen(): void {
    if (process.stdout.isTTY) {
      if (process.platform !== 'win32') {
        // Unix/Linux/macOS: Use tput to query terminfo database
        try {
          const clearSeq = execSync('tput clear', { 
            encoding: 'utf8', 
            stdio: ['pipe', 'pipe', 'ignore'] 
          });
          process.stdout.write(clearSeq);
          return;
        } catch (err) {
          // Fall through to ANSI codes
        }
      }
      
      // Windows or tput failed: Use ANSI escape codes
      // \x1b[2J clears screen, \x1b[3J clears scrollback, \x1b[H moves cursor to home
      process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
    } else {
      // Non-TTY: use console.clear
      console.clear();
    }
  }

  /**
   * Clears the screen and reprints the logo
   * Resets the message queue
   */
  clear(): void {
    this.writeQueue = [];
    this.colorRotation = this.colorRotationStart;
    this._clearScreen();
    this.printLogo();
    this.emit('clear');
  }

  /**
   * Prints the logo and startup information
   * Includes ASCII art, author info, version, and MOTD
   */
  printLogo(): void {
    if (this.startProps?.logoString) {
      const lines = this.startProps.logoString.split('\n');
      lines.forEach(line => {
        this.writeLine({ 
          label: { show: false }, 
          time: { show: false }, 
          verticalRainbow: true, 
          center: true 
        }, line);
      });
    }

    if (this.startProps?.author?.name) {
      this.writeLine({ 
        label: { show: false }, 
        time: { show: false }, 
        horizontalRainbow: true, 
        center: true 
      }, ` > Made by ${this.startProps.author.name}`);
    }

    if (this.startProps?.author?.url) {
      this.writeLine({ 
        label: { show: false }, 
        time: { show: false }, 
        horizontalRainbow: true, 
        center: true 
      }, ` > Author URL: ${this.startProps.author.url}`);
    }

    if (this.startProps?.version) {
      this.writeLine({ 
        label: { show: false }, 
        time: { show: false }, 
        horizontalRainbow: true, 
        center: true 
      }, ` > Version ${this.startProps.version}`);
    }

    if (this.startProps?.debugMode) {
      this.writeLine({ 
        label: { show: false }, 
        time: { show: false }, 
        horizontalRainbow: true, 
        center: true 
      }, ' > Debug mode enabled');
    }

    this.writeLine({ label: { show: false }, time: { show: false } });

    if (this.startProps?.motd) {
      this.printMOTD();
    }
  }

  /**
   * Prints the Message of the Day with decorative borders
   */
  printMOTD(): void {
    const divider = '═'.repeat(60);
    const halfDiv = divider.substring(0, Math.round(divider.length / 2));
    
    this.writeLine({ 
      horizontalRainbow: true, 
      label: { show: false }, 
      time: { show: false }, 
      center: true 
    }, `${halfDiv} MOTD ${halfDiv}`);
    
    this.writeLine({ label: { show: false }, time: { show: false } });
    this.writeLine({ 
      label: { show: false }, 
      time: { show: false }, 
      center: true 
    }, this.startProps!.motd!);
    
    this.writeLine({ label: { show: false }, time: { show: false } });
    this.writeLine({ 
      horizontalRainbow: true, 
      label: { show: false }, 
      time: { show: false }, 
      center: true 
    }, `${halfDiv} MOTD ${halfDiv}`);
    
    this.writeLine({ label: { show: false }, time: { show: false } });
  }

  /**
   * Creates a styled alert box with title and content
   * @param title - Alert title
   * @param color - Title color (hex format)
   * @param lines - Alert content lines
   */
  createAlert(title: string, color: string, ...lines: string[]): void {
    const divider = '═'.repeat(60);
    const halfDiv = divider.substring(0, Math.round(divider.length / 2));
    
    this.writeLine({ 
      label: { show: false }, 
      time: { show: false }, 
      center: true 
    }, color, `${halfDiv} ${title} ${halfDiv}`);
    
    this.writeLine({ label: { show: false }, time: { show: false } });
    
    lines.forEach(line => {
      this.writeLine({ 
        label: { show: false }, 
        time: { show: false }, 
        center: true 
      }, line);
    });
    
    this.writeLine({ label: { show: false }, time: { show: false } });
    this.writeLine({ 
      label: { show: false }, 
      time: { show: false }, 
      center: true 
    }, color, `${halfDiv} ${title} ${halfDiv}`);
    
    this.writeLine({ label: { show: false }, time: { show: false } });
  }

  /**
   * Writes a line to the console with optional formatting
   * Supports colors, labels, timestamps, and rainbow effects
   * 
   * @param props - Line formatting properties
   * @param messages - Text and color values to display
   */
  writeLine(props: WriteLineProps = {}, ...messages: string[]): void {
    // Empty line
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

  /**
   * Parses message properties and formats them for processing
   * @param props - User-provided properties
   * @param messages - Message strings and colors
   * @returns Formatted message properties
   * @private
   */
  private _parseMessageProps(props: WriteLineProps, messages: string[]): MessageProps {
    const defaults: MessageProps = {
      time: { 
        show: true, 
        text: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }) 
      },
      label: { show: true, text: 'info', color: null },
      coloringGroups: [],
      horizontalRainbow: props.horizontalRainbow || false,
      verticalRainbow: props.verticalRainbow || false,
      center: props.center || false,
      showHeaderAfter: props.showHeaderAfter || false
    };

    // Parse time configuration
    if (props.time !== undefined) {
      if (props.time === null || (typeof props.time === 'object' && props.time.show === false)) {
        defaults.time.show = false;
      } else if (typeof props.time === 'object') {
        defaults.time = { ...defaults.time, ...props.time };
      }
    }

    // Parse label configuration
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

    // Parse color groups (hex colors followed by text)
    let currentColor: string | null = '#c8c8c8';
    messages.forEach(msg => {
      if (typeof msg === 'string' && msg.startsWith('#') && msg.length === 7) {
        currentColor = msg;
      } else if (typeof msg === 'string') {
        defaults.coloringGroups.push([currentColor, msg]);
      }
    });

    return defaults;
  }

  /**
   * Auto-formats common label types with predefined colors
   * @param label - Label configuration
   * @returns Formatted label with color and text
   * @private
   */
  private _autoFormatLabel(label: LabelConfig): LabelConfig {
    const labelMap: Record<string, { color: string; text: string }> = {
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

    const key = label.text?.toLowerCase() || '';
    if (labelMap[key]) {
      return { ...label, ...labelMap[key], text: labelMap[key].text.toUpperCase() };
    }
    return label;
  }

  /**
   * Processes the message queue
   * Event-driven - only runs when items are added
   * @private
   */
  private _processQueue(): void {
    if (this.processing || this.pauseConsole || this.writeQueue.length === 0) {
      return;
    }

    this.processing = true;
    
    while (this.writeQueue.length > 0 && !this.pauseConsole) {
      const props = this.writeQueue.shift()!;
      this._processWrite(props);
      this.emit('itemFinished', props);
    }
    
    this.processing = false;
  }

  /**
   * Processes and writes a single message to the console
   * Handles colors, centering, labels, and rainbow effects
   * @param props - Message properties
   * @private
   */
  private _processWrite(props: MessageProps): void {
    let output = '';

    // Add timestamp
    if (props.time?.show) {
      const timeColor = this._hsvToRgb(this.colorRotation, 1, 1);
      output += `[${this._colorize(props.time.text!, timeColor)}] `;
    }

    // Center text
    if (props.center) {
      const totalLen = props.coloringGroups.reduce((sum, grp) => sum + grp[1].length, 0);
      const padding = Math.round((process.stdout.columns / 2) - (totalLen / 2));
      output += ' '.repeat(Math.max(0, padding));
    }

    // Apply rainbow effects or regular coloring
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

    // Add label at the end
    if (props.label?.show) {
      const remaining = process.stdout.columns - this._stripAnsi(output).length - props.label.text!.length - 4;
      output += ' '.repeat(Math.max(0, remaining));
      output += ` [${this._colorize(props.label.text!, props.label.color || null)}]`;
    }

    console.log(output);

    // Advance color rotation
    this.colorRotation += this.startProps?.colorRotationOffset || 5;
    if (this.colorRotation >= 360) this.colorRotation = 0;
  }

  /**
   * Applies ANSI color codes to text
   * @param text - Text to colorize
   * @param color - Color (hex string or RGB object)
   * @returns Colorized text with ANSI codes
   * @private
   */
  private _colorize(text: string, color: string | RGB | null): string {
    if (!color) return text;
    const rgb = typeof color === 'string' ? this._hexToRgb(color) : color;
    return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`;
  }

  /**
   * Converts hex color to RGB
   * @param hex - Hex color string (e.g., '#ff0000')
   * @returns RGB color object
   * @private
   */
  private _hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 200, g: 200, b: 200 };
  }

  /**
   * Converts HSV color to RGB
   * Used for rainbow effects
   * @param h - Hue (0-360)
   * @param s - Saturation (0-1)
   * @param v - Value (0-1)
   * @returns RGB color object
   * @private
   */
  private _hsvToRgb(h: number, s: number, v: number): RGB {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r: number, g: number, b: number;
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

  /**
   * Strips ANSI escape codes from a string
   * @param str - String with ANSI codes
   * @returns Clean string without ANSI codes
   * @private
   */
  private _stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Delays execution until the queue is empty
   * @param ms - Milliseconds to wait after queue is empty
   * @returns Promise that resolves after delay
   */
  delay(ms: number): Promise<void> {
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

  /**
   * Reads a line of input from the user
   * @param prompt - Prompt text to display
   * @returns Promise that resolves with user input
   */
  async readLine(prompt = ''): Promise<string> {
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
