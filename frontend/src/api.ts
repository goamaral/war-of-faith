import { createClient, Client } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"

import { Service as PublicService } from '../lib/protobuf/public/v1/public_pb'
import { Service as ServerService } from '../lib/protobuf/server/v1/server_pb'
import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import { create } from "@bufbuild/protobuf"
import { GOLD_MINE, HALL, LEADER, newFieldTroops, newResources, newVillage, RAIDER } from "./state/config"

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
})

export const publicCli = createClient(PublicService, transport)
// export const serverCli = createClient(ServerService, transport)

export const serverCli: Client<typeof ServerService> = {
  async getWorld() {
    return create(serverV1.GetWorldResponseSchema, {
      world: newWorld(),
    })
  },

  subscribeToWorld(): AsyncIterable<serverV1.SubscribeToWorldResponse> {
    return {} as AsyncIterable<serverV1.SubscribeToWorldResponse>
  },

  async issueMovementOrder() {
    return {} as serverV1.IssueMovementOrderResponse
  },
  async cancelMovementOrder() {
    return {} as serverV1.CancelMovementOrderResponse
  },

  async issueBuildingUpgradeOrder() {
    return {} as serverV1.IssueBuildingUpgradeOrderResponse
  },
  async cancelBuildingUpgradeOrder() {
    return {} as serverV1.CancelBuildingUpgradeOrderResponse
  },

  async issueTrainingOrder() {
    return {} as serverV1.IssueTrainingOrderResponse
  },
  async cancelTrainingOrder() {
    return {} as serverV1.CancelTrainingOrderResponse
  },
}

function newWorld() {
  const world = create(serverV1.WorldSchema, {
    tick: 0,
    width: 10,
    height: 10,
    buildings: {
      [HALL]: create(serverV1.BuildingSchema, {
        id: HALL,
        name: "Village Hall",
        cost: [
          { gold: 10, time: 10 },
          { gold: 20, time: 10 },
          { gold: 30, time: 10 },
        ],
      }),
      [GOLD_MINE]: create(serverV1.BuildingSchema, {
        id: GOLD_MINE,
        name: "Gold Mine",
        cost: [
          { gold: 10, time: 10 },
          { gold: 20, time: 10 },
          { gold: 30, time: 10 },
        ],
      }),
    },
    troops: {
      [LEADER]: create(serverV1.TroopSchema, {
        id: LEADER,
        name: "Leader",
        cost: { gold: 50, time: 20 },
      }),
      [RAIDER]: create(serverV1.TroopSchema, {
        id: RAIDER,
        name: "Raider",
        cost: { gold: 5, time: 2 },
      }),
    },
    players: {
      "1": create(serverV1.PlayerSchema, { id: "1" }),
      "2": create(serverV1.PlayerSchema, { id: "2" }),
    },
    fields: {},
    villages: {},
    temples: {},
    movementOrders: [],
  })

  function createVillage(coords: string, playerId: string) {
    world.fields[coords] = create(serverV1.World_FieldSchema, {
      coords,
      kind:      serverV1.World_Field_Kind.VILLAGE,
      resources: newResources(),
      buildingLevels: {
        [HALL]:      1,
        [GOLD_MINE]: 1,
      },
      troops: {
        [LEADER]: 0,
        [RAIDER]: 0,
      },
      playerId,
    })
    world.villages[coords] = newVillage()
    if (world.players[playerId].villageKeyBindings.length < 10) {
      world.players[playerId].villageKeyBindings.push(coords)
    }
  }
  createVillage("3_4", "1")
  createVillage("6_5", "2")

  function createTemple(coords: string) {
    world.fields[coords] = create(serverV1.World_FieldSchema, {
      coords,
      kind:           serverV1.World_Field_Kind.TEMPLE,
      buildingLevels: {},
      troops: newFieldTroops(),
      resources: newResources(),
    })
    world.temples[coords] = create(serverV1.TempleSchema, {})
  }
  createTemple("1_1")
  createTemple("8_1")
  createTemple("8_8")
  createTemple("1_8")

  return world
}