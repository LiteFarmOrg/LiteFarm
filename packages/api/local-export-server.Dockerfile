FROM node:16.15.0

WORKDIR /usr/src/app/packages/api

COPY ./package*.json ./

RUN npm install

# Install zip and AWS CLI
RUN apt-get update && \
    apt-get install -y zip python3-pip && \
    pip3 install --upgrade pip && \
    pip3 --no-cache-dir install --upgrade awscli

CMD ["npm", "run", "scheduler"]
