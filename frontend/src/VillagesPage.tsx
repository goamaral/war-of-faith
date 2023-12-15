import { useSignal, useSignalEffect } from '@preact/signals'
import { Link } from "react-router-dom"

import * as entities from './entities'
import server from './server'

export default () => {
  const loading = useSignal(true)
  const villages = useSignal<entities.Village[]>([])

  useSignalEffect(() => {
    server.getVillages({ playerId: 1 }) // TODO: Get player id from auth
      .then(res => {
        villages.value = res.villages.map(village => new entities.Village(village))
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
        {villages.value.map(v => <li><Link to={`/villages/${v.id}`}>{v.name}</Link></li>)}
      </ul>
    </div>
  }
}