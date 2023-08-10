import { createConnectTransport } from "@bufbuild/connect-web"
import { createPromiseClient } from "@bufbuild/connect"

import { Service } from '../lib/protobuf/server/v1/server_connect'

export default createPromiseClient(Service, createConnectTransport({ baseUrl: "http://localhost:3000" }))