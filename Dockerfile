# production environment image
FROM node:14.15-buster as production

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-key adv --refresh-keys --keyserver keyserver.ubuntu.com && apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends build-essential libssl-dev libffi-dev ffmpeg sox python3-dev python3-pip python3-venv python3-setuptools

# Set the working directory inside the image
WORKDIR /app

# Copy all source code to the working directory
COPY . ./

USER root
RUN chown -R node:node /app

# Make the install script executable
RUN chmod a+x install.sh

USER node
# CMD ["./install.sh"]
