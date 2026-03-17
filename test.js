const http = require('http');

async function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 2999,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', e => reject(e));
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    try {
        const rnd = Math.floor(Math.random() * 100000);
        console.log('--- Register Admin ---');
        let res = await request('POST', '/authenticate/register', { username: `admin${rnd}`, password: 'password', admin: true });
        console.log(res.status, res.data);
        const adminToken = res.data?.token;

        console.log('\n--- Register Ordinary User ---');
        res = await request('POST', '/authenticate/register', { username: `user1_${rnd}`, password: 'password' });
        console.log(res.status, res.data);
        const user1Token = res.data?.token;

        console.log('\n--- Register Another User ---');
        res = await request('POST', '/authenticate/register', { username: `user2_${rnd}`, password: 'password' });
        console.log(res.status, res.data);
        const user2Token = res.data?.token;

        console.log('\n--- GET /users (no auth) ---');
        res = await request('GET', '/users');
        console.log(res.status);

        console.log('\n--- GET /users (ordinary user) ---');
        res = await request('GET', '/users', null, user1Token);
        console.log(res.status, res.data.error || res.data.message || res.data);

        console.log('\n--- GET /users (admin) ---');
        res = await request('GET', '/users', null, adminToken);
        console.log(res.status, `Returned ${res.data.length} users`);

        console.log('\n--- POST /questions (ordinary user) ---');
        res = await request('POST', '/questions', { text: 'Q1', options: ['A', 'B'], correctAnswerIndex: 0 }, user1Token);
        console.log(res.status, res.data);
        const q1Id = res.data?._id;

        console.log('\n--- GET /questions (anyone) ---');
        res = await request('GET', '/questions');
        console.log(res.status, `Returned ${res.data.length} questions`);

        console.log('\n--- PUT /questions/:id (wrong user) ---');
        res = await request('PUT', `/questions/${q1Id}`, { text: 'Q1 Mod' }, user2Token);
        console.log(res.status, res.data.error || res.data.message || res.data);

        console.log('\n--- PUT /questions/:id (correct user) ---');
        res = await request('PUT', `/questions/${q1Id}`, { text: 'Q1 Mod' }, user1Token);
        console.log(res.status, res.data.text);

        console.log('\n--- POST /quizzes (ordinary user) ---');
        res = await request('POST', '/quizzes', { title: 'Quiz1', description: 'Desc1' }, user1Token);
        console.log(res.status, res.data.error || res.data.message || res.data);

        console.log('\n--- POST /quizzes (admin) ---');
        res = await request('POST', '/quizzes', { title: 'Quiz1', description: 'Desc1' }, adminToken);
        console.log(res.status, res.data);
        const quiz1Id = res.data?._id;

        console.log('\n--- GET /quizzes (anyone) ---');
        res = await request('GET', '/quizzes');
        console.log(res.status, `Returned ${res.data.length} quizzes`);

        console.log('\n--- All tests completed ---');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
