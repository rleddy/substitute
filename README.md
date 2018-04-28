# substitute

A simple node.js module to allow variable subsitution in files.

This might be called a compisiting engine. But, it is less than 200 lines of code. 

It looks for variables in the text file (especially html files) and puts in values in place the the variables. 

Just like other more extensive packages that do this, there is a special syntax that the module goes looking for. See below. 

The work flow is organized as such: 1) The template strings are scanned to find variables and the file gets segmented into an array of parts keyed by the variables; 2) at any time later, a node.js script using *substitute* may generate a string when the application passes a compiled template (an array of variable positions) and an object/map keyed on the variables with values to put intot them.

There are two methods that correspond to these steps:
```
subst.prepare(parameters) // called first - see below for the real example with the parameters
subst(parameters) // called subsequently 
```

So, your application can compile a list of templates. And, the call *substitute* many times over with different combinations of templates and value objects/maps. 

*Substitute* handles well secified files names and very simple conditionals. 

The files are processed before the variables. There is no attempt to create fancier situations where a file is pulled in and conditions get checked for inclusion. Instead, a very simple process of conditions checking allows choices derived from the conditions to pick files that have been previously loaded. 

Files are loaded recursively. There is an attempt to limit the number of times the same file is loaded. But, if those who create templates don't attempt to make things hard on themselves, they will use the file inclusion process in a straight forward way in which there are about as many files as file loading specifications.

The conditions indicate match functions that take in a string from the value/map object, test it, and then return an index indicating which choice to use. So, the correctness of using this is left up to the program. A list of choices follow the condition, and the index returned by the match functions (implemented by the application) should select one of the conditions [0,n-1].

Here is the code for the test.js example: 
```
var subst = require('substitute');  // the module
var fs = require('fs');


var templateString = fs.readFileSync("index-template.html").toString();  // load a template


var predicates = {   // here are predicates.. these are processed in the prepare method. 
    "whoami" : (txt) => { return(2); },
    "default" : (txt) => { return(1); }
}

var compiledTemplate = subst.prepare(templateString,predicates);  // Call prepare this way; It returns an array.

// don't mess with the array

// Here is a value map. A program could supply this from a DB say. 
var values = {
  "whoami" : "smith",
  "title": "mysite",
  "body": "whatcha doin' that's right.",
  "subject": ""
}

var output = subst(compiledTemplate,values);   // Call the module -- it's ok. Put in the array you got above and the values. 

// Send the string somewhere.
console.log(output)

```

That is all there is to it.  It should never really get more complicated. 

Look at example/index-html. To see the variable syntax.
Here is a brief rundown of it:

```
${>title|}  <!-- in the HTML a variable that gets replaced. ${> starts it |} ends it. -->
${>whoami?rgb(130, 224, 255) |:| rgb(255, 224, 255) |:| rgb(130, 100, 255)|} <!-- this is a choice - see predicates above -->

${<./body-template.html|} <!-- this loads a file. -->
 <!-- Inside body-template is a variable declaration. -->
```

As the files are processed first. All the variables are gathered after the files are brought in. 

The condition variables will not process variables within the choices, but files may be loaded. There is no attempt at this time (this version) to process variables within conditions, and the output of such constructs will not be predictable. For most cases this kind of complexity may not be necessary to address. That is because files can be generated ahead of the use the substitution.  In the next version, we can use the file loading process to load more complicated forms by generalizing the notion of a file. (This comment will change as well.)

