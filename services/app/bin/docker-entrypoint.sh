#!/bin/sh
# set -x

if [ ${1} = DEV ]; then
  npm run start --prefix /workdir/front/ &
  deno run --allow-net /workdir/back/server.ts &

  wait
fi
