FROM ubuntu:focal-20220302

### Install dependencies ###
RUN apt-get update && apt-get install -y \
  git \
  curl \
  nano \
  unzip \
  && rm -rf /var/lib/apt/lists/*

### Install deno ###
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="/root/.deno/bin:${PATH}"

WORKDIR /workdir

COPY . .

CMD ["deno", "run", "--allow-net", "--allow-read", "--watch", "/workdir/server.ts" ]
