import { router } from '../router/index.ts'

const addQueries = () => {
  router.setQuery('/', () => {
    return new Response('Hello World!')
  })
  
  router.setQuery('/coucou', () => {
    const body = JSON.stringify({ message: "NOT FOUND" })
    return new Response(body, {
      status:200,
      headers: {
        "content-type": "routerlication/json; charset=utf-8",
      },
    })
  })
}

export default addQueries
