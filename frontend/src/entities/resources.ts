import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

export default class Resources {
  time: number
  gold: number

  constructor(resources: Partial<serverV1Types.Resources>) {
    this.time = resources.time ?? 0
    this.gold = resources.gold ?? 0
  }

  multiply(multiplier: number): Resources {
    return new Resources({
      time: this.time * multiplier,
      gold: this.gold * multiplier,
    })
  }
}