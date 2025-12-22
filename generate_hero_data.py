#!/usr/bin/env python3
"""
Generate Hero Data for March Size Calculator
Converts protobuf hero data into JavaScript format
"""
import json

# Load hero data from extraction tools
with open('/tmp/heroes_complete_data.json', 'r') as f:
    data = json.load(f)

heroes = data['heroes']

# Map council seat IDs to position keys
SEAT_TO_POSITION = {
    'heroseat_hand': 'hand',
    'heroseat_masterofwar': 'war',
    'heroseat_masterofcoins': 'coin',
    'heroseat_masterofwhisperers': 'whispers',
    'heroseat_masteroflaws': 'law',
    'heroseat_masterofships': 'ships',
    'heroseat_lordcommander': 'commander',
    'heroseat_grandmaester': 'maester'
}

# Clean up hero names
def clean_hero_name(name):
    """Convert 'Daenerystargeryen Motherofdragons' to 'Daenerys Targaryen'"""
    # Remove common suffixes
    suffixes = [
        ' Motherofdragons', ' Queenregent', ' Lordcommander', ' Firstranger',
        ' Youngwarrior', ' Nightswatchrecruit', ' Apprenticeblacksmith',
        ' Unsulliedcaptain', ' Gentlegiant', ' Youngsquire', ' Knightoftheflowers',
        ' Littlefinger', ' Kingmaker', ' Kingsguard', ' Ironborn', ' Redfork'
    ]
    
    cleaned = name
    for suffix in suffixes:
        cleaned = cleaned.replace(suffix, '')
    
    # Split camelCase names
    result = []
    current = []
    for char in cleaned:
        if char.isupper() and current:
            result.append(''.join(current))
            current = [char]
        else:
            current.append(char)
    result.append(''.join(current))
    
    return ' '.join(result).title()

# Generate JavaScript hero objects
print("// Generated from protobuf data - 114 heroes with council positions")
print()

# Group heroes by position
by_position = {}
for hero in heroes:
    if hero['council_positions']:
        seat_id = hero['council_positions'][0]  # Take first position
        position = SEAT_TO_POSITION.get(seat_id, 'unknown')
        
        if position not in by_position:
            by_position[position] = []
        
        # Create hero ID (lowercase, no spaces)
        hero_id = hero['id'].replace('hero_', '').replace('_', '')
        
        # Clean name
        clean_name = clean_hero_name(hero['name'])
        
        by_position[position].append({
            'id': hero_id,
            'name': clean_name,
            'original_name': hero['name'],
            'game_id': hero['id'],
            'position': position
        })

# Print heroes by position
for position, hero_list in sorted(by_position.items()):
    print(f"\n// {position.upper()} - {len(hero_list)} heroes")
    for h in hero_list:
        print(f"// {h['id']}: {h['name']}")

# Print JavaScript format
print("\n\n// JavaScript format for ms-data.js:\n")
print("heroList: {")

for position, hero_list in sorted(by_position.items()):
    if hero_list:
        print(f"    // {position.upper()} position heroes ({len(hero_list)} total)")
        for h in hero_list[:3]:  # Show first 3 as examples
            print(f"    {h['id']}: {{")
            print(f"        name: \"{h['name']}\",")
            print(f"        img: \"heroes/{h['game_id'].replace('hero_', '')}.png\",")
            print(f"        positions: [\"{h['position']}\"],")
            print(f"        maxLevel: 60,")
            print(f"        quality: \"legendary\",  // TODO: determine from game data")
            print(f"        // councilMarchSize: {{ type: 'flat', unlockLevel: 60, value: 0 }}  // TODO: add march size")
            print(f"    }},")
        if len(hero_list) > 3:
            print(f"    // ... {len(hero_list) - 3} more {position} heroes")
        print()

print("}")

print(f"\n// Total: {len(heroes)} heroes across {len(by_position)} council positions")

