"use strict";

const res = require("express/lib/response");
const { append } = require("express/lib/response");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Router = require("express").Router;
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const router = new Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/

router.get("/",ensureLoggedIn, async function (req, res, next){
  const users = await User.all();
  return res.json({users});
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/


router.get("/:username", ensureLoggedIn, ensureCorrectUser, async function(req,res,next) {
  console.log("local user ", res.locals.user)
  const username = req.params.username;
  const user = await User.get(username);
  return res.json({user});
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureLoggedIn, ensureCorrectUser, async function(req,res,next) {
  const username = req.params.username;

  const messagesTo = await User.messagesTo(username);
  return res.json({messagesTo});
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

 router.get("/:username/from", ensureLoggedIn, ensureCorrectUser, async function(req,res,next) {
  const username = req.params.username;

  const messagesFrom = await User.messagesFrom(username);
  return res.json({messagesFrom});
})

module.exports = router;