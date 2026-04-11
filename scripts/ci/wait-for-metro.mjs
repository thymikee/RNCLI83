import http from 'node:http';

const port = Number(process.env.METRO_PORT || 8081);
const timeoutMs = Number(process.env.METRO_READY_TIMEOUT_MS || 60_000);
const startedAt = Date.now();

function retry() {
  if (Date.now() - startedAt > timeoutMs) {
    console.error(
      `Metro did not become ready on port ${port} within ${
        timeoutMs / 1000
      } seconds.`,
    );
    process.exit(1);
  }

  setTimeout(check, 1000);
}

function check() {
  const request = http.get(`http://127.0.0.1:${port}/status`, response => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', chunk => {
      body += chunk;
    });
    response.on('end', () => {
      if (body.includes('packager-status:running')) {
        process.exit(0);
      }

      retry();
    });
  });

  request.setTimeout(1000, () => {
    request.destroy();
    retry();
  });
  request.on('error', retry);
}

check();
