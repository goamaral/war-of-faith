import { useSignal } from "@preact/signals"
import { publicV1Client } from "./api"

export default () => {
  const email = useSignal("")
  const password = useSignal("")

  async function login(ev: Event) {
    ev.preventDefault()
    try {
      await publicV1Client.login({ email: email.value, password: password.value })
      // TODO: redirect
    } catch(err) {
      alert(err)
    }
  }

  return (
    <div>
      <form onSubmit={login}>
        <label for="email">Email</label>
        <input type="text" name="email" value={email} onChange={(e: any) => email.value = e.target.value} />

        <label for="password">Password</label>
        <input type="password" name="password" value={password} onChange={(e: any) => password.value = e.target.value} />

        <button type="submit">Login</button>
      </form>
    </div>
  )
}