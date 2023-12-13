import { useSignal, useSignalEffect } from '@preact/signals'
import { Link } from "react-router-dom"

import * as serverV1 from "../lib/protobuf/server/v1/server_pb"
import server from './server'

export default () => {
  const loading = useSignal(true)
  const villages = useSignal<serverV1.Village[]>([])

  useSignalEffect(() => {
    server.getVillages({ playerId: 1 }) // TODO: Get player id from auth
      .then(res => {
        villages.value = res.villages
        loading.value = false
      })
      .catch(err => alert(err))
  })

  if (loading.value) {
    return <div>Loading...</div>
  } else {
    return <div>
      <h1>Villages</h1>
      <ul>
        {villages.value.map(v => <li><Link to={`/villages/${v.id}`}>Village {v.id}</Link></li>)}
      </ul>
    </div>
  }
}