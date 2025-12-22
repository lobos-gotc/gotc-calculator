# 🚀 Quick Reference - Asset Extraction

## Setup (One Time)

```bash
# Set up ADB alias for convenience
alias adb-mumu='/Applications/MuMuPlayer\ Pro.app/Contents/MacOS/MuMu\ Android\ Device.app/Contents/MacOS/tools/adb'
```

## Common Commands

### List Available Bundles
```bash
python3 extract_unity_sprites.py --list
```

### Extract Building Icons
```bash
python3 extract_unity_sprites.py buildings
```

### Extract Armory Banners
```bash
python3 extract_unity_sprites.py armories
```

### Extract Hero Portraits
```bash
python3 extract_unity_sprites.py heroes
```

## Find & Pull New Bundles

### Search for Bundles in MuMu
```bash
# Search for hero/character bundles
adb-mumu shell "find /sdcard/Android/data/com.wb.goog.got.conquest/files/Resources/ -name '*.unity3d' | grep -iE 'hero|character|commander|portrait'"

# Search for item bundles
adb-mumu shell "find /sdcard/Android/data/com.wb.goog.got.conquest/files/Resources/ -name '*.unity3d' | grep -i item"

# List all bundles
adb-mumu shell "ls /sdcard/Android/data/com.wb.goog.got.conquest/files/Resources/*.unity3d"
```

### Pull Specific Bundle
```bash
adb-mumu pull /sdcard/Android/data/com.wb.goog.got.conquest/files/Resources/BUNDLE_NAME.unity3d ./temp_unity_extracts/
```

### Extract from Specific Bundle
```bash
python3 extract_unity_sprites.py --bundle-file temp_unity_extracts/my_bundle.unity3d --output-dir output_folder/
```

## Bundle Name Patterns

| Asset Type | Bundle Pattern | Example |
|------------|---------------|---------|
| Buildings | `*buildings*icons*` | `generatedsprite_city_buildings_icons_01.*.unity3d` |
| Armories | `*gear*keyart*` | `generatedsprite_gear_keyart_01.*.unity3d` |
| Heroes | `*hero*portrait*` or `*commander*` | `generatedsprite_characters_hero_portraits_*.unity3d` |
| Items | `*item*icon*` | `generatedsprite_items_*.unity3d` |
| Materials | `*material*` or `*resource*` | `generatedsprite_resources_*.unity3d` |

## Troubleshooting

### ADB Not Working
```bash
# Check devices
adb-mumu devices

# Restart ADB if needed
adb-mumu kill-server
adb-mumu start-server
```

### Bundle Version Changed
Bundle filenames include version numbers (e.g., `.1762980161.unity3d`).  
If extraction fails, search for updated bundle names:
```bash
adb-mumu shell "ls /sdcard/Android/data/com.wb.goog.got.conquest/files/Resources/ | grep buildings"
```

## File Locations

- **Bundles**: `temp_unity_extracts/*.unity3d`
- **Buildings**: `buildings/*.png`
- **Armories**: `armories/*.png`
- **Heroes**: `heroes/*.png`
- **Items**: `item/*.png`
- **Materials**: `materials/*.png`

## Full Documentation

See `EXTRACTION_GUIDE.md` for complete instructions and advanced usage.

