

var subst = require('substitute');
var fs = require('fs');


var templateString = fs.readFileSync("index-template.html").toString();


var predicates = {
    "whoami" : (txt) => { return(2); },
    "default" : (txt) => { return(1); }
}

var compiledTemplate = subst.prepare(templateString,predicates);

var values = {
  "whoami" : "smith",
  "title": "mysite",
  "body": "whatcha doin' that's right.",
  "subject": ""
}

var output = subst(compiledTemplate,values);

console.log(output)
