'use strict';

import { BlocklistWorker } from './worker';

async function main() {
  const worker = new BlocklistWorker();

  worker.bootstrap();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
