import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = express();
const port = Number(process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageFolder = path.join(__dirname, '..', 'data');
const storagePath = path.join(storageFolder, 'users.json');
const seedUsers = [
    {
        userId: 'admin',
        name: 'System Admin',
        password: 'admin123',
        role: 'Admin',
        email: 'admin@demo.local',
        department: 'IT',
        status: 'Active',
        accessLevel: 'Full',
    },
    {
        userId: 'user01',
        name: 'John Miller',
        password: 'pass123',
        role: 'General User',
        email: 'john@demo.local',
        department: 'Sales',
        status: 'Active',
        accessLevel: 'Read',
    },
    {
        userId: 'user02',
        name: 'Alicia Grant',
        password: 'pass123',
        role: 'General User',
        email: 'alicia@demo.local',
        department: 'Finance',
        status: 'Active',
        accessLevel: 'Read',
    },
];
function ensureStorage() {
    if (!fs.existsSync(storageFolder)) {
        fs.mkdirSync(storageFolder, { recursive: true });
    }
    if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, JSON.stringify({ users: seedUsers }, null, 2), 'utf8');
    }
}
function readUsers() {
    ensureStorage();
    const parsed = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    return parsed.users ?? [];
}
function writeUsers(users) {
    ensureStorage();
    fs.writeFileSync(storagePath, JSON.stringify({ users }, null, 2), 'utf8');
}
function sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function buildRecordsForUser(user) {
    const records = [
        {
            id: `DOC-${user.userId.toUpperCase()}-1001`,
            title: 'Monthly Access Report',
            type: 'Summary',
            owner: user.userId,
            status: 'Approved',
            amount: 4500,
            access: user.accessLevel,
            createdAt: '2026-10-05T09:00:00.000Z',
        },
        {
            id: `DOC-${user.userId.toUpperCase()}-1002`,
            title: 'Service Usage Log',
            type: 'Audit',
            owner: user.userId,
            status: 'Pending',
            amount: 2100,
            access: user.accessLevel,
            createdAt: '2026-10-06T11:30:00.000Z',
        },
        {
            id: `DOC-${user.userId.toUpperCase()}-1003`,
            title: 'Profile Permission Review',
            type: 'Review',
            owner: user.userId,
            status: 'Reviewed',
            amount: 1800,
            access: user.accessLevel,
            createdAt: '2026-10-07T15:15:00.000Z',
        },
    ];
    if (user.role === 'Admin') {
        return [
            ...records,
            {
                id: 'DOC-ADMIN-2001',
                title: 'Admin Console Overview',
                type: 'Admin',
                owner: 'admin',
                status: 'Approved',
                amount: 9800,
                access: 'Full',
                createdAt: '2026-10-08T08:45:00.000Z',
            },
        ];
    }
    return records;
}
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});
app.get('/api/app-load', async (req, res) => {
    const delayMs = Number(req.query.delayMs ?? 1200);
    await delay(delayMs);
    const users = readUsers();
    res.json({
        success: true,
        status: 'Application bootstrap complete',
        users: users.length,
        loadedAt: new Date().toISOString(),
    });
});
app.post('/api/login', (req, res) => {
    const { userId, password, role } = req.body ?? {};
    if (!userId || !password || !role) {
        return res.status(400).json({ success: false, message: 'userId, password, and role are required.' });
    }
    const users = readUsers();
    const user = users.find((item) => item.userId.toLowerCase() === String(userId).toLowerCase() &&
        item.password === String(password) &&
        item.role === role);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid user ID or password for the selected role.' });
    }
    const safeUser = sanitizeUser(user);
    return res.json({ success: true, message: `Welcome ${user.name}`, user: safeUser });
});
app.get('/api/users', (_req, res) => {
    const users = readUsers().map((user) => sanitizeUser(user));
    res.json({ success: true, users });
});
app.get('/api/users/:userId', (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const targetUser = readUsers().find((user) => user.userId.toLowerCase() === userId.toLowerCase());
    if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: sanitizeUser(targetUser) });
});
app.post('/api/users', (req, res) => {
    const payload = req.body ?? {};
    const userId = String(payload.userId ?? '').trim();
    const password = String(payload.password ?? '').trim();
    const name = String(payload.name ?? '').trim();
    const role = payload.role;
    if (!userId || !password || !name || !role) {
        return res.status(400).json({ success: false, message: 'userId, name, password and role are required.' });
    }
    const users = readUsers();
    if (users.some((user) => user.userId.toLowerCase() === userId.toLowerCase())) {
        return res.status(409).json({ success: false, message: 'User ID already exists.' });
    }
    const newUser = {
        userId,
        name,
        password,
        role,
        email: String(payload.email ?? `${userId}@demo.local`),
        department: String(payload.department ?? 'General'),
        status: String(payload.status ?? 'Active'),
        accessLevel: String(payload.accessLevel ?? (role === 'Admin' ? 'Full' : 'Read')),
    };
    users.push(newUser);
    writeUsers(users);
    return res.status(201).json({ success: true, message: 'User created successfully.', user: sanitizeUser(newUser) });
});
app.delete('/api/users/:userId', (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const users = readUsers();
    const remainingUsers = users.filter((user) => user.userId.toLowerCase() !== userId.toLowerCase());
    if (remainingUsers.length === users.length) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    writeUsers(remainingUsers);
    return res.json({ success: true, message: 'User deleted successfully.' });
});
app.get('/api/records/:userId', async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const requestedDelay = Number(req.query.delayMs ?? 1500);
    const user = readUsers().find((item) => item.userId.toLowerCase() === userId.toLowerCase());
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await delay(requestedDelay);
    const records = buildRecordsForUser(user);
    return res.json({
        success: true,
        userId: user.userId,
        role: user.role,
        processedAt: new Date().toISOString(),
        delayMs: requestedDelay,
        records,
    });
});
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
