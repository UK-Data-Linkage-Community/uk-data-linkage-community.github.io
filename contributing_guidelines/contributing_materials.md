### [Back to home](../README.md)

--- 
# Contributing Visual Materials

## Videos
```bash
ffmpeg -i original_video.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -threads 8 -c:a libopus smoother_video.webm
```