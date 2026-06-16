# UI Design Decisions & Layout Rules

To maintain visual consistency and prevent UI alignment issues across different pages, follow these rules:

## 1. Base Layout & Sidebar Style (Home Page / General Views)
- **Source**: Based on `D1425422` branch layout.
- **Sidebar**:
  - Must include the **Project Dashboard** (`專案儀表板`) link in the main navigation sidebar.
  - The sidebar audio panel must have `margin-inline: 20px` and `padding-inline: 5px` for optimal spacing.
  - Sidebar links must have `white-space: nowrap` to prevent text wrapping.
- **Bootstrap**: Local Bootstrap files must be used instead of CDN links:
  - CSS: `{{ url_for('static', filename='css/bootstrap.min.css') }}`
  - JS: `{{ url_for('static', filename='js/bootstrap.bundle.min.js') }}`

## 2. In-Story playing screen (Visual Novel Playback Page)
- **Source**: Based on `D1463471` branch layout.
- **Sidebar Hiding**:
  - The global sidebar must be completely hidden when playing the story (when the current endpoint is `story.play_story`).
  - Condition in `base.html`:
    ```html
    {% if session.get('user_id') and not (request.blueprint == 'story' and request.endpoint == 'story.play_story') %}
    ```
  - This ensures that the playing page displays only the VN text box, character avatar, and choice lists, without the main menu sidebar interfering.

## 3. Achievements Page Layout
- **Source**: Gold card style from `D1425422` branch.
- **Layout**:
  - Simple list showing only unlocked achievements using the gold-themed medals (`background: rgba(212,175,55,0.1); border-color: var(--primary-gold)`).
  - Do NOT use the pink grid representing locked/unlocked achievements.
