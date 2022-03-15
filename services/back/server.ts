// deno-lint-ignore-file
import { opine } from "./deps.ts"

const app = opine()

app.get("/", (req, res) => {
  res.send("Hello World")
})


app.listen(
  4000,
  () => console.log("Backend has started on http://localhost:4000"),
)