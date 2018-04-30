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
${>whoami?rgb(130, 224, 255) |:| rgb(255, 224, 255) |:| $$cool_color |} <!-- this is a choice - see predicates above -->
<!-- See that a variable occurs within the condition with a special syntax. $$VarName. VarName will be the key in values -->

${<./body-template.html|} <!-- this loads a file. -->
<!-- Inside body-template is a variable declaration. -->
```

As the files are processed first. All the variables are gathered after the files are brought in. 

The variable prefix **$$** has been decided upon for use in the choices that follow the conditions.
This syntax allows the variable to be separated from the variable established by the conditional.
There is no attept to evaluate the variable further. So, this variable syntax indicates a terminal substitution. 
The value for the variable has to come from a single instance of a variable in the *value* object. 

##Conclusion

That is it. There is virtually no calculation done by this module. Any calculation done to create a variable value has to be identified in the *values* passed to the substitution method, *subst* in the example. 

So, special uses of a string, e.g. capitalization, decorations, etc. will have to be identidied in the *values* with their own keys. 

For example, you could say "TitleCaps" : capitalize(myTitle) in the same value object as "title: myTitle. 

In the HTML you could put ${>TitleCaps|}, or in a conditional choice you could put $$TitleCaps. 

The choice here is to keep the module short, fast, and simple. The module can be further optimised perhaps by taking some ops out of JavaScript, although *JS* is doing very little here and it may already be in a very fast **C** underneath the hood of *JS*.

There may be no argument that the development of the web page is harder. As long as the variables are expressive, the HTML may be easier to read. And, JavaScript can be used to set the values of the variables.

I am going to use this module. I hope you will. There are not likely going to be more features to this module. But, there may be a few improvements which cab be addressed through issues. 






