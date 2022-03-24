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

### Clean unusual package ###
RUN apt autoremove -y

WORKDIR /workdir

COPY . .

### Install node modules ###
RUN npm i

CMD ["npm", "run", "start", "--prefix", "/workdir/"]
