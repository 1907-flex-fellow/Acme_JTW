const express = require('express');
const db = require('./db');
const { User } = db.models;

const app = express();
const path = require('path');
app.use(express.json());
// app.use(require('express-session')({
//     secret: process.env.SECRET 
//   }));

app.use((req, res, next)=>{
  if(!req.headers.authorization){
    return next()
  }
  User.findByToken(req.headers.authorization)
    .then(user => {
      req.user = user
      next()
    })
    .catch(next)
})

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/api/sessions', (req, res, next)=> {
  const user = req.user; 
  if(user){
    return res.send(user);
  }
  next({ status: 401 });
});

app.post('/api/sessions', (req, res, next)=> {
    User.authenticate(req.body)
        .then(token => {
            res.send({ token });
        })
        .catch(next)
});

app.delete('/api/sessions', (req, res, next)=> {
  req.session.destroy();
  res.sendStatus(204);
});

app.get('/', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next)=>{
    res.status(err.status || 500).send({ error: err})
})


module.exports = app;
