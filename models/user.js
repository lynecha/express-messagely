"use strict";

/** User of the site. */

const { NotFoundError, UnauthorizedError} = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");
const SECRET_KEY = "oh-so-secret";

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(
      password, 12);

    const result = await db.query(
      `INSERT INTO users (username,
                             password,
                             first_name,
                             last_name,
                             phone,
                             join_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp)
         RETURNING username, password, first_name, last_name, phone, join_at`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];


  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]);
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        // const token = jwt.sign({ username }, SECRET_KEY);
        return user;
      }
    }
    return false;
    // throw new UnauthorizedError("Invalid user/password");

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(
      `UPDATE users
            SET last_login_at=$1
            WHERE username = $2
            RETURNING username,last_login_at`,
      [GetDate(),username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {

    const result = await db.query(
        `SELECT 
            username,
            first_name,
            last_name,
        FROM users`);
    const users = result.rows;
    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const result = await db.query(
          `SELECT 
              username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
          FROM users
          WHERE username = $1`,
          [username])

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const results = await db.query(
      `SELECT id,body,sent_at,read_at,to_username,first_name,last_name,phone
        FROM users
        JOIN messages
        ON from_username = username
        WHERE from_username = $1`,
        [username]
    );
    const messages = results.rows;

    const messages_formatted = messages.map(message => {
      return {id:message.id, 
              to_user:{username: message.to_username, 
                      first_name: message.first_name, 
                      last_name: message.last_name, 
                      phone: message.phone},
              body: message.body, 
              sent_at: message.sent_at, 
              read_at: message.read_at}
                            
    });

    return messages_formatted;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const results = await db.query(
      `SELECT id,body,sent_at,read_at,from_username,first_name,last_name,phone
        FROM users
        JOIN messages
        ON to_username = username
        WHERE to_username = $1`,
        [username]
    );
    const messages = results.rows;

    const messages_formatted = messages.map(message => {
      return {id:message.id, 
              from_user:{username: message.from_username, 
                      first_name: message.first_name, 
                      last_name: message.last_name, 
                      phone: message.phone},
              body: message.body, 
              sent_at: message.sent_at, 
              read_at: message.read_at}
                            
    });

    return messages_formatted;

  }
}


module.exports = User;
