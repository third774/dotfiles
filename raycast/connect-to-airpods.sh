#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Connect to airpods
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.author Kevin Kipp
# @raycast.authorURL https://github.com/third774

#!/bin/bash

# Set the name of your AirPods Pro
airpods="Kevin's AirPods"
airpods_mac="74-77-86-75-BD-54"

/opt/homebrew/bin/BluetoothConnector --connect "$airpods_mac"

SwitchAudioSource -a -t output

# Get the full name of the AirPods Pro audio device
airpods_device=$(SwitchAudioSource -a -t output | grep "$airpods" | sed 's/ (.*//')

echo "$airpods_device"

# Set AirPods Pro as the audio output device
SwitchAudioSource -s "$airpods_device"
