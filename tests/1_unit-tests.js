const chai = require('chai');
const assert = chai.assert;

const Translator = require('../components/translator.js');
const translator = new Translator;

const Locale = {
    americanToBritish: "american-to-british",
    britishToAmerican: "british-to-american"
  };

const noDifference = "Everything looks good to me!";

suite('Unit Tests', () => {
    
    // American to British English: 
    test('Translate Mangoes are my favorite fruit. to British English', () => {
        assert.equal(translator._translate("Mangoes are my favorite fruit.", Locale.americanToBritish), 'Mangoes are my favourite fruit.');
    });
    test('Translate Paracetamol takes up to an hour to work. to American English', () => {
        assert.equal(translator._translate("Paracetamol takes up to an hour to work.", Locale.americanToBritish), "Paracetamol takes up to an hour to work.");
    });
    test('Translate I ate yogurt for breakfast. to British English', () => {
        assert.equal(translator._translate("I ate yogurt for breakfast.", Locale.americanToBritish), "I ate yoghurt for breakfast.");
    });
    test("Translate We had a party at my friend's condo. to British English", () => {
        assert.equal(translator._translate("We had a party at my friend's condo.", Locale.americanToBritish), "We had a party at my friend's flat.");
    });
    test("Translate Can you toss this in the trashcan for me? to British English", () => {
        assert.equal(translator._translate("Can you toss this in the trashcan for me?", Locale.americanToBritish), "Can you toss this in the bin for me?");
    });
    test("Translate The parking lot was full. to British English", () => {
        assert.equal(translator._translate("The parking lot was full.", Locale.americanToBritish), "The car park was full.");
    });
    test("Translate Like a high tech Rube Goldberg machine. to British English", () => {
        assert.equal(translator._translate("Like a high tech Rube Goldberg machine.", Locale.americanToBritish), 	"Like a high tech Heath Robinson device.");
    });
    test("Translate To play hooky means to skip class or work. to British English", () => {
        assert.equal(translator._translate("To play hooky means to skip class or work.", Locale.americanToBritish), "To bunk off means to skip class or work.");
    });
    test("Translate No Mr. Bond, I expect you to die. to British English", () => {
        assert.equal(translator._translate("No Mr. Bond, I expect you to die.", Locale.americanToBritish), "No Mr Bond, I expect you to die.");
    });
    test("Translate Dr. Grosh will see you now. to British English", () => {
        assert.equal(translator._translate("Dr. Grosh will see you now.", Locale.americanToBritish), "Dr Grosh will see you now.");
    });
    test("Translate Lunch is at 12:15 today. to British English", () => {
        assert.equal(translator._translate("Lunch is at 12:15 today.", Locale.americanToBritish), "Lunch is at 12.15 today.");
    });
    
    // British to American English: 
    test('Translate We watched the footie match for a while. to American English', () => {
        assert.equal(translator._translate("We watched the footie match for a while.", Locale.britishToAmerican), "We watched the soccer match for a while.");
    });
    test('Translate Paracetamol takes up to an hour to work. to American English', () => {
        assert.equal(translator._translate("Paracetamol takes up to an hour to work.", Locale.britishToAmerican), "Tylenol takes up to an hour to work.");
    });
    test('Translate First, caramelise the onions. to American English', () => {
        assert.equal(translator._translate("First, caramelise the onions.", Locale.britishToAmerican), "First, caramelize the onions.");
    });
    test('Translate I spent the bank holiday at the funfair. to American English', () => {
        assert.equal(translator._translate("I spent the bank holiday at the funfair.", Locale.britishToAmerican), "I spent the public holiday at the carnival.");
    });
    test('Translate I had a bicky then went to the chippy. to American English', () => {
        assert.equal(translator._translate("I had a bicky then went to the chippy.", Locale.britishToAmerican), "I had a cookie then went to the fish-and-chip shop.");
    });
    test("Translate I've just got bits and bobs in my bum bag. to American English", () => {
        assert.equal(translator._translate("I've just got bits and bobs in my bum bag.", Locale.britishToAmerican), "I've just got odds and ends in my fanny pack.");
    });
    test("Translate The car boot sale at Boxted Airfield was called off. to American English", () => {
        assert.equal(translator._translate("The car boot sale at Boxted Airfield was called off.", Locale.britishToAmerican), 	"The swap meet at Boxted Airfield was called off.");
    });
    test("Translate Have you met Mrs Kalyani? to American English", () => {
        assert.equal(translator._translate("Have you met Mrs Kalyani?", Locale.britishToAmerican), "Have you met Mrs. Kalyani?");
    });
    test("Translate Prof Joyner of King's College, London. to American English", () => {
        assert.equal(translator._translate("Prof Joyner of King's College, London.", Locale.britishToAmerican), "Prof. Joyner of King's College, London.");
    });
    test("Translate Tea time is usually around 4 or 4.30. to American English", () => {
        assert.equal(translator._translate("Tea time is usually around 4 or 4.30.", Locale.britishToAmerican), "Tea time is usually around 4 or 4:30.");
    });
    

    // Highlighting:
    test("Highlight translation in Mangoes are my favorite fruit.", () => {
        assert.equal(translator._highlightDelta("Mangoes are my favorite fruit.", "Mangoes are my favourite fruit."), "Mangoes are my <span class=\"highlight\">favourite</span> fruit.");
    });
    test("Highlight translation in I ate yogurt for breakfast.", () => {
        assert.equal(translator._highlightDelta("I ate yogurt for breakfast.", "I ate yoghurt for breakfast."), "I ate <span class=\"highlight\">yoghurt</span> for breakfast.");
    });
    test("Highlight translation in We watched the footie match for a while.", () => {
        assert.equal(translator._highlightDelta("We watched the footie match for a while.", "We watched the soccer match for a while."), "We watched the <span class=\"highlight\">soccer</span> match for a while.");
    });
    test("Highlight translation in Paracetamol takes up to an hour to work.", () => {
        assert.equal(translator._highlightDelta("Paracetamol takes up to an hour to work.", "Tylenol takes up to an hour to work."), "<span class=\"highlight\">Tylenol</span> takes up to an hour to work.");
    });
    
});
