import { router } from '../router/index.ts'
import {
  valid_response_headers,
} from './util.ts'

import {
  database,
} from './update/index.ts'

const addQueries = () => {
  router.setQuery('/update/database', async () => {
    await database.updateDatabase()

    return new Response('Compute is over!', valid_response_headers)
  })

  router.setQuery('/get/database', async () => {
    const database = await Deno.readTextFile('/workdir/database/kikimeters.json')

    return new Response(database, {
      status: valid_response_headers.status,
      headers: {
        ...valid_response_headers.headers,
        "content-type": "application/json; charset=utf-8",
      }
    })
  })
}

export default addQueries
