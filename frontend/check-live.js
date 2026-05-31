import https from 'https';

https.get('https://spendr-main.vercel.app', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
      const jsUrl = 'https://spendr-main.vercel.app' + match[1];
      console.log('Fetching', jsUrl);
      https.get(jsUrl, (jsRes) => {
        let jsData = '';
        jsRes.on('data', (chunk) => jsData += chunk);
        jsRes.on('end', () => {
          if (jsData.includes('AIzaSyBiVbB0gi4UpsWRq1OvX3Dn53DvSN65Bfg')) {
            console.log('API key IS present in the live bundle!');
          } else {
            console.log('API key IS MISSING from the live bundle!');
          }
        });
      });
    } else {
      console.log('Could not find JS bundle in HTML');
    }
  });
}).on('error', (err) => console.error(err));
