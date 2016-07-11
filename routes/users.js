'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const ev = require('express-validation');
const validations = require('../validations/joiusers');


router.post('/users', ev(validations.post), (req, res, next) => {
  const newUser = req.body;
  const { user_name, password } = newUser;

  knex('users')
    .select(knex.raw('1=1'))
    .where('user_name', user_name)
    .first()
    .then((exists) => {
      if(exists) {
        const err = new Error();
        err.status = 400;

        throw err;
      }

      return bcrypt.hash(password, 12);
    })
    .then((hashed_password) => {
      return knex('users').insert({
        user_name: user_name,
        hashed_password: hashed_password,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        city: newUser.city,
        state: newUser.state,
        radius: newUser.radius
      }, '*');
    })
    .then(() => {
      return res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

//
// post
//
// on initial search do a get request to artists
//   if we do not have a result in the artists table
//
//   node get request to bandsintown for the artist
//
//   feed response filtered by user request fields to a searchReturnCard on the logged in users screen. this card will be immediately beneeath the search bar, and will delete any prexisting searchReturnCard
//
//   if user clicks to add to their favorites
//     send a post request to routes /artists/users
//
//   if artist doesn't exist in table {
//     add the relevant info to the artists table
//   }
//
//   then add foreign key into the artists_users table.
//
//   Visually .push() add the artist to the sidebar of favorites. delete sidebar and rewrite sidebar.
//
//   rewipe the upcoming shows to ensure the new artists results are shown
//
// /
//
// delete
//
// on click of delete of favorite artist sidebar
//   send a router.delete() to the artists/users route.
//   Delete artist from artists_users table.
//   Remove artist from favorites sidebar.
//   refresh the upcoming shows to ensure the removed artists' concerts are no longer there.
//
// /