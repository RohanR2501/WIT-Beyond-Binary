# WIT-Beyond-Binary
Public repository for the Hackathon Beyond Binary organized by WIT
1.2 Run backend
```bash
    cd buddybridge/backend
    python -m venv .venv
    # Windows: .venv\Scripts\activate
    # Mac/Linux: source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000
```
        Backend ready at: http://127.0.0.1:8000/docs
        GET /health
        POST /users
        GET /matches/{user_id}
        WS /ws/chat/{room_id}
        GET /wingman/{room_id}?user_a=...&user_b=...s


Running frontend:
To run your project, navigate to the directory and run one of the following npm commands.

- cd mobile
- npm run android
- npm run ios
- npm run web
npm notice
npm notice New major version of npm available! 10.9.2 -> 11.9.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.9.0
npm notice To update run: npm install -g npm@11.9.0
npm notice


2.4 Run mobile
cd buddybridge/mobile
npm install
npm run start