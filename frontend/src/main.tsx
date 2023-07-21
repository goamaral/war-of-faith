import { render } from 'preact'
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import VillagePage from './VillagePage'
import GridMapPage from './GridMapPage'

const router = createBrowserRouter([
  {
    path: "/village",
    element: <VillagePage />
  },
  {
    path: "/grid-map",
    element: <GridMapPage />
  },
])

render(<RouterProvider router={router} />, document.getElementById('app') as HTMLElement)