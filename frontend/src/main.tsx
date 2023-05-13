import { render } from 'preact'
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Village from './Village'

const router = createBrowserRouter([
  {
    path: "/village",
    element: <Village/>
  },
])

render(<RouterProvider router={router} />, document.getElementById('app') as HTMLElement)