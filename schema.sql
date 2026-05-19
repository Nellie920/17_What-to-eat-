CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    badge_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- 插入測試用成就資料
INSERT INTO achievements (title, description, badge_url) VALUES
('達成初次結局', '恭喜你完成了遊戲的第一次結局！', '/static/badges/first_ending.png'),
('找到隱藏彩蛋', '你發現了開發者藏起來的秘密！', '/static/badges/easter_egg.png'),
('母胎單身狗', '遊戲裡外都保持著完美的單身紀錄。', '/static/badges/single_dog.png');
