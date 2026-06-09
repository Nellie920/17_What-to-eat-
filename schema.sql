CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    badge_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- 插入測試用成就資料，若已存在則忽略
INSERT OR IGNORE INTO achievements (id, title, description, badge_url, points) VALUES
(1, '踏出第一步', '首次在劇本做出任何劇情抉擇。', '/static/images/achievements/step_one.png', 10),
(2, '戀愛大師', '達成專案中任一 Happy Ending 結局。', '/static/images/achievements/happy_end.png', 30),
(3, '遺憾的美好', '達成第一個 Sad Ending 結局。', '/static/images/achievements/sad_end.png', 20),
(4, '音律沉浸者', '在設定中調整過音量或靜音開關。', '/static/images/achievements/music_lover.png', 10),
(5, '百變主角', '自訂角色暱稱並更換介面主題。', '/static/images/achievements/custom_hero.png', 15),
(6, '達成初次結局', '恭喜你完成了遊戲的第一次結局！', '/static/badges/first_ending.png', 20),
(7, '找到隱藏彩蛋', '你發現了開發者藏起來的秘密！', '/static/badges/easter_egg.png', 15),
(8, '母胎單身狗', '遊戲裡外都保持著完美的單身紀錄。', '/static/badges/single_dog.png', 10);

