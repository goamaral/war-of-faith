import { render } from "solid-js/web"
import { Router, Route } from "@solidjs/router"
import { ErrorBoundary } from "solid-js"

// import LoginPage from './LoginPage'
import WorldPage from './WorldPage'
import VillagesPage from './VillagesPage'
import VillagePage from './VillagePage'

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
        {/* <Route path="/login" component={LoginPage} /> */}
        <Route path="/world" component={WorldPage} />
        <Route path="/villages" component={VillagesPage} />
        <Route path="/villages/:coords" component={VillagePage} />
      </Router>
    </ErrorBoundary>
  ), 
  document.getElementById("app") as HTMLElement,
)