import sqlite3
import os

db_path = os.path.join('database', 'story.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("DELETE FROM achievements WHERE title='找到隱藏彩蛋'")
conn.commit()
conn.close()
print("Success")
