const http = require('http'),
  fs = require('fs'),
  path = require('path'),
  url = require('url');

http.createServer((request, response) => {
  let addr = request.url,
    q = new URL(addr, 'http://' + request.headers.host),
    filePath = '';

  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  // Determine file to serve
  if (q.pathname.includes('documentation')) {
    filePath = path.join(__dirname, 'documentation.html');
  } else {
    filePath = path.join(__dirname, 'index.html');
  }

  // Read and serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.write('404 Not Found');
    } else {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
    }
    response.end();
  });


}).listen(8080);
console.log('My test server is running on Port 8080.');
