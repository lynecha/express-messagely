"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message")
let _token;

describe("User Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM messages");
        await db.query("DELETE FROM users");

        let u1 = {
            username: "test1",
            password: "password",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
        };

        let u2 = User.register({
            username: "test2",
            password: "password",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155550000",
        });

        _token = await request(app)
            .post("/auth/register")
            .send(u1);
        _token = _token._body.token
    });

    /** GET /users => usersList  */
 
    test("Get list of Users", async function () {
        //console.log("token ", _token._body.token);
        let response = await request(app).get(`/users?_token=${_token}`);
        //console.log("what is the response ", response.body);
        expect(response.body.users.length).toEqual(2);
        expect(response.statusCode).toEqual(200);
    });

    test("Get a single user", async function() {
        let response = await request(app).get(`/users/test1?_token=${_token}`);
        expect(response.body.user.username).toEqual("test1");
        expect(response.statusCode).toEqual(200);
    });

    test("Get messages from", async function() {
        let m1 = await Message.create({
            from_username: "test1",
            to_username: "test2",
            body: "u1-to-u2",
        });
        let response = await request(app).get(`/users/test1/from?_token=${_token}`);
        expect(response.body.messagesFrom[0].to_user.username).toEqual("test2");
        expect(response.statusCode).toEqual(200);
    });

    // test("Get messages from", async function() {
    //     let response = await request(app).get(`/users/test1?_token=${_token}`);
    //     expect(response.body.user.username).toEqual("test1");
    //     expect(response.statusCode).toEqual(200);
    // });



});

/** POST /auth/login => token  */

// describe("POST /auth/login", function () {
//     test("can login", async function () {
//         let response = await request(app)
//             .post("/auth/login")
//             .send({ username: "test1", password: "password" });

//         let token = response.body.token;
//         expect(jwt.decode(token)).toEqual({
//             username: "test1",
//             iat: expect.any(Number)
//         });
//     });

//     test("won't login w/wrong password", async function () {
//         let response = await request(app)
//             .post("/auth/login")
//             .send({ username: "test1", password: "WRONG" });
//         expect(response.statusCode).toEqual(401);
//     });

//     test("won't login w/wrong password", async function () {
//         let response = await request(app)
//             .post("/auth/login")
//             .send({ username: "not-user", password: "password" });
//         expect(response.statusCode).toEqual(401);
//     });
// });
// });

afterAll(async function () {
    await db.end();
});
