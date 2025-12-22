#!/bin/bash
cd /Users/acadena/repos/hackaton-2025/craft/crafting
git add -A
git commit -m "Reorganize all images into resources/ and extra_resources/

USED images moved to resources/:
- resources/buildings/ (4 files)
- resources/dragons/ (1 file)
- resources/heroes/ (9 icon files)
- resources/item/ (gear icons)
- resources/materials/ (12 crafting materials)
- resources/research/ (9 march size icons)
- resources/stats/ (1 buff icon)
- resources/armories/ (19 files)
- resources/trinkets/ (16 files)
- resources/stark-logo.png

Updated HTML paths to use resources/ prefix.
Moved all unused images to extra_resources/"
git push

