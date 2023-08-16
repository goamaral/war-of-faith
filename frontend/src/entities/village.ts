import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building, Troop, Resources, TroopTrainingOrder } from "."

export default class Village{
  id: number
  gold: number

  buildings: Map<serverV1Types.Building_Kind, Building>
  troops: Map<serverV1Types.Troop_Kind, Troop>
  troopTrainingOrders: TroopTrainingOrder[]

  constructor(village: serverV1Types.Village) {
    this.id = village.id
    this.gold = village.resources?.gold!
    this.buildings = new Map<serverV1Types.Building_Kind, Building>(village.buildings.map(b => [b.kind, new Building(b)]))
    this.troops = new Map<serverV1Types.Troop_Kind, Troop>(village.troops.map(t => [t.kind!, new Troop(t, this)]))
    this.troopTrainingOrders = village.troopTrainingOrders.map(o => new TroopTrainingOrder(o, this))
  }

  get hall(): Building | undefined {
    return this.buildings.get(serverV1Types.Building_Kind.HALL)
  }

  get goldMine(): Building | undefined {
    return this.buildings.get(serverV1Types.Building_Kind.GOLD_MINE)
  }

  get trainableLeaders(): number {
    const maxLeaders = 1
    let leaders = this.troops.get(serverV1Types.Troop_Kind.LEADER)?.quantity ?? 0
    this.troopTrainingOrders.forEach(o => {
      if (o.troop.kind === serverV1Types.Troop_Kind.LEADER) leaders++
    })
    return maxLeaders - leaders
  }
  
  canAfford(cost: Resources) {
    if (cost.gold > this.gold) return false
    return true
  }

  updateBuilding(building: Building) {
    this.buildings.set(building.kind, building)
  }

  addGold(quantity: number) {
    this.gold += quantity
  }

  addTroopTrainingOrder(order: TroopTrainingOrder) {
    this.troopTrainingOrders.push(order)
  }
}