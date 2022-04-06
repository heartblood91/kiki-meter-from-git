import router from './router.ts'
import {
  error_response_headers,
} from '../routes/util.ts'

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)
  const { pathname } = url

  const query = router.getQuery(pathname)

  if (query) {
    const response = await query(req)
    return response
  } else {
    return new Response('Not found', error_response_headers)
  } 
}

export default handler
