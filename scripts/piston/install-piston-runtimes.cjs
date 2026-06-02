const http = require('http');

const runtimes = [
  { language: 'python', version: '3.10.0' },
  { language: 'java', version: '15.0.2' },
  { language: 'gcc', version: '10.2.0' },
];

async function install(runtime) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(runtime);
    const options = {
      hostname: 'localhost',
      port: 2000,
      path: '/api/v2/packages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`Installing ${runtime.language} ${runtime.version}...`);
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  for (const runtime of runtimes) {
    try {
      const result = await install(runtime);
      console.log(`Result for ${runtime.language}:`, result);
    } catch (e) {
      console.error(`Failed to install ${runtime.language}:`, e.message);
    }
  }
}

main();
