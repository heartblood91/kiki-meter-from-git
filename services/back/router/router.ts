type RouterType = {
  getQuery: GetQueryType,
  setQuery: SetQueryType,
}

type RouterPrivateType = {
  getQuery: GetQueryType,
  setQuery: SetQueryType,
  record?: Record<string, HandleType | undefined>,
}


type SetQueryType = (pathname: string, handler: HandleType ) => void
type GetQueryType = (pathname: string ) => HandleType | undefined

type HandleType = (req: Request) => Promise<Response>

const router = {} as RouterPrivateType

router.setQuery = (pathname, handler) => {
  if (router.record) {
    router.record[pathname] = handler
  } else {
    router.record = {
      [pathname]: handler,
    }
  }
}

router.getQuery = (pathname) => {
  if(router.record?.[pathname]) {
    return router.record[pathname]
  }
}

const removePrivateFunction = (): RouterType => {
  const shallow_router = {...router} 

  delete shallow_router.record

  return shallow_router
}

const public_router = removePrivateFunction()

export default public_router
