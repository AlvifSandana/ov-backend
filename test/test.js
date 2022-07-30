import assert from "assert";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "../routes/index.js";
import request from "supertest";

dotenv.config();

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

describe('Register', () => {
  it('return json with 201 when the values is present.', (done) => {
    request(app)
      .post('/users')
      .send({
        name: 'john',
        email: 'john@mail.com',
        password: '12345678',
        confirmPassword: '12345678'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, done)
  });
});

describe('Login', () => {
  it('return json with 200 when the values is present.', (done) => {
    request(app)
      .post('/login')
      .send({
        email: 'john@mail.com',
        password: '12345678'
      })
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200)
      .then(response => {
        assert(response.body.message , 'Login Success!')
        done();
      })
      .catch(err => done(err))
  });
});
