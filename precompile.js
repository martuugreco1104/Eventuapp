const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Download and compile using local babel to get compiled plain JS
// Let's download babel 7.24.4 locally
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(dest, data, 'utf8');
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading Babel 7...');
  const babelCode = await download('https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.4/babel.min.js', 'babel7.min.js');
  console.log('Babel 7 downloaded, size:', babelCode.length);

  const Babel = require('./babel7.min.js');
  
  const startTag = '<script type="text/babel" data-presets="react">';
  const endTag = '</script>';
  const start = html.indexOf(startTag);
  const end = html.lastIndexOf(endTag);
  
  const jsxCode = html.substring(start + startTag.length, end);
  console.log('JSX Code length:', jsxCode.length);
  
  const transformed = Babel.transform(jsxCode, {
    presets: [['react', { runtime: 'classic' }]]
  }).code;
  console.log('Transformed JS length:', transformed.length);
  
  // Now replace the babel script tag and babel library from index.html!
  // We can completely eliminate Babel and run 100% native compiled JavaScript!
  let newHtml = html.substring(0, html.indexOf('<!-- Babel -->'));
  newHtml += '<script>\n' + transformed + '\n</script>\n</body>\n</html>';
  
  fs.writeFileSync('index.html', newHtml, 'utf8');
  console.log('index.html rewritten with PURE PRE-COMPILED JAVASCRIPT! No Babel needed in browser!');
  
  // Clean up
  fs.unlinkSync('babel7.min.js');
}

run().catch(e => console.error(e));
