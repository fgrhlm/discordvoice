# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.177.0/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 16, 14, 12
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
RUN sudo apt-key adv --refresh-keys --keyserver keyserver.ubuntu.com && apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends build-essential libssl-dev libffi-dev ffmpeg sox python3-dev python3-pip python3-venv python3-setuptools

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

WORKDIR /workspace

# Copy all source code to the working directory
COPY . ./

USER root
RUN chown -R node:node /workspace

# Make the install script executable
RUN chmod a+x install.sh

USER node
# RUN /bin/bash ./install.sh

