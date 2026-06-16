CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    theme TEXT DEFAULT 'light',
    last_ending TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    node_id TEXT NOT NULL,
    chapter INTEGER DEFAULT 1,
    saved_state TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    badge_url TEXT,
    points INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- 插入預設成就種子資料
INSERT OR IGNORE INTO achievements (id, title, description, badge_url, points) VALUES
(1, '踏出第一步', '首次在劇本做出任何劇情抉擇。', '/static/images/achievements/step_one.png', 10),
(2, '戀愛大師', '達成專案中任一 Happy Ending 結局。', '/static/images/achievements/happy_end.png', 30),
(3, '遺憾的美好', '達成第一個 Sad Ending 結局。', '/static/images/achievements/sad_end.png', 20),
(4, '音律沉浸者', '在設定中調整過音量或靜音開關。', '/static/images/achievements/music_lover.png', 10),
(5, '百變主角', '自訂角色暱稱並更換介面主題。', '/static/images/achievements/custom_hero.png', 15),
(6, '達成初次結局', '恭喜你完成了遊戲的第一次結局！', '/static/badges/first_ending.png', 20),
(7, '找到隱藏彩蛋', '你發現了開發者藏起來的秘密！', '/static/badges/easter_egg.png', 15),
(8, '母胎單身狗', '遊戲裡外都保持著完美的單身紀錄。', '/static/badges/single_dog.png', 10);


