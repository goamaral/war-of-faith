import "preact/debug"
import { render } from 'preact'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoginPage from './LoginPage'
import VillagesPage from './VillagesPage'
import VillagePage from './VillagePage'
import WorldPage from './WorldPage'

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />
    },
    {
      path: "/villages",
      element: <VillagesPage />
    },
    {
      path: "/villages/:id",
      element: <VillagePage />
    },
    {
      path: "/world",
      element: <WorldPage />
    },
  ])

  return <RouterProvider router={router} />
}

render(
  <App />,
  document.getElementById('app') as HTMLElement,
)