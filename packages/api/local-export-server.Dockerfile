FROM node:16.15.0

WORKDIR /usr/src/app/packages/api

# Install zip
RUN apt-get update && apt-get install -y zip

# Install aws-cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip
RUN ./aws/install && aws --version

COPY ./package*.json ./

RUN npm install

CMD ["npm", "run", "scheduler"]
