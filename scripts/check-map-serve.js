const http = require('http');
const urls = ['http://localhost:5000/', 'http://localhost:5000/uploads/FinalMap.png', 'http://localhost:5000/uploads/FinalMap.svg'];

function check(url){
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const status = res.statusCode;
      const type = res.headers['content-type'] || '';
      console.log(`${url} -> ${status} ${type}`);
      res.resume();
      res.on('end', () => resolve());
    });
    req.on('error', (err) => { console.log(`${url} -> ERROR ${err.message}`); resolve(); });
    req.setTimeout(3000, () => { console.log(`${url} -> TIMEOUT`); req.abort(); resolve(); });
  });
}

(async function(){
  for (const u of urls) await check(u);
  process.exit(0);
})();
