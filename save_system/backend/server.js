require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// 初始化 SQLite 資料庫
async function initDb() {
    db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS story_progress (
            progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id VARCHAR(255) NOT NULL,
            story_id VARCHAR(255) NOT NULL,
            current_chapter INTEGER DEFAULT 1,
            current_node VARCHAR(255) DEFAULT '',
            saved_state TEXT,
            last_played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_id, story_id)
        )
    `);
}

initDb().catch(console.error);

// API: 自動存檔 (儲存進度)
app.post('/api/save', async (req, res) => {
    const { player_id, story_id, current_chapter, current_node, saved_state } = req.body;

    if (!player_id || !story_id) {
        return res.status(400).json({ error: 'player_id and story_id are required' });
    }

    try {
        // 使用 INSERT ... ON CONFLICT 實作自動覆蓋舊存檔 (SQLite 語法)
        const query = `
            INSERT INTO story_progress (player_id, story_id, current_chapter, current_node, saved_state, last_played_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(player_id, story_id) DO UPDATE SET 
            current_chapter = excluded.current_chapter,
            current_node = excluded.current_node,
            saved_state = excluded.saved_state,
            last_played_at = CURRENT_TIMESTAMP
        `;
        
        await db.run(query, [
            player_id, 
            story_id, 
            current_chapter || 1, 
            current_node || '', 
            JSON.stringify(saved_state || {})
        ]);

        res.status(200).json({ success: true, message: 'Progress saved successfully.' });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Database error while saving progress.' });
    }
});

// API: 讀取特定玩家的所有存檔紀錄 (用於回顧介面)
app.get('/api/saves/:player_id', async (req, res) => {
    try {
        const rows = await db.all(`
            SELECT progress_id, story_id, current_chapter, current_node, last_played_at 
            FROM story_progress 
            WHERE player_id = ?
            ORDER BY last_played_at DESC
        `, [req.params.player_id]);
        
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Fetch saves error:', error);
        res.status(500).json({ error: 'Database error while fetching saves.' });
    }
});

// API: 讀取單一存檔的完整資料 (用於載入遊戲)
app.get('/api/load/:progress_id', async (req, res) => {
    try {
        const row = await db.get('SELECT * FROM story_progress WHERE progress_id = ?', [req.params.progress_id]);
        if (!row) {
            return res.status(404).json({ error: 'Save file not found.' });
        }
        res.status(200).json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ error: 'Database error while loading save.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
