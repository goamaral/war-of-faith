import { render } from 'preact'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import VillagePage from './VillagePage'
import WorldMapPage from './WorldMapPage'

function App() {
  const router = createBrowserRouter([
    {
      path: "/villages/:id",
      element: <VillagePage />
    },
    {
      path: "/world-map",
      element: <WorldMapPage />
    },
  ])

  return  <RouterProvider router={router} />
}

render(
  <App />,
  document.getElementById('app') as HTMLElement,
)