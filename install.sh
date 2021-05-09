#!/bin/bash

# Uncomment this line if you wish to install ffmpeg <--- this bot requires ffmpeg

# RPM
# sudo dnf install ffmpeg

# DEB
# sudo apt install ffmpeg
 
echo "Starting installation..."

echo "Creating virtual environment.."
python3 -m venv env

echo "Entering virtual environment.."
source ./env/bin/activate

echo "Upgrading pip.."
pip install --upgrade pip

echo "Installing Deepspeech.."
pip install deepspeech

echo "Exiting virtual environment!"
deactivate

echo "Downloading Models.."
mkdir deepspeech && cd deepspeech
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer
cd ..

echo "Installing npm packages"
npm install

echo "==========================="
echo "Install finished!"