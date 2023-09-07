const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const highlightTagOpening = '<span class=\"highlight\">'
const highlightTagClosing = '</span>'

const Locale = {
    americanToBritish: "american-to-british",
    britishToAmerican: "british-to-american"
  };


class Translator {

    _getLocaleParameters(locale) {
        // returns the required dictionary and datetime separator (from -> to)
        if (locale == Locale.americanToBritish) {
            return [
                Object.fromEntries([
                    ...Object.entries(americanOnly),
                    ...Object.entries(americanToBritishSpelling),
                    ...Object.entries(americanToBritishTitles)
                ]),
                ":",
                "."
            ];
        } else if (locale == Locale.britishToAmerican) {

            return [
                Object.fromEntries([
                    ...Object.entries(britishOnly),
                    ...Object.entries(americanToBritishSpelling).map(e => e.reverse()),
                    ...Object.entries(americanToBritishTitles).map(e => e.reverse())
                ]),
                "\\.",
                ":"
            ]
        } else {
            throw new Error('Invalid Locale: ' + locale);
        }
    }

    _translate(text, locale) {
        const [dict, timeFrom, timeTo] = this._getLocaleParameters(locale);
        const textArray = text.split(" "); 
        const translationArray = []; 
        const keys = Object.getOwnPropertyNames(dict);
        const keysFirstword = keys.map(k => k.split(" ")[0]);
        const titles = [...Object.getOwnPropertyNames(americanToBritishTitles), ...Object.values(americanToBritishTitles)];

        let fullstop, textToMatch, potentiallyMatchingKeys, j, match;

        for (let i = 0; i < textArray.length; i++) {
            fullstop = false;
            textToMatch = textArray[i].toLowerCase();
            
            if (textToMatch.slice(-1) == "." && !titles.includes(textToMatch)) {
                // cut off fullstop for dictionary lookup:
                textToMatch = textToMatch.slice(0, -1);
                fullstop = true; 
            }

            if (keysFirstword.includes(textToMatch)) {

                potentiallyMatchingKeys = keys.filter(k => k.split(" ")[0] == textToMatch)
                                              .map(k => k.split(" "))
                                              .sort((a, b) => (b.length - a.length));

                if (potentiallyMatchingKeys.length == 1 || fullstop) {
                    // only one exact match -> add to translation and move on:
                    if (titles.includes(textToMatch)) {
                        translationArray.push(dict[textToMatch][0].toUpperCase() + dict[textToMatch].substring(1));
                    } else if (potentiallyMatchingKeys[0].length > 1) {

                        // check if the rest of the words is matching: 
                        textToMatch = [textToMatch];
                        // get original text in same length TODO: this is done twice in the code (see l. 113ff) -> refactor
                        while (textToMatch.length < potentiallyMatchingKeys[0].length) {
                            if (textArray[i + textToMatch.length].slice(-1) == ".") {
                                // fullstop -> we have to break
                                textToMatch.push(textArray[i + textToMatch.length].slice(0, -1).toLowerCase());
                                fullstop = true;
                                break;
                            } else {
                                // no fullstop -> we can keep adding words:
                                textToMatch.push(textArray[i + textToMatch.length].toLowerCase());
                            }   
                        }

                        // check if it's a match: 
                        if (JSON.stringify(textToMatch) === JSON.stringify(potentiallyMatchingKeys[0])) {
                            // add to translation + skip indices:
                            dict[potentiallyMatchingKeys[0].join(" ")].split(" ").forEach((word, index) => {
                                translationArray.push(word + (fullstop && (index == textToMatch.length - 1) ? "." : ""))
                            });
                            i += textToMatch.length - 1;
                        } else {
                            translationArray.push(textArray[i]);
                        }

                       
                    } else {
                        translationArray.push(dict[textToMatch] + (fullstop ? "." : ""));
                    }
                } else {
                    match = false; 
                    textToMatch = [textToMatch];
                    // check if there's a match -> potentially matching keys are already sorted by length because the longest matching phrase (word count) is the most accurate and therefore has priority
                    for (j = 0; j < potentiallyMatchingKeys.length; j++) {
                        // get original text in same length 
                        while (textToMatch.length < potentiallyMatchingKeys[j].length) {                         
                            if (textArray[i + textToMatch.length].slice(-1) == ".") {
                                // fullstop -> we have to break
                                textToMatch.push(textArray[i + textToMatch.length].slice(0, -1).toLowerCase());
                                fullstop = true;
                                break;
                            } else {
                                // no fullstop -> we can keep adding words:
                                textToMatch.push(textArray[i + textToMatch.length].toLowerCase());
                            }   
                        }
                        // check if it's a match: 
                        if (JSON.stringify(textToMatch) === JSON.stringify(potentiallyMatchingKeys[j])) {
                            // add to translation + skip indices:
                            dict[potentiallyMatchingKeys[j].join(" ")].split(" ").forEach((word, index) => {
                                translationArray.push(word + (fullstop && (index == textToMatch.length - 1) ? "." : ""))
                            });
                            i += textToMatch.length - 1;
                            match = true;
                            break;
                        }
                    }
                    if (!match) {
                        // keep original word:
                        translationArray.push(textArray[i]);
                    }
                }
                
            } else {
                // keep original word:
                translationArray.push(textArray[i]);
            }
        }


        // time format conversion: 
        let translation = translationArray.join(" ");
        const regex = new RegExp("(\\d{1,2})" + timeFrom + "(\\d{1,2})");
        if (translation.match(regex)) {    
            translation = translation.replace(regex, "$1" + timeTo + "$2");
        }

        return translation;

    };

    /*_translate(text, dict, timeFrom, timeTo) {
        let textArray = text.split(" "); 
        const regex = new RegExp("(\\d{1,2})" + timeFrom + "(\\d{1,2})");
        
        if (text.match(regex)) {    // TODO: move to end / encapsulate in function
            // time format conversion: 
            textArray = text.replace(regex, this._highlight("$1" + timeTo + "$2")).split(" ");
        }

        const translationArray = []; 
        const keys = Object.getOwnPropertyNames(dict);
        const keys_firstword = keys.map(k => k.split(" ")[0]);
        const titles = [...Object.getOwnPropertyNames(americanToBritishTitles), ...Object.values(americanToBritishTitles)];

        let fullstop, potential_matching_keys, text_to_match, match, j; 

        for (let i = 0; i < textArray.length; i++) {
            fullstop = false; 
            text_to_match = textArray[i].toLowerCase();
            if ((text_to_match).slice(-1) == "." && !titles.includes(text_to_match)) {
                text_to_match = text_to_match.slice(0, -1);
                fullstop = true; 
            }
            if (keys.includes(text_to_match)) {
                // translate (but write edit titles to first letter uppercase):
                if (titles.includes(text_to_match)) {
                    translationArray.push(this._highlight(dict[text_to_match][0].toUpperCase() + dict[text_to_match].substring(1)) + (fullstop ? "." : ""));
                } else {
                    translationArray.push(this._highlight(dict[text_to_match]) + (fullstop ? "." : ""));
                }
            } else if (keys_firstword.includes(text_to_match)) {
                // check if the rest of the phrase matches the dictionary and decide whether to translate or omit
                potential_matching_keys = keys.filter(k => k.split(" ")[0] == text_to_match);
                match = false; 
                j = 0;
                while (potential_matching_keys.length > 0) {
                    // check if we have an exact match:
                    if (potential_matching_keys.includes(text_to_match)) {
                        translationArray.push(this._highlight(dict[text_to_match]) + (fullstop ? "." : ""));
                        i += text_to_match.split(" ").length - 1;
                        match = true;
                        break;
                    } else {
                        // add a word and repeat the same thing:
                        j++;
                        text_to_match += " " + textArray[i + j].toLowerCase();
                        if ((text_to_match).slice(-1) == "." && !titles.includes(text_to_match)) {
                            text_to_match = text_to_match.slice(0, -1);
                            fullstop = true; 
                        }   // TODO: refactoring -> make a helper function out of this
                        potential_matching_keys = potential_matching_keys.filter(k => k.startsWith(text_to_match));
                    }
                }
                // if there was no match we need to add the original word to output:
                if (!match) {
                    translationArray.push(textArray[i]);
                }
            } else {
                // keep original: 
                translationArray.push(textArray[i]);
            }
        }

        const translation = translationArray.join(" ");
        if (translation == text) {
            return "Everything looks good to me!";
        } else {
            return translation;
        }
    };*/


    _highlightDelta(original, translation) {
        // assumption: if this function is called, there's a difference between original and translation
        const originalArray = original.split(" ");
        const translationArray = translation.split(" "); 

        let iO = 0;
        const highlightedArray = [];
        let match = false;
        let i, j; 
        for (let iT = 0; iT < translationArray.length; iT++) {
            if (translationArray[iT] == originalArray[iO]) {
                // no difference -> just add to output: 
                highlightedArray.push(translationArray[iT]);
                iO++;
            } else if (translationArray[iT + 1] == originalArray[iO + 1]) {
                // just one word's difference -> add tag and add to output:
                highlightedArray.push(highlightTagOpening + translationArray[iT] + highlightTagClosing);
                iO++;
            } else {
                // more than one word's difference -> identify the whole thing: 
                highlightedArray.push(highlightTagOpening + translationArray[iT]);
                match = false;
                // find first new match (might be end of string): 
                for (j = iT + 1; j < translationArray.length; j++) {
                    for (i = iO; i < originalArray.length; i++) {
                        if (translationArray[j] == originalArray[i]) {
                            match = true; 
                            break; 
                        }
                    }
                    if (match || j == translationArray.length - 1) {
                        highlightedArray.push(translationArray[j] + highlightTagClosing);
                        // increase counters:
                        iT = j;
                        iO = i + 1;
                        break; 
                    } else {
                        highlightedArray.push(translationArray[j]);
                    }
                }
            }
        }

        return highlightedArray.join(" "); 
    };

    translateAndHighlight(text, locale) {
        const translation = this._translate(text, locale);
        if (translation == text) {
            return "Everything looks good to me!";
        } else {
            return this._highlightDelta(text, translation);
        }
    };
    
}

module.exports = Translator;