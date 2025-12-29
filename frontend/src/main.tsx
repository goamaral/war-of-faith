import { render } from "solid-js/web"
import { Router, Route, Navigate } from "@solidjs/router"
import { ErrorBoundary } from "solid-js"

// import LoginPage from './LoginPage'
import WorldPage from './WorldPage'
import VillagesPage from './VillagesPage'
import WorldFieldPage from "./WorldFieldPage"

render(
  () => (
    <ErrorBoundary
      fallback={(error, reset) => {
        console.error(error)
        return (
          <div>
            <p>Something went wrong: {error.message}</p>
            <button onClick={reset}>Try again</button>
          </div>
        )
      }}
    >
      <Router>
        <Route path="/world" component={WorldPage} />
        <Route path="/world/:coords" component={WorldFieldPage} />
        <Route path="/villages" component={VillagesPage} />
        <Route path="*" component={() => <Navigate href="/world" />} />
      </Router>
    </ErrorBoundary>
  ),
  document.getElementById("app") as HTMLElement,
)
