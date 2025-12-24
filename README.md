# War of Faith
Players compete to conquer the 4 mighty temples.

## Tech
### Frontend
- Framework - https://github.com/preactjs/preact
- Bundler - https://github.com/vitejs/vite

### Backend
- HTTP server - https://github.com/gin-gonic/gin
- SQL query builder - https://github.com/Masterminds/squirrel
- SQLite implementaion - https://gitlab.com/cznic/sqlite
- SQLite driver - https://github.com/libsql/libsql-client-go
- DB connector - https://github.com/jmoiron/sqlx
- General utilities - https://github.com/samber/lo
- Process manager - https://github.com/DarthSim/overmind
- Protobuf transport protocol - https://github.com/bufbuild/connect-go

### Other
- Protobuf compiler - https://github.com/bufbuild/buf

## Ideas
- Skill tree
- Leader timeout - If a village is left without a leader enough time, troops/milicia will rebel

## TODO
- Create fake server on client side with initial state (makes game deployable)
- World - Focus field select on field select
- Village - Unfocus troop input on submit
- World - Highlight most recently used village
- World - Change higlighted village with arrow keys
- AI
- Reveal fog fields on movement
- Add stats to troops (defense, attack, capacity)
- Building effects
- Temple effect
- Change key bindings
- Server simulation
- Player 2