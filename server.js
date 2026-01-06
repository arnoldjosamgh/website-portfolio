const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'database');
const EMAILS_FILE = path.join(DB_DIR, 'emails.csv');
const INVENTORY_FILE = path.join(DB_DIR, 'inventory.csv');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API: Register
    if (req.url === '/api/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body); // { name, email, password }
                // Simple CSV storage for Demo: Email,Password(Plaintext-Demo),Name,Date
                const csvLine = `\n${data.email},${data.password},${data.name},${new Date().toISOString()}`;

                fs.appendFile(EMAILS_FILE, csvLine, (err) => {
                    if (err) throw err;
                    console.log(`[REGISTER] Saved ${data.email}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });
            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed' }));
            }
        });
        return;
    }

    // API: Login
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);

                if (!fs.existsSync(EMAILS_FILE)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No users registered yet.' }));
                    return;
                }

                // Read CSV to find user
                const fileContent = fs.readFileSync(EMAILS_FILE, 'utf8');
                const lines = fileContent.split('\n');

                const user = lines.find(line => {
                    const parts = line.split(',');
                    return parts[0] === email && parts[1] === password;
                });

                if (user) {
                    const parts = user.split(',');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Login Successful',
                        user: { name: parts[2], email: parts[0] }
                    }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid Email or Password' }));
                }

            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Login Error' }));
            }
        });
        return;
    }

    // API: Checkout
    if (req.url === '/api/checkout' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('[CHECKOUT] Received order:', data.items.length, 'items');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Checkout Failed' }));
            }
        });
        return;
    }

    // Static File Serving
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Keep this window open. Close to stop server.');
});
