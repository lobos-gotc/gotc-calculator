/**
 * March Size Calculator Data
 * 
 * This file contains all march size contribution values from various game sources:
 * - Gear (by slot and quality)
 * - Heroes (by position and level)
 * - Armories (Standard, Trinket, Dragon)
 * - Buildings (Keep, Training Yard, Great Hall, Watchtower)
 * - Research (Military trees, Dragon research)
 * - Dragon Talents
 * 
 * Data structure allows for easy lookup and calculation of total march size.
 */

const MARCH_SIZE_DATA = {
    // ============================================
    // GEAR STATS - March Size focused gear
    // Based on actual game data for SoP scenarios
    // ============================================
    gear: {
        // HELMET - Only pieces with March Size stats
        helmet: {
            "Queen Mother Vestments": {
                season: 10,
                set: "Queen Mother",
                img: "item/season10/queen_mother_vestements/head.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 10405, marchSizePct: 0 }
                }
            },
            "Golden Rose": {
                season: 12,
                set: "Golden Rose",
                img: "item/season12/golden-rose/head.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Frostfang Thenn": {
                season: 12,
                set: "Frostfang Thenn",
                img: "item/season12/frostfang-thenn/head.webp",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 8990, marchSizePct: 0 }
                }
            }
        },
        // CHEST - Only pieces with March Size stats
        chest: {
            "Queen Mother Vestments": {
                season: 10,
                set: "Queen Mother",
                img: "item/season10/queen_mother_vestements/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 10405, marchSizePct: 0 }
                }
            },
            "Val. Kingsguard": {
                season: 13,
                set: "Valyrian Kingsguard",
                img: "item/season13/valyrian-kingsguard/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.80 }
                }
            },
            "Targ. Kingsguard": {
                season: 9,
                set: "Targaryen Kingsguard",
                img: "item/season9/targaryen-kingsguard/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    // L50 = +4,230 flat march size (base L40 = 3254)
                    legendary: { marchSize: 3254, marchSizePct: 0 }
                }
            },
            "Burning Usurper": {
                season: 12,
                set: "Burning Usurper",
                img: "item/season12/burning-usurper/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    // L40 Legendary = 4.00% march size (from game data)
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Frostfang Thenn": {
                season: 12,
                set: "Frostfang Thenn",
                img: "item/season12/frostfang-thenn/chest.webp",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Flame Reaver": {
                season: 11,
                set: "Flame-Wreathed Reaver",
                img: "item/season11/flame-wreathed-reaver/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 3.33 }
                }
            },
            "Frost Ranger": {
                season: 11,
                set: "Frostbitten Ranger",
                img: "item/season11/frostbitten-ranger/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 3.33 }
                }
            },
            "GreenFyre": {
                season: 11,
                set: "Greenfyre",
                img: "item/season11/greenfyre/chest.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 3.33 }
                }
            }
        },
        // PANTS - Only pieces with March Size stats
        pants: {
            "Queen Mother Vestments": {
                season: 10,
                set: "Queen Mother",
                img: "item/season10/queen_mother_vestements/pants.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 10405, marchSizePct: 0 }
                }
            },
            "Val. Kingsguard": {
                season: 13,
                set: "Valyrian Kingsguard",
                img: "item/season13/valyrian-kingsguard/pants.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.80 }
                }
            },
            "Frostfang Thenn": {
                season: 12,
                set: "Frostfang Thenn",
                img: "item/season12/frostfang-thenn/pants.webp",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Chilled Corsair": {
                season: 12,
                set: "Chilled Corsair",
                img: "item/season12/chilled-corsair/pants.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Dragonflame Warrior": {
                season: 12,
                set: "Dragonflame Warrior",
                img: "item/season12/dragonflame-warrior/pants.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "GreenFyre": {
                season: 11,
                set: "Greenfyre",
                img: "item/season11/greenfyre/pants.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 3.33 }
                }
            }
        },
        // WEAPON - Only pieces with March Size stats
        weapon: {
            "Queen Mother Vestments": {
                season: 10,
                set: "Queen Mother",
                img: "item/season10/queen_mother_vestements/weapon.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 10405, marchSizePct: 0 }
                }
            },
            "Frostfang Thenn": {
                season: 12,
                set: "Frostfang Thenn",
                img: "item/season12/frostfang-thenn/weapon.webp",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Chilled Corsair": {
                season: 12,
                set: "Chilled Corsair",
                img: "item/season12/chilled-corsair/weapon.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Burning Usurper": {
                season: 12,
                set: "Burning Usurper",
                img: "item/season12/burning-usurper/weapon.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Dragonflame Warrior": {
                season: 12,
                set: "Dragonflame Warrior",
                img: "item/season12/dragonflame-warrior/weapon.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            }
        },
        // RING - Only pieces with March Size stats
        ring: {
            "Queen Mother Vestments": {
                season: 10,
                set: "Queen Mother",
                img: "item/season10/queen_mother_vestements/ring.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 10405, marchSizePct: 0 }
                }
            },
            "Val. Kingsguard": {
                season: 13,
                set: "Valyrian Kingsguard",
                img: "item/season13/valyrian-kingsguard/ring.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.80 }
                }
            },
            "Golden Rose": {
                season: 12,
                set: "Golden Rose",
                img: "item/season12/golden-rose/ring.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Flame Reaver": {
                season: 11,
                set: "Flame-Wreathed Reaver",
                img: "item/season11/flame-wreathed-reaver/ring.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 3.33 }
                }
            },
            "Frost Ranger": {
                season: 11,
                set: "Frostbitten Ranger",
                img: "item/season11/frostbitten-ranger/ring.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 3.33 }
                }
            },
            "Frostfang Thenn": {
                season: 12,
                set: "Frostfang Thenn",
                img: "item/season12/frostfang-thenn/ring.webp",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 8990, marchSizePct: 0 }
                }
            }
        },
        // BOOTS - Only pieces with March Size stats
        boots: {
            "Queen Mother Vestments": {
                season: 10,
                set: "Queen Mother",
                img: "item/season10/queen_mother_vestements/boots.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 10405, marchSizePct: 0 }
                }
            },
            "Chilled Corsair": {
                season: 12,
                set: "Chilled Corsair",
                img: "item/season12/chilled-corsair/boots.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Burning Usurper": {
                season: 12,
                set: "Burning Usurper",
                img: "item/season12/burning-usurper/boots.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Dragonflame Warrior": {
                season: 12,
                set: "Dragonflame Warrior",
                img: "item/season12/dragonflame-warrior/boots.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Golden Rose": {
                season: 12,
                set: "Golden Rose",
                img: "item/season12/golden-rose/boots.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 0, marchSizePct: 4.00 }
                }
            },
            "Frostfang Thenn": {
                season: 12,
                set: "Frostfang Thenn",
                img: "item/season12/frostfang-thenn/boots.webp",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 8990, marchSizePct: 0 }
                }
            }
        },
        // TRINKET - Only pieces with March Size stats
        trinket: {
            "KG White Cloak": {
                season: 13,
                set: "Kingsguard",
                img: "trinkets/kg_white_cloak.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 4162, marchSizePct: 0 }
                }
            },
            "Floral Brooch": {
                season: 12,
                set: "Floral",
                img: "trinkets/icon_eq_events_harvest_trinket_1.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    // L40 Legendary: marchSize 1672 + PvP 1254 + SoP 1254 = 4180
                    legendary: { marchSize: 4180, marchSizePct: 0 }
                }
            },
            "Bronze Cutlery": {
                season: 11,
                set: "Relics of the First Man",
                img: "trinkets/icon_eq_events_thenn_trinket_1.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 3216, marchSizePct: 0 }
                }
            }
        },
        // DRAGON TRINKET - Same options as Trinket (for dual march builds)
        dragonTrinket: {
            "KG White Cloak": {
                season: 13,
                set: "Kingsguard",
                img: "trinkets/kg_white_cloak.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 4162, marchSizePct: 0 }
                }
            },
            "Floral Brooch": {
                season: 12,
                set: "Floral",
                img: "trinkets/icon_eq_events_harvest_trinket_1.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    // L40 Legendary: marchSize 1672 + PvP 1254 + SoP 1254 = 4180
                    legendary: { marchSize: 4180, marchSizePct: 0 }
                }
            },
            "Bronze Cutlery": {
                season: 11,
                set: "Relics of the First Man",
                img: "trinkets/icon_eq_events_thenn_trinket_1.png",
                scenarios: ["sop", "keep", "reinforce"],
                stats: {
                    legendary: { marchSize: 3216, marchSizePct: 0 }
                }
            }
        }
    },

    // ============================================
    // HERO BONUSES - EXTRACTED FROM GAME DATA
    // Heroes with march size bonuses organized by council position
    // ============================================
    heroes: {
        // Position definitions with default bonus curves
        positions: {
            hand: { name: "Hand", icon: "🖐️" },
            war: { name: "Master of War", icon: "⚔️" },
            coin: { name: "Master of Coin", icon: "🪙" },
            whispers: { name: "Master of Whispers", icon: "🕷️" },
            law: { name: "Master of Law", icon: "⚖️" },
            ships: { name: "Master of Ships", icon: "⛵" },
            commander: { name: "Lord Commander", icon: "🛡️" },
            maester: { name: "Grand Maester", icon: "📜" },
            march: { name: "March", icon: "🏃" }
        },
        
        // Hero quality progressions - flat march capacity by level and quality
        // These are base march capacity bonuses that all heroes of a quality provide
        // prog_heroskill_march_capacity_[quality]_1 from game data
        qualityProgressions: {
            // Uncommon heroes - max level 30 (70 values in game, but capped at 30 for uncommon)
            uncommon: {
                maxLevel: 30,
                // Values at each level (0-indexed, so level 1 = index 0)
                marchCapacity: [100, 105, 110, 116, 122, 128, 134, 141, 148, 155, 163, 171, 180, 189, 198, 208, 218, 229, 241, 253, 265, 279, 293, 307, 323, 339, 356, 373, 392, 412]
            },
            // Rare heroes - max level 40
            rare: {
                maxLevel: 40,
                marchCapacity: [200, 210, 220, 232, 243, 255, 268, 281, 295, 310, 326, 342, 359, 377, 396, 416, 437, 458, 481, 505, 531, 557, 585, 614, 645, 677, 711, 747, 784, 823, 864, 908, 953, 1001, 1051, 1103, 1158, 1216, 1277, 1341]
            },
            // Heroic/Exquisite heroes - max level 50
            exquisite: {
                maxLevel: 50,
                marchCapacity: [300, 315, 331, 347, 365, 383, 402, 422, 443, 465, 489, 513, 539, 566, 594, 624, 655, 688, 722, 758, 796, 836, 878, 921, 968, 1016, 1067, 1120, 1176, 1235, 1297, 1361, 1429, 1501, 1576, 1655, 1738, 1824, 1916, 2011, 2112, 2218, 2328, 2445, 2567, 2696, 2830, 2972, 3120, 3276]
            },
            // Mythic heroes - max level 60
            mythic: {
                maxLevel: 60,
                marchCapacity: [400, 420, 441, 463, 486, 511, 536, 563, 591, 621, 652, 684, 718, 754, 792, 832, 873, 917, 963, 1011, 1061, 1114, 1170, 1229, 1290, 1355, 1422, 1493, 1568, 1646, 1729, 1815, 1906, 2001, 2101, 2206, 2317, 2433, 2554, 2682, 2816, 2957, 3105, 3260, 3423, 3594, 3774, 3962, 4161, 4369, 4587, 4816, 5057, 5310, 5575, 5854, 6147, 6454, 6777, 7116]
            },
            // Legendary heroes - max level 60 (game has 70 levels but we cap at 60)
            legendary: {
                maxLevel: 60,
                marchCapacity: [500, 525, 551, 579, 608, 638, 670, 704, 739, 776, 814, 855, 898, 943, 990, 1039, 1091, 1146, 1203, 1263, 1327, 1393, 1463, 1536, 1613, 1693, 1778, 1867, 1960, 2058, 2161, 2269, 2382, 2502, 2627, 2758, 2896, 3041, 3193, 3352, 3520, 3696, 3881, 4075, 4279, 4493, 4717, 4953, 5201, 5461, 5734, 6020, 6321, 6637, 6969, 7318, 7684, 8068, 8471, 8895]
            }
        },
        
        // Heroes list with march size bonuses by position
        // Each hero has: name, img, positions they can fill, and council march size bonuses
        // councilMarchSize: { type: 'flat' or 'pct', unlockLevel: N, value: V }
        // The bonus activates when hero level >= unlockLevel
        // NOTE: All 114 heroes can be assigned to council - march size data to be added as verified
        heroList: {
            // HAND position heroes (with council march size)
            cristoncole: {
                name: "Criston Cole",
                title: "The Kingmaker",
                img: "heroes/cristoncole.png",
                positions: ["hand"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill at level 50: +3,280 flat march size (March Size vs Player Owned SoP)
                councilMarchSize: { type: 'flat', unlockLevel: 50, value: 3280 }
            },
            tyrion: {
                name: "Tyrion",
                title: "Hand of the King",
                img: "heroes/tyrion_b.png",
                positions: ["hand"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 7 at level 50: +1,606 flat march size (MaxMarchSizeVsSOP)
                councilMarchSize: { type: 'flat', unlockLevel: 50, value: 1606 }
            },
            
            // MASTER OF WAR heroes (with council march size)
            leaf: {
                name: "Leaf",
                title: "Child of the Forest",
                img: "heroes/leaf.png",
                positions: ["war"],
                maxLevel: 50,
                quality: "exquisite",
                // Council skill 6 at level 40: +2,203 flat march size (MaxMarchSizeVsSOP)
                councilMarchSize: { type: 'flat', unlockLevel: 40, value: 2203 }
            },
            
            // MASTER OF COIN heroes (with council march size)
            euron: {
                name: "Euron Greyjoy",
                title: "King of Salt and Rock",
                img: "heroes/euron_b.png",
                positions: ["coin"],
                maxLevel: 50,
                quality: "exquisite",
                // Council skill 5 at level 30: +2,624 flat march size (MarchSizeVsPlayerSeatofPower)
                councilMarchSize: { type: 'flat', unlockLevel: 30, value: 2624 }
            },
            
            // MASTER OF LAW heroes (with council march size)
            waif: {
                name: "The Waif",
                title: "Faceless Disciple",
                img: "heroes/waif.png",
                positions: ["law"],
                maxLevel: 50,
                quality: "exquisite",
                // Council skill 5 at level 30: +6.56% Max March Size Percent
                councilMarchSize: { type: 'pct', unlockLevel: 30, value: 6.56 }
            },
            alicent: {
                name: "Alicent Hightower",
                title: "Dowager Queen",
                img: "heroes/alicent_b.png",
                positions: ["law"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 4 at level 30: +2,020 flat march size
                councilMarchSize: { type: 'flat', unlockLevel: 30, value: 2020 }
            },
            corlys: {
                name: "Corlys Velaryon",
                title: "The Sea Snake",
                img: "heroes/corlys.png",
                positions: ["law"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 4 at level 20: +2,387 flat march size (MarchSizeVsPlayer)
                councilMarchSize: { type: 'flat', unlockLevel: 20, value: 2387 }
            },
            
            // MASTER OF SHIPS heroes (with council march size)
            jaqen: {
                name: "Jaqen H'ghar",
                title: "Servant of Many-Faced God",
                img: "heroes/jaqen_b.png",
                positions: ["ships"],
                maxLevel: 50,
                quality: "exquisite",
                // Council skill 6 at level 40: +3,084 flat march size (MarchSizeVsPlayer)
                councilMarchSize: { type: 'flat', unlockLevel: 40, value: 3084 }
            },
            
            // LORD COMMANDER heroes (with council march size)
            aemond: {
                name: "Aemond Targaryen",
                title: "The Kinslayer",
                img: "heroes/aemond.png",
                positions: ["commander"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 5 at level 30: +3,075 flat march size (MaxMarchSizeVsSOP)
                councilMarchSize: { type: 'flat', unlockLevel: 30, value: 3075 }
            },
            yaraQueen: {
                name: "Yara Greyjoy",
                title: "Queen of the Iron Islands",
                img: "heroes/yara_b.png",
                positions: ["commander"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 3 at level 20: +1,148 flat march size
                councilMarchSize: { type: 'flat', unlockLevel: 20, value: 1148 }
            },
            gwayne: {
                name: "Gwayne Hightower",
                img: "heroes/gwayne.png",
                positions: ["commander"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 7 at level 60: +3,018 flat march size
                councilMarchSize: { type: 'flat', unlockLevel: 60, value: 3018 }
            },
            
            // GRAND MAESTER heroes (with council march size)
            viserys: {
                name: "Viserys Targaryen",
                title: "The Wise King",
                img: "heroes/viserys.png",
                positions: ["maester"],
                maxLevel: 60,
                quality: "legendary",
                // Council skill 5 at level 30: +2,525 flat march size (MaxMarchSizeVsSOP)
                councilMarchSize: { type: 'flat', unlockLevel: 30, value: 2525 }
            }
            // NOTE: Only heroes with council march size bonuses (skills 3-8) are listed
            // Signature skills (1-2) are for marcher only and not included
            // Reinforcing march size heroes (Jon Snow, Missandei) are NOT included
            // Data verified from protobuf binary files
        }
    },

    // ============================================
    // ARMORY BONUSES
    // Each armory provides march size bonuses based on level
    // Standard: 168-216 levels, 1.269K - 1.884K each
    // Trinket: 105+ levels, 643+ each
    // Dragon: 126+ levels, 800+ each
    // ============================================
    armories: {
        // Standard Armories (0-236 level range, max 2,167 march size)
        standard: {
            stark: { name: "Stark", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            faithMilitant: { name: "Faith Militant", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            braavosi: { name: "Braavosi", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            siegeEngineer: { name: "Siege Engineer", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            battleScarred: { name: "Battle-Scarred", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            tyrell: { name: "Tyrell", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            blackwater: { name: "Blackwater", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            lostRanger: { name: "Lost Ranger", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            keepArchitect: { name: "Keep Architect", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            drownedDisciple: { name: "Drowned Disciple", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            laughingKnight: { name: "Laughing Knight", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            targRoyal: { name: "Targ Royal", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            festivalCarouser: { name: "Festival Carouser", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            thenn: { name: "Thenn", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            ceremonial: { name: "Ceremonial", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            frozenStark: { name: "Frozen Stark", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            oneEyedPrince: { name: "One Eyed Prince", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 },
            nightsWatch: { name: "Night's Watch", type: "standard", minLevel: 0, maxLevel: 236, minMS: 0, maxMS: 2167 }
        },
        // Trinket Armories (0-150 level range, max 854 march size)
        trinket: {
            mormontHeirlooms: { name: "Mormont Heirlooms", type: "trinket", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 854 },
            lannisterHeirlooms: { name: "Lannister Heirlooms", type: "trinket", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 854 },
            artifactsRhllor: { name: "Artifacts R'hllor", type: "trinket", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 854 },
            artifactsWinter: { name: "Artifacts Winter", type: "trinket", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 854 },
            northernArtifacts: { name: "Northern Artifacts", type: "trinket", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 854 },
            ancientOrders: { name: "Ancient Order's", type: "trinket", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 854 }
        },
        // Dragon Armories (0-150 level range, max 895 march size)
        // Ordered by game season (newest first)
        dragon: {
            tarnishedSeafarer: { name: "Tarnished Seafarer", type: "dragon", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 895 },
            tideBreaker: { name: "Tide Breaker", type: "dragon", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 895 },
            regalSerpent: { name: "Regal Serpent", type: "dragon", minLevel: 0, maxLevel: 150, minMS: 0, maxMS: 895 }
        }
    },

    // ============================================
    // BUILDING BONUSES - EXTRACTED FROM GAME DATA
    // prog_Castle_MaxMarchSize and prog_TrainingYard_MaxMarchSize
    // ============================================
    buildings: {
        keep: {
            name: "Keep",
            description: "Main building providing base march size",
            levels: {
                1: { marchSize: 1100 }, 2: { marchSize: 1900 }, 3: { marchSize: 2700 }, 4: { marchSize: 3500 },
                5: { marchSize: 4300 }, 6: { marchSize: 5100 }, 7: { marchSize: 5900 }, 8: { marchSize: 6700 },
                9: { marchSize: 7500 }, 10: { marchSize: 8300 }, 11: { marchSize: 9100 }, 12: { marchSize: 9900 },
                13: { marchSize: 10700 }, 14: { marchSize: 11500 }, 15: { marchSize: 12300 }, 16: { marchSize: 13100 },
                17: { marchSize: 13900 }, 18: { marchSize: 14700 }, 19: { marchSize: 15500 }, 20: { marchSize: 16300 },
                21: { marchSize: 17100 }, 22: { marchSize: 17900 }, 23: { marchSize: 18700 }, 24: { marchSize: 19500 },
                25: { marchSize: 20300 }, 26: { marchSize: 21100 }, 27: { marchSize: 21900 }, 28: { marchSize: 22700 },
                29: { marchSize: 23500 }, 30: { marchSize: 24300 }, 31: { marchSize: 25500 }, 32: { marchSize: 26700 },
                33: { marchSize: 28500 }, 34: { marchSize: 29700 }, 35: { marchSize: 32700 }, 36: { marchSize: 33900 },
                37: { marchSize: 35100 }, 38: { marchSize: 36900 }, 39: { marchSize: 38100 }, 40: { marchSize: 41100 }
            }
        },
        trainingYard: {
            name: "Training Yard",
            description: "Training facility providing march size bonus",
            levels: {
                1: { marchSize: 1900 }, 2: { marchSize: 3100 }, 3: { marchSize: 4300 }, 4: { marchSize: 5500 },
                5: { marchSize: 6700 }, 6: { marchSize: 7900 }, 7: { marchSize: 9100 }, 8: { marchSize: 10300 },
                9: { marchSize: 11500 }, 10: { marchSize: 12700 }, 11: { marchSize: 13900 }, 12: { marchSize: 15100 },
                13: { marchSize: 16300 }, 14: { marchSize: 17500 }, 15: { marchSize: 18700 }, 16: { marchSize: 19900 },
                17: { marchSize: 21100 }, 18: { marchSize: 22300 }, 19: { marchSize: 23500 }, 20: { marchSize: 24700 },
                21: { marchSize: 25900 }, 22: { marchSize: 27100 }, 23: { marchSize: 28300 }, 24: { marchSize: 29500 },
                25: { marchSize: 30700 }, 26: { marchSize: 31900 }, 27: { marchSize: 33100 }, 28: { marchSize: 34300 },
                29: { marchSize: 35500 }, 30: { marchSize: 36700 }, 31: { marchSize: 38100 }, 32: { marchSize: 39500 },
                33: { marchSize: 41250 }, 34: { marchSize: 42650 }, 35: { marchSize: 45100 }, 36: { marchSize: 46500 },
                37: { marchSize: 47900 }, 38: { marchSize: 49650 }, 39: { marchSize: 51050 }, 40: { marchSize: 53500 }
            }
        }
    },

    // ============================================
    // ENHANCEMENT BONUSES
    // ============================================
    enhancements: {
        greatHall: {
            name: "Great Hall",
            description: "Enhancement providing march size bonus",
            minLevel: 16,
            maxLevel: 25,
            levels: {
                16: { marchSize: 152 },
                17: { marchSize: 500 },
                18: { marchSize: 1000 },
                19: { marchSize: 1500 },
                20: { marchSize: 2000 },
                21: { marchSize: 2700 },
                22: { marchSize: 3500 },
                23: { marchSize: 4000 },
                24: { marchSize: 4500 },
                25: { marchSize: 5000 }
            }
        },
        watchtower: {
            name: "Watchtower",
            description: "Enhancement providing march size bonus",
            minLevel: 11,
            maxLevel: 20,
            levels: {
                11: { marchSize: 76 },
                12: { marchSize: 300 },
                13: { marchSize: 600 },
                14: { marchSize: 900 },
                15: { marchSize: 1200 },
                16: { marchSize: 1500 },
                17: { marchSize: 1800 },
                18: { marchSize: 2100 },
                19: { marchSize: 2300 },
                20: { marchSize: 2500 }
            }
        },
        keepMarchSizePct: {
            name: "Keep (March Size %)",
            description: "Keep enhancement at level 40 providing percentage bonus",
            levels: {
                40: { marchSizePct: 8.0 }
            }
        }
    },

    // ============================================
    // RESEARCH BONUSES - EXTRACTED FROM GAME DATA
    // Slider-based: each level adds incremental march size
    // ============================================
    research: {
        // Military I
        command: {
            name: "Command",
            maxLevel: 3,
            maxMarchSize: 6000,
            perLevel: 2000  // 2000 per level: 2000, 4000, 6000
        },
        command2: {
            name: "Command II",
            maxLevel: 5,
            maxMarchSize: 10000,
            perLevel: 2000  // 2000 per level: 2000, 4000, 6000, 8000, 10000
        },
        command3: {
            name: "Command III",
            maxLevel: 7,
            maxMarchSize: 14000,
            perLevel: 2000  // 2000 per level: 2000, 4000, 6000, 8000, 10000, 12000, 14000
        },
        // Military II
        armyExpertise: {
            name: "Command of Army Expertise",
            maxLevel: 4,
            maxMarchSize: 10000,
            perLevel: 2500  // 2500 per level: 2500, 5000, 7500, 10000
        },
        armyExpertise2: {
            name: "Command of Army Expertise II",
            maxLevel: 4,
            maxMarchSize: 10000,
            perLevel: 2500  // 2500 per level: 2500, 5000, 7500, 10000
        },
        sopMarchSize: {
            name: "March Size vs. SoP",
            maxLevel: 5,
            maxMarchSize: 1250,
            perLevel: 250  // 250 per level: 250, 500, 750, 1000, 1250
        },
        sopMarchSize2: {
            name: "March Size vs. SoP II",
            maxLevel: 5,
            maxMarchSize: 1250,
            perLevel: 250  // 250 per level: 250, 500, 750, 1000, 1250
        },
        // Advanced Military
        troopSurge1: {
            name: "Troop Surge I",
            maxLevel: 3,
            maxMarchSize: 750,
            perLevel: 250  // 250 per level: 250, 500, 750
        },
        troopSurge2: {
            name: "Troop Surge II",
            maxLevel: 5,
            maxMarchSize: 2500,
            perLevel: 500  // 500 per level: 500, 1000, 1500, 2000, 2500
        },
        troopSurge3: {
            name: "Troop Surge III",
            maxLevel: 5,
            maxMarchSize: 2500,
            perLevel: 500  // 500 per level: 500, 1000, 1500, 2000, 2500
        }
    },

    // ============================================
    // DRAGON TALENTS
    // ============================================
    dragonTalents: {
        adolescent: {
            name: "Adolescent Dragon",
            talents: {
                1: { marchSize: 1000 },
                5: { marchSize: 3000 },
                10: { marchSize: 6000 },
                15: { marchSize: 10000 },
                20: { marchSize: 15000 }
            }
        },
        adult: {
            name: "Adult Dragon",
            talents: {
                1: { marchSize: 2000, marchSizePct: 0.5 },
                5: { marchSize: 5000, marchSizePct: 1.0 },
                10: { marchSize: 10000, marchSizePct: 1.5 },
                15: { marchSize: 18000, marchSizePct: 2.0 },
                20: { marchSize: 30000, marchSizePct: 3.0 }
            }
        }
    },

    // ============================================
    // GEAR MARCH SIZE PROGRESSIONS - EXTRACTED FROM GAME DATA
    // prog_gear_std_MaxMarchSize_* values by quality tier
    // Quality: Poor, Common, Fine, Exquisite, Epic, Legendary
    // ============================================
    gearProgressions: {
        // Standard Gear - Max March Size (prog_gear_std_MaxMarchSize_*)
        standard: {
            5:  { poor: 133, common: 142, fine: 152, exquisite: 161, epic: 171, legendary: 190 },
            15: { poor: 259, common: 277, fine: 296, exquisite: 314, epic: 333, legendary: 370 },
            25: { poor: 385, common: 412, fine: 440, exquisite: 467, epic: 495, legendary: 550 },
            35: { poor: 511, common: 547, fine: 584, exquisite: 620, epic: 657, legendary: 730 },
            40: { poor: 574, common: 615, fine: 656, exquisite: 697, epic: 738, legendary: 820 },
            45: { poor: 637, common: 682, fine: 728, exquisite: 773, epic: 819, legendary: 910 },
            50: { poor: 700, common: 750, fine: 800, exquisite: 850, epic: 900, legendary: 1000 }
        },
        // Event/Seasonal Gear - Max March Size (prog_gear_event1_MaxMarchSize_*)
        event: {
            1:  { poor: 73, common: 78, fine: 84, exquisite: 89, epic: 94, legendary: 105 },
            5:  { poor: 139, common: 149, fine: 159, exquisite: 169, epic: 179, legendary: 199 },
            10: { poor: 205, common: 220, fine: 235, exquisite: 249, epic: 264, legendary: 294 },
            15: { poor: 271, common: 291, fine: 310, exquisite: 330, epic: 349, legendary: 388 },
            20: { poor: 338, common: 362, fine: 386, exquisite: 410, epic: 434, legendary: 483 },
            25: { poor: 404, common: 433, fine: 462, exquisite: 490, epic: 519, legendary: 577 },
            30: { poor: 470, common: 504, fine: 537, exquisite: 571, epic: 604, legendary: 672 },
            35: { poor: 536, common: 574, fine: 613, exquisite: 651, epic: 689, legendary: 766 },
            40: { poor: 602, common: 645, fine: 688, exquisite: 731, epic: 774, legendary: 861 },
            45: { poor: 668, common: 716, fine: 764, exquisite: 812, epic: 859, legendary: 955 },
            50: { poor: 735, common: 787, fine: 840, exquisite: 892, epic: 945, legendary: 1050 }
        },
        // Event/Seasonal Gear - March Size vs Player/SoP (prog_gear_event1_MarchSizeVsPlayer_*)
        eventVsPlayer: {
            5:  { poor: 209, common: 224, fine: 239, exquisite: 254, epic: 269, legendary: 299 },
            10: { poor: 308, common: 330, fine: 352, exquisite: 374, epic: 396, legendary: 441 },
            15: { poor: 407, common: 437, fine: 466, exquisite: 495, epic: 524, legendary: 582 },
            20: { poor: 507, common: 543, fine: 579, exquisite: 615, epic: 652, legendary: 724 },
            25: { poor: 606, common: 649, fine: 693, exquisite: 736, epic: 779, legendary: 866 },
            30: { poor: 705, common: 756, fine: 806, exquisite: 856, epic: 907, legendary: 1008 },
            35: { poor: 804, common: 862, fine: 919, exquisite: 977, epic: 1034, legendary: 1149 },
            40: { poor: 904, common: 968, fine: 1033, exquisite: 1097, epic: 1162, legendary: 1291 },
            45: { poor: 1003, common: 1074, fine: 1146, exquisite: 1218, epic: 1289, legendary: 1433 },
            50: { poor: 1102, common: 1181, fine: 1260, exquisite: 1338, epic: 1417, legendary: 1575 }
        },
        // Queen Mother (Event10.5) - March Size vs Player (highest tier)
        queenMotherVsPlayer: {
            1:  { poor: 266, common: 285, fine: 304, exquisite: 323, epic: 342, legendary: 380 },
            5:  { poor: 506, common: 542, fine: 578, exquisite: 614, epic: 651, legendary: 723 },
            10: { poor: 746, common: 799, fine: 852, exquisite: 906, epic: 959, legendary: 1065 },
            15: { poor: 986, common: 1056, fine: 1126, exquisite: 1197, epic: 1267, legendary: 1408 },
            20: { poor: 1225, common: 1313, fine: 1401, exquisite: 1488, epic: 1576, legendary: 1751 },
            25: { poor: 1465, common: 1570, fine: 1675, exquisite: 1779, epic: 1884, legendary: 2093 },
            30: { poor: 1705, common: 1827, fine: 1949, exquisite: 2071, epic: 2192, legendary: 2436 },
            35: { poor: 1945, common: 2084, fine: 2223, exquisite: 2362, epic: 2501, legendary: 2779 },
            40: { poor: 2185, common: 2341, fine: 2497, exquisite: 2653, epic: 2809, legendary: 3121 },
            45: { poor: 2425, common: 2598, fine: 2771, exquisite: 2944, epic: 3118, legendary: 3464 },
            50: { poor: 2664, common: 2855, fine: 3045, exquisite: 3236, epic: 3426, legendary: 3807 }
        }
    },

    // ============================================
    // ARMORY MARCH SIZE PROGRESSIONS - EXTRACTED FROM GAME DATA
    // Per-level bonus values from game progressions
    // ============================================
    armoryProgressions: {
        // prog_armory_bonus_MarchSize_1 - Standard armory per level (236 levels)
        standard: [0, 6, 7, 8, 11, 13, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 31, 33, 35, 37, 40, 42, 44, 46, 48, 51, 54, 56, 59, 62, 65, 68, 71, 74, 77, 80, 82, 83, 85, 86, 88, 89, 91, 93, 94, 96, 98, 99, 101, 103, 104, 106, 107, 109, 110, 112, 113, 115, 117, 118, 120, 128, 130, 132, 134, 136, 137, 140, 142, 143, 145, 147, 149, 151, 153, 155, 157, 159, 160, 162, 164, 167, 169, 171, 173, 176, 178, 180, 182, 185, 187, 192, 196, 200, 204, 208, 212, 216, 224, 228, 232, 236, 240, 244, 248, 256, 259, 262, 266, 269, 272, 275, 278, 281, 288, 296, 304, 312, 320, 323, 326, 329, 332, 334, 337, 340, 343, 346, 352, 358, 365, 371, 377, 384, 416, 427, 437, 448, 458, 469, 479, 490, 500, 511, 521, 532, 543, 580, 617, 653, 690, 727, 764, 801, 837, 874, 911, 948, 985, 1021, 1058, 1095, 1132, 1169, 1205, 1242, 1257, 1269, 1282, 1295, 1308, 1321, 1333, 1346, 1359, 1372, 1385, 1397, 1410, 1423, 1436, 1449, 1461, 1474, 1487, 1500, 1513, 1525, 1538, 1551, 1564, 1577, 1589, 1602, 1615, 1628, 1641, 1653, 1666, 1679, 1692, 1705, 1717, 1730, 1743, 1756, 1769, 1781, 1794, 1807, 1820, 1833, 1845, 1858, 1871, 1884, 1897, 1909, 1922, 1935, 1948, 1961, 1973, 1986, 2000, 2039, 2052, 2065, 2078, 2091, 2103, 2116, 2129, 2142, 2155, 2167],
        // prog_trinketarmory_bonus_MarchSize_1 - Trinket armory per level (150 levels)
        trinket: [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 13, 14, 16, 18, 20, 21, 23, 24, 26, 28, 29, 31, 33, 34, 36, 38, 41, 43, 46, 48, 51, 53, 56, 58, 61, 63, 64, 65, 67, 68, 69, 76, 78, 80, 81, 83, 85, 86, 88, 90, 92, 95, 98, 100, 103, 106, 108, 111, 114, 117, 120, 123, 125, 128, 131, 135, 136, 138, 143, 151, 155, 161, 166, 172, 177, 183, 188, 194, 199, 205, 210, 216, 221, 227, 233, 238, 244, 249, 255, 260, 266, 272, 277, 288, 321, 328, 331, 350, 357, 379, 470, 497, 518, 528, 643, 646, 649, 652, 655, 658, 660, 663, 666, 669, 672, 675, 678, 681, 683, 686, 689, 692, 695, 698, 701, 704, 706, 709, 712, 715, 718, 721, 724, 726, 729, 732, 735, 738, 741, 744, 747, 758, 773, 784, 796, 807, 819, 831, 842, 854],
        // prog_dragonarmory_bonus_MarchSize_1 - Dragon armory per level (150 levels)
        dragon: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 24, 25, 26, 27, 28, 29, 30, 31, 34, 36, 39, 43, 46, 51, 55, 64, 65, 66, 67, 68, 69, 70, 71, 73, 75, 77, 80, 83, 85, 89, 93, 94, 95, 96, 97, 99, 100, 102, 105, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 119, 121, 124, 126, 129, 132, 135, 138, 142, 146, 149, 154, 158, 163, 167, 172, 187, 188, 190, 193, 197, 201, 206, 212, 219, 227, 235, 244, 253, 268, 272, 279, 289, 301, 316, 334, 355, 378, 401, 404, 409, 415, 424, 435, 447, 461, 476, 493, 512, 542, 569, 613, 676, 755, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 811, 813, 815, 817, 819, 821, 826, 829, 834, 840, 848, 858, 869, 882, 895]
    },

    // ============================================
    // QUALITY TIERS
    // ============================================
    qualities: ["poor", "common", "fine", "exquisite", "epic", "legendary"],
    // ============================================
    // SOP ATTACKER TITLES
    // Title bonuses based on the Seat of Power you hold
    // Community naming: X-Star Attacker vs Seat of Power
    // ============================================
    sopTitles: {
        none: { name: "No Title", stars: 0, marchSize: 0 },
        star2: { name: "2-Star Attacker", stars: 2, marchSize: 108234 },
        star2_5: { name: "2.5-Star Attacker", stars: 2.5, marchSize: 113009 },
        star3: { name: "3-Star Attacker", stars: 3, marchSize: 117147 },
        star3_5: { name: "3.5-Star Attacker", stars: 3.5, marchSize: 120967 },
        star4: { name: "4-Star Attacker", stars: 4, marchSize: 135000 },
        star4_5: { name: "4.5-Star Attacker", stars: 4.5, marchSize: 150000 },
        kl: { name: "KL Attacker", stars: 5, marchSize: 175000 }
    },

    qualityColors: {
        poor: "#9d9d9d",
        common: "#32CD32",
        fine: "#0070DD",
        exquisite: "#A335EE",
        epic: "#FF8000",
        legendary: "#E5CC80"
    },

    // ============================================
    // SCENARIOS
    // ============================================
    scenarios: {
        "ms-vs-sop": {
            name: "March Size vs Seat of Power",
            description: "Attacking or defending Seats of Power",
            icon: "🏰",
            isDragon: false,
            priorityStats: ["marchSize", "attack", "defense"]
        },
        "ms-vs-keep": {
            name: "March Size vs Keep",
            description: "Attacking or defending player keeps",
            icon: "🏯",
            isDragon: false,
            priorityStats: ["marchSize", "attack", "siege"]
        },
        "dragon-vs-sop": {
            name: "Dragon March vs Seat of Power",
            description: "Dragon marches against Seats of Power",
            icon: "🐉",
            isDragon: true,
            priorityStats: ["dragonMarchSize", "dragonAttack", "dragonDefense"]
        },
        "dragon-vs-keep": {
            name: "Dragon March vs Keep",
            description: "Dragon marches against player keeps",
            icon: "🔥",
            isDragon: true,
            priorityStats: ["dragonMarchSize", "dragonAttack", "dragonSiege"]
        },
        "ms-reinforce": {
            name: "March Size vs Reinforcing",
            description: "Reinforcing allies or rallies",
            icon: "🛡️",
            isDragon: false,
            priorityStats: ["marchSize", "defense", "health"]
        },
        "dragon-reinforce": {
            name: "Dragon March vs Reinforcing",
            description: "Dragon reinforcing allies or rallies",
            icon: "⚡",
            isDragon: true,
            priorityStats: ["dragonMarchSize", "dragonDefense", "dragonHealth"]
        }
    },

    // ============================================
    // GEAR SLOTS
    // ============================================
    gearSlots: [
        { id: "helmet", name: "Helmet", icon: "🪖" },
        { id: "chest", name: "Chest", icon: "🦺" },
        { id: "pants", name: "Pants", icon: "👖" },
        { id: "dragonTrinket", name: "Dragon Trinket", icon: "🐉" },
        { id: "boots", name: "Boots", icon: "👢" },
        { id: "ring", name: "Ring", icon: "💍" },
        { id: "weapon", name: "Weapon", icon: "⚔️" },
        { id: "trinket", name: "Trinket", icon: "📿" }
    ]
};

// Helper function to get gear by slot
function getGearBySlot(slot) {
    return MARCH_SIZE_DATA.gear[slot] || {};
}

// Helper function to get gear for scenario
function getGearForScenario(slot, scenario) {
    const slotGear = getGearBySlot(slot);
    const result = {};
    for (const [name, data] of Object.entries(slotGear)) {
        if (data.scenario.includes(scenario)) {
            result[name] = data;
        }
    }
    return result;
}

// Helper function to get hero march size by position and level
function getHeroMarchSizeByPosition(position, level) {
    const positionData = MARCH_SIZE_DATA.heroes.positions[position];
    if (!positionData) return 0;
    
    const levels = Object.keys(positionData.marchSizePct).map(Number).sort((a, b) => a - b);
    let applicableLevel = levels[0];
    
    for (const lvl of levels) {
        if (lvl <= level) {
            applicableLevel = lvl;
        } else {
            break;
        }
    }
    
    return positionData.marchSizePct[applicableLevel] || 0;
}

// Legacy: Helper function to get hero march size at level (for backwards compat)
function getHeroMarchSize(heroName, level) {
    // Try to find in positions first (new structure)
    const positionData = MARCH_SIZE_DATA.heroes.positions[heroName.toLowerCase()];
    if (positionData) {
        return getHeroMarchSizeByPosition(heroName.toLowerCase(), level);
    }
    return 0;
}

// Helper function to get hero's flat march capacity based on quality and level
// This is the base march capacity bonus all heroes of a quality provide
function getHeroMarchCapacity(quality, level) {
    const qualityData = MARCH_SIZE_DATA.heroes.qualityProgressions[quality];
    if (!qualityData) return 0;
    
    // Level is 1-indexed, array is 0-indexed
    const index = Math.max(0, Math.min(level - 1, qualityData.marchCapacity.length - 1));
    return qualityData.marchCapacity[index] || 0;
}

// Helper function to get hero's total march size contribution (capacity + council bonus)
function getHeroTotalMarchSize(heroId, level, baseMarchSize) {
    const hero = MARCH_SIZE_DATA.heroes.heroList[heroId];
    if (!hero) return { capacity: 0, councilFlat: 0, councilPct: 0, pctContribution: 0, total: 0 };
    
    // Get flat march capacity based on quality (this is the base capacity all heroes provide)
    const capacity = getHeroMarchCapacity(hero.quality, level);
    
    // Get council march size bonus (single unlock at specific level)
    let councilFlat = 0;
    let councilPct = 0;
    
    if (hero.councilMarchSize && level >= hero.councilMarchSize.unlockLevel) {
        if (hero.councilMarchSize.type === 'flat') {
            councilFlat = hero.councilMarchSize.value;
        } else if (hero.councilMarchSize.type === 'pct') {
            councilPct = hero.councilMarchSize.value;
        }
    }
    
    // Calculate percentage contribution from council bonus
    const pctContribution = baseMarchSize && councilPct > 0 ? Math.round(baseMarchSize * councilPct / 100) : 0;
    
    return {
        capacity: capacity,
        councilFlat: councilFlat,
        councilPct: councilPct,
        pctContribution: pctContribution,
        total: capacity + councilFlat + pctContribution
    };
}

// Helper function to get building march size at level
function getBuildingMarchSize(buildingId, level) {
    const building = MARCH_SIZE_DATA.buildings[buildingId];
    if (!building) return { marchSize: 0, marchSizePct: 0 };
    
    const levels = Object.keys(building.levels).map(Number).sort((a, b) => a - b);
    let applicableLevel = null;
    
    for (const lvl of levels) {
        if (lvl <= level) {
            applicableLevel = lvl;
        } else {
            break;
        }
    }
    
    if (applicableLevel === null) return { marchSize: 0, marchSizePct: 0 };
    
    const data = building.levels[applicableLevel];
    return {
        marchSize: data.marchSize || 0,
        marchSizePct: data.marchSizePct || 0
    };
}

// Helper function to get armory march size at level
// Uses the exact progression values from the game data
// Note: Game displays level N but uses array[N-1] for actual bonus (off-by-one)
function getArmoryMarchSize(armoryType, armoryId, level) {
    const progressions = MARCH_SIZE_DATA.armoryProgressions;
    if (!progressions || !progressions[armoryType]) return { marchSize: 0 };
    
    const values = progressions[armoryType];
    // Game uses level-1 for lookup (level 211 uses index 210)
    const index = Math.max(0, level - 1);
    if (index < 0) return { marchSize: 0 };
    if (index >= values.length) return { marchSize: values[values.length - 1] };
    
    return { marchSize: values[index] || 0 };
}

// Helper function to get enhancement march size at level
function getEnhancementMarchSize(enhancementId, level) {
    const enhancement = MARCH_SIZE_DATA.enhancements[enhancementId];
    if (!enhancement) return { marchSize: 0, marchSizePct: 0 };
    
    const levels = Object.keys(enhancement.levels).map(Number).sort((a, b) => a - b);
    let applicableLevel = null;
    
    for (const lvl of levels) {
        if (lvl <= level) {
            applicableLevel = lvl;
        } else {
            break;
        }
    }
    
    if (applicableLevel === null) return { marchSize: 0, marchSizePct: 0 };
    
    const data = enhancement.levels[applicableLevel];
    return {
        marchSize: data.marchSize || 0,
        marchSizePct: data.marchSizePct || 0
    };
}

// Helper function to get gear march size based on level and quality
// Uses extracted game progression data
function getGearMarchSizeByLevelQuality(gearLevel, quality) {
    const progressions = MARCH_SIZE_DATA.gearProgressions;
    if (!progressions) return 0;
    
    // Determine which progression tier to use based on gear level
    const tiers = Object.keys(progressions).map(Number).sort((a, b) => a - b);
    let applicableTier = tiers[0];
    
    for (const tier of tiers) {
        if (tier <= gearLevel) {
            applicableTier = tier;
        } else {
            break;
        }
    }
    
    const tierData = progressions[applicableTier];
    if (!tierData) return 0;
    
    return tierData[quality] || tierData.common || 0;
}

// Helper function to get armory march size by type and level
// Uses extracted game progression data
// Note: Game uses level-1 for lookup (off-by-one adjustment)
function getArmoryMarchSizeByLevel(armoryType, level) {
    const progressions = MARCH_SIZE_DATA.armoryProgressions;
    if (!progressions || !progressions[armoryType]) return 0;
    
    const values = progressions[armoryType];
    // Game uses level-1 for lookup
    const index = Math.max(0, level - 1);
    if (index < 0) return 0;
    if (index >= values.length) return values[values.length - 1];
    
    return values[index] || 0;
}

// ============================================
// EXACT GEAR LOOKUP FROM GEAR_DATABASE
// Maps ms-data.js gear names to gear-database.js internal IDs
// for 100% accurate march size calculations
// ============================================

const GEAR_NAME_TO_DB_ID = {
    // Queen Mother (Season 10)
    "Queen Mother Vestments": "alicent",
    
    // Golden Rose (Season 12)
    "Golden Rose": "margaery",
    
    // Frostfang Thenn (Season 12) 
    "Frostfang Thenn": "oldnan5",
    
    // Valyrian Kingsguard (Season 13)
    "Val. Kingsguard": "kingsguard3",
    
    // Targaryen Kingsguard (Season 9)
    "Targ. Kingsguard": "kingsguard2",
    
    // Burning Usurper (Season 12)
    "Burning Usurper": "baratheon4",
    
    // Flame Reaver / Flame Wreathed Reaver (Season 11)
    "Flame Reaver": "yara2",
    
    // Frost Ranger / Frostbitten Ranger (Season 11)
    "Frost Ranger": "oldnan4",
    
    // GreenFyre / Greenfyre Captain (Season 11)
    "GreenFyre": "conquest6",
    
    // Chilled Corsair (Season 12)
    "Chilled Corsair": "velaryon2",
    
    // Dragonflame Warrior (Season 12)
    "Dragonflame Warrior": "freedom3",
    
    // Northern Noble / Northern Guardian (Early season)
    "Northern Noble": "stark"
};

/**
 * Get exact march size stats from GEAR_DATABASE for a specific gear piece
 * @param {string} gearName - The display name from ms-data.js
 * @param {string} slot - The gear slot (helmet, chest, pants, weapon, ring, boots)
 * @param {string} levelKey - Level key like "L40", "L45", "L50"
 * @param {string} quality - Quality like "legendary", "epic", "exquisite", etc.
 * @returns {object} { flat: number, pct: number } - Exact march size values
 */
function getExactGearMarchSize(gearName, slot, levelKey, quality) {
    // Check if GEAR_DATABASE is available
    if (typeof GEAR_DATABASE === 'undefined') {
        console.warn('GEAR_DATABASE not loaded, using multiplier fallback');
        return null;
    }
    
    // Get database ID for this gear
    const dbId = GEAR_NAME_TO_DB_ID[gearName];
    if (!dbId) {
        // console.log('No DB mapping for:', gearName);
        return null;
    }
    
    // Get gear from database
    const gearSet = GEAR_DATABASE.lord_gear[dbId];
    if (!gearSet || !gearSet.slots || !gearSet.slots[slot]) {
        // console.log('Gear not found in DB:', dbId, slot);
        return null;
    }
    
    const slotData = gearSet.slots[slot];
    const stats = slotData.stats || {};
    
    // Calculate total flat march size (maxmarchsize + marchsizevsplayer + maxmarchsizevssop for SoP)
    let flat = 0;
    let pct = 0;
    
    // Get maxmarchsize (universal flat bonus)
    if (stats.maxmarchsize && stats.maxmarchsize[levelKey] && stats.maxmarchsize[levelKey][quality] !== undefined) {
        flat += stats.maxmarchsize[levelKey][quality];
    }
    
    // Get marchsizevsplayer (PvP flat bonus - also applies to SoP)
    if (stats.marchsizevsplayer && stats.marchsizevsplayer[levelKey] && stats.marchsizevsplayer[levelKey][quality] !== undefined) {
        flat += stats.marchsizevsplayer[levelKey][quality];
    }
    
    // Get maxmarchsizevssop (SoP-specific flat bonus)
    if (stats.maxmarchsizevssop && stats.maxmarchsizevssop[levelKey] && stats.maxmarchsizevssop[levelKey][quality] !== undefined) {
        flat += stats.maxmarchsizevssop[levelKey][quality];
    }
    
    // Get maxmarchsizepercent (percentage bonus) - stored as decimal (0.04 = 4%)
    if (stats.maxmarchsizepercent && stats.maxmarchsizepercent[levelKey] && stats.maxmarchsizepercent[levelKey][quality] !== undefined) {
        pct = stats.maxmarchsizepercent[levelKey][quality] * 100; // Convert to percentage
    }
    
    return { flat, pct };
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MARCH_SIZE_DATA = MARCH_SIZE_DATA;
    window.getGearBySlot = getGearBySlot;
    window.getGearForScenario = getGearForScenario;
    window.getHeroMarchSize = getHeroMarchSize;
    window.getHeroMarchSizeByPosition = getHeroMarchSizeByPosition;
    window.getHeroMarchCapacity = getHeroMarchCapacity;
    window.getHeroTotalMarchSize = getHeroTotalMarchSize;
    window.getBuildingMarchSize = getBuildingMarchSize;
    window.getArmoryMarchSize = getArmoryMarchSize;
    window.getEnhancementMarchSize = getEnhancementMarchSize;
    window.getGearMarchSizeByLevelQuality = getGearMarchSizeByLevelQuality;
    window.getArmoryMarchSizeByLevel = getArmoryMarchSizeByLevel;
    window.GEAR_NAME_TO_DB_ID = GEAR_NAME_TO_DB_ID;
    window.getExactGearMarchSize = getExactGearMarchSize;
}

