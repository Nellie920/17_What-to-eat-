import sqlite3
c = sqlite3.connect('db17_love_story.db').cursor()
with open('ach_output.txt', 'w', encoding='utf-8') as f:
    for row in c.execute('SELECT title FROM achievements'):
        f.write(str(row) + '\n')
