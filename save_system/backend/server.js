require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 建立資料庫連線池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'story_game_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// API: 自動存檔 (儲存進度)
app.post('/api/save', async (req, res) => {
    const { player_id, story_id, current_chapter, current_node, saved_state } = req.body;

    if (!player_id || !story_id) {
        return res.status(400).json({ error: 'player_id and story_id are required' });
    }

    try {
        // 使用 INSERT ... ON DUPLICATE KEY UPDATE 實作自動覆蓋舊存檔
        const query = `
            INSERT INTO story_progress (player_id, story_id, current_chapter, current_node, saved_state)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            current_chapter = VALUES(current_chapter),
            current_node = VALUES(current_node),
            saved_state = VALUES(saved_state)
        `;
        
        await pool.execute(query, [
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
        const [rows] = await pool.execute(`
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
        const [rows] = await pool.execute('SELECT * FROM story_progress WHERE progress_id = ?', [req.params.progress_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Save file not found.' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error while loading save.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
