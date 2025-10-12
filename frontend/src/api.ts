import { createClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"

import { Service as PublicService } from '../lib/protobuf/public/v1/public_pb'
import { Service as ServerService } from '../lib/protobuf/server/v1/server_pb'

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
})

export const publicCli = createClient(PublicService, transport)
export const serverCli = createClient(ServerService, transport)