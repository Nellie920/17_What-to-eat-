CREATE DATABASE IF NOT EXISTS story_game_db;
USE story_game_db;

-- 玩家基本資料表
CREATE TABLE IF NOT EXISTS players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '儲存玩家基本資訊';

-- 故事進度存檔表
CREATE TABLE IF NOT EXISTS story_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    story_id VARCHAR(50) NOT NULL COMMENT '故事或劇本的識別碼',
    current_chapter INT DEFAULT 1 COMMENT '目前遊玩到的章節',
    current_node VARCHAR(100) COMMENT '目前所在的故事節點或場景',
    saved_state JSON COMMENT '額外的遊戲狀態（如：玩家選擇、持有的物品、好感度等）',
    last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後遊玩/存檔時間',
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_story (player_id, story_id) -- 確保每個玩家在同一個故事只有一個主要進度（若支援多存檔可移除此限制）
) COMMENT '儲存玩家在各個故事中的遊玩進度';
