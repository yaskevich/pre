const fs =		require('fs');
const html =	fs.readFileSync('index.html', 'utf8');
const js =		fs.readFileSync('project.js', 'utf8').split('\n').slice(1).join('');
const texts =	fs.readFileSync('texts.json', 'utf8');
const nirs =	fs.readFileSync('nirs.json', 'utf8');
const code = "var data = " + nirs + ";\nvar texts = " + texts + ";\n" + js;
const out = html.replace('<script src="project.js"></script>', '<script type="text/javascript">' + code +'</script>') 
fs.writeFileSync('index.min.html', out.replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," "));
console.log("ok");