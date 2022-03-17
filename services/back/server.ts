import { serve } from "./deps.ts"
import { handler } from './router/index.ts'
import { addQueries } from './routes/index.ts'

serve(handler, {
  port: 4000,
})

addQueries()

console.log('The server run @ http://localhost:4000/')