"use strict";

const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js")

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  const user = req.body;
  if (await User.authenticate(user.username,user.password)) {

    const token = jwt.sign({ username: user.username }, SECRET_KEY);
    return res.json({ token });
  }

  throw new UnauthorizedError();
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  const newUser = await User.register(req.body);

  if (newUser) {
    const token = jwt.sign({ username: newUser.username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new BadRequestError();
});


module.exports = router;
