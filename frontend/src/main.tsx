import { render } from 'preact'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransportProvider } from "@bufbuild/connect-query"
import { createConnectTransport } from "@bufbuild/connect-web"

import VillagePage from './VillagePage'
// import GridMapPage from './GridMapPage'

function App() {
  const transport = createConnectTransport({ baseUrl: "http://localhost:3000" })

  const queryClient = new QueryClient()

  const router = createBrowserRouter([
    {
      path: "/villages/:coords",
      element: <VillagePage />
    },
    // {
    //   path: "/grid-map",
    //   element: <GridMapPage />
    // },
  ])

  return <TransportProvider transport={transport}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </TransportProvider>
}

render(
  <App />,
  document.getElementById('app') as HTMLElement,
)