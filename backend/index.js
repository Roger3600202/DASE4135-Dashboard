import { createServer } from './src/server.js';
import { config } from './src/config.js';

const app = createServer();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${config.port}`);
});
