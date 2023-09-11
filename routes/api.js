'use strict';

const Translator = require('../components/translator.js');

const validLocales = ['american-to-british', 'british-to-american'];

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      if (req.body.text === '') {
        res.json({
          error: 'No text to translate'
        });
      } else if (!req.body.text || !req.body.locale) {
        res.json({
          error: 'Required field(s) missing'
        });
      } else if (!validLocales.includes(req.body.locale)) {
        res.json({
          error: 'Invalid value for locale field'
        });
      } else {
        res.json({
          text: req.body.text,
          translation: translator.translateAndHighlight(req.body.text, req.body.locale)
        })
      }
    });
};
