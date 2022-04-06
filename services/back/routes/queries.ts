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
}

export default addQueries
