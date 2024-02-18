const express = require('express'),
  router =  express.Router();

// NOTE: the moods ids are not sorted deliberately.
const moods = [
  {name: 'adventurous', id: '0'},
  {name: 'challenging', id: '1'},
  {name: 'dark', id: '12'},
  {name: 'emotional', id: '3'},
  {name: 'funny', id: '4'},
  {name: 'hopeful', id: '5'},
  {name: 'informative', id: '6'},
  {name: 'inspiring', id: '7'},
  {name: 'lighthearted', id: '8'},
  {name: 'mysterious', id: '9'},
  {name: 'reflective', id: '10'},
  {name: 'relaxing', id: '11'},
  {name: 'sad', id: '2'},
  {name: 'tense', id: '13'},
];
const pace = [
  {
    id: '0',
    name: 'Slow'
  },
  {
    id: '1',
    name: 'Medium'
  },
  {
    id: '2',
    name: 'Fast'
  }
]

router.get('/review/props', (req, res) => {
  res.json({ 
    // rating,
    moods,
    pace,
  })
})

module.exports = router;