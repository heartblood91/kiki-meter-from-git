FROM ubuntu:focal-20220302

### Install dependencies ###
RUN apt-get update && apt-get install -y \
  git \
  curl \
  nano \
  unzip \
  openssh-client \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.ssh && ln -s /run/secrets/git_ssh_key /root/.ssh/id_rsa
RUN chown -R root:root /root/.ssh
RUN echo "Host github.com\nStrictHostKeyChecking no\n" >> /root/.ssh/config

### Install deno ###
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="/root/.deno/bin:${PATH}"

### Clean unusual package ###
RUN apt autoremove -y

WORKDIR /workdir

COPY . .

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-run", "--allow-write", "--watch", "/workdir/server.ts" ]
