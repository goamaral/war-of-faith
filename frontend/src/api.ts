import { createConnectTransport } from "@bufbuild/connect-web"
import { createPromiseClient } from "@bufbuild/connect"

import * as publicV1Connect from '../lib/protobuf/public/v1/public_connect'
import * as serverV1Connect from '../lib/protobuf/server/v1/server_connect'

export const publicV1Client = createPromiseClient(publicV1Connect.Service, createConnectTransport({ baseUrl: "http://localhost:3000", credentials: "include" }))
export const serverV1Client = createPromiseClient(serverV1Connect.Service, createConnectTransport({ baseUrl: "http://localhost:3000", credentials: "include" }))