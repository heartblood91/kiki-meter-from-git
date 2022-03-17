import router from './router.ts'

const handler = (req: Request): Response => {
  const url = new URL(req.url)
  const { pathname } = url

  const query = router.getQuery(pathname)

  if (query) {
    return query(req)
  } else {
    return new Response('Not found', {
      status:404,
    })
  } 
}

export default handler
