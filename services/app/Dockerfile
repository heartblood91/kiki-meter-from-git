FROM ubuntu:focal-20220302

### No interactive shell during the build ###
ARG DEBIAN_FRONTEND=noninteractive

### Install dependencies ###
RUN apt-get update && apt-get install -y \
  git \
  curl \
  nano \
  unzip \
  npm \
  && rm -rf /var/lib/apt/lists/*

###  Install node v14 ###
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - && apt -y install nodejs

### Install deno ###
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="/root/.deno/bin:${PATH}"

WORKDIR /workdir

COPY ./back ./back
COPY ./front ./front
COPY ./bin/docker-entrypoint.sh /

### Install node modules ###
RUN cd ./front && npm i

### Run back and front services ###
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["DEV"]
