

var subst = require('substitute');
var fs = require('fs');


var templateString = fs.readFileSync("index-template.html").toString();

var compiledTemplate = subst.prepare(templateString,{});



var vars = compiledTemplate.map ( entry => {
                                     if ( entry.vary ) return(entry.vary);
                                     return("");
                                 })


var variables = {};
vars.forEach(vary => {
                 variables[vary] = "";
             });
delete variables[""];
console.log(JSON.stringify(variables,null,2));
