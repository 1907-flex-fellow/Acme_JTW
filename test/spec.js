const app  = require('supertest')(require('../app'));
const { expect } = require('chai');
const jwt = require('jwt-simple');
const db = require('../db');

describe('Authentication', ()=> {
    let seed; 
    beforeEach(async()=> {seed = await db.syncAndSeed()});
    describe('GET /api/sessions', ()=>{
        describe('When not loggin in', ()=> {
            it('returns a 401', async()=>{
                const response = await app.get('/api/sessions');
                expect(response.status).to.equal(401);
            });
        });
        describe('loggin with a valid token', ()=>{
            it('returns 200 with a user', async() => {
                const token = jwt.encode({ id: seed.larry.id }, process.env.SECRET)
                console.log('token: ', token)
                const response = await app.get('/api/sessions')
                    .set('authorization', token)
                expect(response.status).to.equal(200);
                expect(response.body.email).to.equal('larry@gmail.com')
            });
        });
        describe('with invalid token', ()=>{
            it('return 401', async() => {
                const token = jwt.encode({ id: seed.larry.id }, process.env.SECRET + '!');
                const response = await app.get('/api/sessions')
                    .set('authorization', token)
                expect(response.status).to.equal(401);
            });
        });
        describe('with nonexisting user', ()=>{
            beforeEach(async () => await db.models.User.destroy({ where: { id: seed.larry.id }}));
            it('return 401', async() => {
                const token = jwt.encode({ id: seed.larry.id }, process.env.SECRET);
                const response = await app.get('/api/sessions')
                    .set('authorization', token)
                expect(response.status).to.equal(401);
            });
        });
    });
    describe('POST /api/sessions', ()=>{
        describe('With correct credentials', ()=> {
            it('returns 200 with a token', async()=>{
                const response = await app.post('/api/sessions')
                    .send({ email: 'larry@gmail.com', password: 'LARRY'})
                expect(response.status).to.equal(200);
                const token = jwt.encode({ id: seed.larry.id }, process.env.SECRET);
                expect(response.body.token).to.equal(token)
            });
        });
        describe('With incorrect credentials', ()=> {
            it('returns 401', async()=>{
                const response = await app.post('/api/sessions')
                    .send({ email: 'larry@gmail.com', password: 'LARRAY'})
                expect(response.status).to.equal(401);
            });
        });
    });
});