BREW_VERSION=$(brew -v)

if [[ "$BREW_VERSION" != "Homebrew"* ]]; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
else
  echo "$BREW_VERSION"
fi

brew install postgresql

NODE_VERSION=$(node -v)

if [[ "$NODE_VERSION" != "v"* ]]; then
  brew install node
else
  echo "node version: $NODE_VERSION"
fi

PNPM_VERSION=$(pnpm -v)

if ! [[ $PNPM_VERSION =~ ^[0-9]* ]]; then
  npm install -g pnpm
else
  echo "pnpm version: $PNPM_VERSION"
fi

NVM_FILE=~/.nvm/nvm.sh
if [ ! -f "$NVM_FILE" ]; then
    brew install nvm
fi

. ~/.nvm/nvm.sh

nvm install 16.15.0

nvm use 16.15.0

npm install

cd packages/api

npm install

cp .env.default .env

cd ../webapp

pnpm install

cp .env.default .env
