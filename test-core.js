import { Core } from './cliui/core/index.js';

const core = Core.getInstance();

//start the whole shi
core.start({
  logoString: `
   _____ _ _        _ _ _     
  / ____(_) |      | (_) |    
 | (___  _| |_ ___ | |_| |__  
  \\___ \\| | __/ _ \\| | | '_ \\ 
  ____) | | || (_) | | | |_) |
 |_____/|_|\\__\\___/|_|_|_.__/ 
  `,
  version: '1.0.0',
  author: {
    name: 'ahmesito',
    url: 'https://ahmesito.com'
  },
  motd: 'my personal custom cliui library for future use',
  debugMode: true,
  colorRotation: 0,
  colorRotationOffset: 5
});

//messages tests
core.writeLine({ label: { text: 'ok' } }, 'done done done');
core.writeLine({ label: { text: 'work' } }, 'doing things...');
core.writeLine({ label: { text: 'info' } }, 'this is an info');
core.writeLine({ label: { text: 'fail' } }, 'something went wrong');
core.writeLine({ label: { text: 'skip' } }, 'showering');

//rainbow messages
core.writeLine();
core.writeLine({ label: null, time: null, horizontalRainbow: true }, 'this text has a horizontal rainbow');
core.writeLine({ label: null, time: null, verticalRainbow: true }, 'this text has a vertical rainbow');

//centered text
core.writeLine();
core.writeLine({ label: null, time: null, center: true }, 'this text is centered');

//alert
core.writeLine();
core.createAlert('important', '#aa3333', 'this is some important shi', 'please stfu');

//using core delay because
await core.delay(1000);
core.writeLine({ label: { text: 'ok' } }, 'delay finished');
