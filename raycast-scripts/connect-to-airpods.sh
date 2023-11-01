#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Connect to airpods
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.author Kevin Kipp
# @raycast.authorURL https://github.com/third774

#!/bin/bash

# Set the name of your AirPods Pro  
airpods="Kevin's AirPods Pro"

SwitchAudioSource -a -t output

# Get the full name of the AirPods Pro audio device
airpods_device=$(SwitchAudioSource -a -t output | grep "$airpods" | sed 's/ (.*//')

echo $airpods_device

# Set AirPods Pro as the audio output device
SwitchAudioSource -s "$airpods_device"
sleep .2
open raycast://extensions/raycast/system/set-volume-to-50
