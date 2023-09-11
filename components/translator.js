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
                ".",
                Object.getOwnPropertyNames(americanToBritishTitles)
            ];
        } else if (locale == Locale.britishToAmerican) {
            return [
                Object.fromEntries([
                    ...Object.entries(britishOnly),
                    ...Object.entries(americanToBritishSpelling).map(e => e.reverse()),
                    ...Object.entries(americanToBritishTitles).map(e => e.reverse())
                ]),
                "\\.",
                ":",
                Object.values(americanToBritishTitles)
            ]
        } else {
            throw new Error('Invalid Locale: ' + locale);
        }
    }

    _cbPrepTextArray(element, dict, titles, timeFrom, timeTo) {
        // callback function to prepare the textArray for translation -> handle / extract special cases (titles, datetimes) and fullstops
        const dateRegex = new RegExp("^(\\d{1,2})" + timeFrom + "(\\d{1,2})");
        if (dateRegex.test(element)) {
            return {
                text: element.replace(dateRegex, "$1" + timeTo + "$2"),
                specialCase: true,
                fullstop: false    
            }
        } else if (titles.includes(element.toLowerCase())) {
            // title -> translate and freeze: 
            return {
                text: dict[element.toLowerCase()][0].toUpperCase() + dict[element.toLowerCase()].substring(1),
                specialCase: true,
                fullstop: false
            }
        } else {
            // standard case with/without fullstop: 
            return {
                text: element.slice(-1) == "." ? element.slice(0, -1) : element,
                specialCase: false,
                fullstop: (element.slice(-1) == ".")
            }
        }
    };

    _translate(text, locale) {
        const [dict, timeFrom, timeTo, titles] = this._getLocaleParameters(locale);
        const textArray = text.split(" ").map(e => this._cbPrepTextArray(e, dict, titles, timeFrom, timeTo)); 
        const keys = Object.getOwnPropertyNames(dict);
        const keysFirstword = keys.map(k => k.split(" ")[0]);

        let translationArray = []; 
        let match;
        
        for (let i = 0; i < textArray.length; i++) {
            match = false;
            if (!textArray[i].specialCase) {
               [match, i, translationArray] = this._translateSinglePhrase(textArray, i, dict, keys, keysFirstword, translationArray);
            }
            if (!match) {
                translationArray.push(textArray[i].text + (textArray[i].fullstop ? "." : ""));
            }
        }

        // time format conversion: 
        let translation = translationArray.join(" ");
        const regex = new RegExp("(\\d{1,2})" + timeFrom + "(\\d{1,2})");
        if (translation.match(regex)) {    
            translation = translation.replace(regex, "$1" + timeTo + "$2");
        }

        return translation;
    }

    _translateSinglePhrase(textArray, i, dict, keys, keysFirstword, translationArray) {
        let potentialMatch; 
        let fullstop; 
        const potentiallyMatchingKeys = keys.filter(k => k.split(" ")[0] == textArray[i].text.toLowerCase())
                                            .map(k => k.split(" "))
                                            .sort((a, b) => (b.length - a.length));
        for (let k = 0; k < potentiallyMatchingKeys.length; k++) {
            [potentialMatch, fullstop] = this._getTextToMatch(textArray, i, potentiallyMatchingKeys[k].length);
            if (JSON.stringify(potentialMatch) === JSON.stringify(potentiallyMatchingKeys[k])) {
                translationArray.push(dict[potentialMatch.join(" ")] + (fullstop ? "." : ""));
                return [true, i + potentialMatch.length - 1, translationArray];
            }
        }

        return [false, i, translationArray];
        
    }

    _getTextToMatch(textArray, i, length) {
        const textToMatch = [textArray[i].text.toLowerCase()]; 
        let fullstop = false; 
        let next; 
        if (textArray[i].fullstop) {
            return [textToMatch, true];
        }
        while (textToMatch.length < length) {
            next = textArray[i + textToMatch.length];
            if (next.specialCase) {
                break; 
            }
            textToMatch.push(next.text.toLowerCase());
            if (next.fullstop) {
                fullstop = true; 
                break; 
            }
        }

        return [textToMatch, fullstop]; 
    }

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