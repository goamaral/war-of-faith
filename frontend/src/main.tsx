import { render } from 'preact'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import VillagePage from './VillagePage'
// import GridMapPage from './GridMapPage'

function App() {
  const router = createBrowserRouter([
    {
      path: "/villages/:id",
      element: <VillagePage />
    },
    // {
    //   path: "/grid-map",
    //   element: <GridMapPage />
    // },
  ])

  return  <RouterProvider router={router} />
}

render(
  <App />,
  document.getElementById('app') as HTMLElement,
)