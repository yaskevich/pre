const fs		= require('fs');
const chart64	= fs.readFileSync('chart.base64', 'utf8');
const html		= fs.readFileSync('index.html', 'utf8').replace('chart.png', chart64);
const js		= fs.readFileSync('project.js', 'utf8').split('\n').slice(2).join('\n');
const texts		= fs.readFileSync('texts.json', 'utf8');
const nirs		= fs.readFileSync('nirs.json', 'utf8');

const code = ("var data = " + nirs + ";\nvar texts = " + texts + ";\n" + js).replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
const out = html.replace('<script src="project.js"></script>', '<script type="text/javascript">' + code +'</script>');
fs.writeFileSync('index.min.html', out.replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," "));

console.log("ok");