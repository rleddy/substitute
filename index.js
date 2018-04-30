

var fs = require('fs');

// ---- ---- ---- ----

const VarStart = "${>";
const VarEnd = "|}";
const SourceSymbolStart = "$$";
const VarFile = "${<"
const VarChoiceSep = "|:|"
const MAXSUBFILEDEPTH = 4;

// ---- ---- ---- ----

function source_reference(txt,values) {
    if ( txt.substr(0,2) == SourceSymbolStart ) {
        return(values[txt.substr(2)]);
    }
    return(txt);
}


module.exports = (subObjectArry,valueObject) => {
    var html = subObjectArry[0].trailer;
    //
    for ( var i = 1; i < subObjectArry.length; i++ ) {
        //
        var replacer = subObjectArry[i];
        //
        var k = replacer.vary;
        var trailer = replacer.trailer;
        //
        var value = valueObject[k]; // value

        if ( replacer.hasChoice ) {
            var ii = replacer.indexer(value);
            if ( (ii < replacer.choices.length) && (ii >= 0) ) {
                value = replacer.choices[ii];
                value = source_reference(value,valueObject);
            }
        }

        if ( !(replacer.hasChoice) && value !== undefined && typeof value !== "string" ) value = JSON.stringify(value);
        if ( value === undefined ) value = "";
        //
        html += value + trailer;
    }
    //
    return(html);
}



var gFileDepths = {};

function subfiles(htmlString) {
    //
    if ( htmlString.indexOf(VarFile) < 0 ) {
        return(htmlString);
    }
    // else
    var elements = htmlString.split(VarFile);

    var outStr = elements.shift();
    elements.forEach (fileline => {
                          var parts = fileline.split(VarEnd);
                          var fileName = parts.shift().trim();
                          var trailer = parts.join(VarEnd);
                          var subhtml = "";

                          if ( fileName.length ) {
                              if ( gFileDepths[fileName] === undefined ) gFileDepths[fileName] = 0;
                              else gFileDepths[fileName]++;
                              if ( gFileDepths[fileName] >= MAXSUBFILEDEPTH ) return;
                          } else return;

                          try {
                              subhtml = fs.readFileSync(fileName).toString();
                              subhtml = subfiles(subhtml);
                              gFileDepths[fileName]--;
                          } catch (e) {
                              subhtml = "";
                          }
                          outStr += subhtml + trailer;
                      })
    return(outStr);
}



function remove_space(pkPrep) {
    var outStr = '';
    var n = pkPrep.length;
    for ( var i = 0; i < n; i++ ) {
        var c = pkPrep[i];
        if ( c != ' ' && c != '\t' && c != '\n' ) {
            outStr += c;
        }
    }
    return(outStr);
}


// pulls out spaces from the syntactically correct strings.
function normalize_predicate(pk) {
    var pkPrep = pk.replace("\\'","&$$SQ$$");   // preserve back quoted
    pkPrep = pkPrep.replace("\\\"","&$$DQ$$");  // preserve back quoted
    var pkOK = pkPrep.split('\"');
    if ( pkOK.length > 1 ) {
        pkOK[0] = remove_space(pkOK[0]);
        pkOK[2] = remove_space(pkOK[2]);
        pkPrep = pkOK.join('\"');
        pkPrep = pk.replace("&$$SQ$$","\\'");         // restore back quoted
        pkPrep = pkPrep.replace("&$$DQ$$","\\\"");    // restore back quoted
        return(pkPrep);
    } else {
        pkOK = pkPrep.split('\'');
        if ( pkOK.length > 1 ) {
            pkOK[0] = remove_space(pkOK[0]);
            pkOK[2] = remove_space(pkOK[2]);
            pkPrep = pkOK.join('\'');
            pkPrep = pk.replace("&$$SQ$$","\\'");           // restore back quoted
            pkPrep = pkPrep.replace("&$$DQ$$","\\\"");      // restore back quoted
            return(pkPrep);
        }
    }
    // none of those.
    pkPrep = remove_space(pkPrep);
    pkPrep = pk.replace("&$$SQ$$","\\'");       // restore back quoted
    pkPrep = pkPrep.replace("&$$DQ$$","\\\"");  // restore back quoted
    return(pkPrep);
}


module.exports.prepare = (htmlString,predicateIndexers) => {
    // Split this string into an array using a variable prefix
    if ( predicateIndexers === undefined ) {
        throw new Error("A map of pedicates to anonymous functions is required.")
    }
    //
    var HTMLParts = [];
    //
    htmlString = subfiles(htmlString);  // all subfile parts first...

    var htmlComponents = htmlString.split(VarStart);

    HTMLParts.push( { vary : null, trailer: htmlComponents.shift() } );

    HTMLParts = HTMLParts.concat(htmlComponents.map( (part) => {
                                                        var varparts = part.split(VarEnd);
                                                        var key = varparts[0];  // usually one word.

                                                        // store trailer and most likely prefix
                                                        var vobj = { hasChoice : false, trailer: varparts[1] };

                                                        if ( key.indexOf("?") > 0 ) {  // set up a conditional
                                                            //
                                                            vobj.hasChoice = true;
                                                            //
                                                            var pp = key.split('?');  // ? before the list
                                                            vobj.vary = pp[0]; // this is now the key

                                                            var predKey = normalize_predicate(pp[0]);
                                                            //
                                                            vobj.indexer = predicateIndexers[predKey];
                                                            //
                                                            if ( vobj.indexer === undefined ) {
                                                                vobj.indexer = predicateIndexers['default'];
                                                                if ( vobj.indexer === undefined ) {
                                                                    vobj.indexer = (v) => { return(0); };
                                                                }
                                                            }
                                                            //
                                                            var replace = pp[1].split(VarChoiceSep);
                                                            vobj.choices = replace.map( txt => {
                                                                                              return(txt.trim());
                                                                                          });
                                                            // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
                                                         } else { // set up a simple replacement
                                                            vobj.vary = key;
                                                        }

                                                        return(vobj);
                                                     } ));
    //
    return(HTMLParts);
}

