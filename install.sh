#!/bin/bash

# Uncomment this line if you wish to install ffmpeg <--- this bot requires ffmpeg

# RPM
# sudo dnf install ffmpeg

# DEB
# sudo apt install ffmpeg
 
echo "Starting installation..."
pwd
whoami


echo "Removing the existing env directory:"
rm -rf env

echo "Creating virtual environment.."
python3 -m venv env

echo "Creating directories"
mkdir raw record transcripts deepspeech

echo "Entering virtual environment.."
source ./env/bin/activate

echo "Upgrading pip.."
pip install --upgrade pip

echo "--force-reinstall virtualenvwrapper"
pip install --force-reinstall virtualenvwrapper

echo "Installing Deepspeech.."
pip install --force-reinstall deepspeech

echo "Exiting virtual environment!"
deactivate

echo "Downloading Models.."
cd deepspeech



FILE_DEEPSPEECH_PBMM=deepspeech-0.9.3-models.pbmm
if [ ! -f "$FILE_DEEPSPEECH_PBMM" ]; then
    wget -nc -q "https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm" 
fi

FILE_DEEPSPEECH_SCORER=deepspeech-0.9.3-models.scorer
if [ ! -f "$FILE_DEEPSPEECH_SCORER" ]; then
    wget -nc -q "https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer" 
fi

# curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm
# curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer


cd ..

echo "Installing npm packages"
pwd
whoami
npm install

echo "==========================="
echo "Install finished!"
