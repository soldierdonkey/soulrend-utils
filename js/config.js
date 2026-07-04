// Preset drafting variables
const templates = {
    feral: `§4§lWARNING: §cThis origin binds you to a curse of eternal violence. It is an extremely high-skill, glass-cannon archetype designed for players who survive by absolute aggression and relentless positioning. Stand still, and you die.§r

§e§lVelocity-Driven Slaughter§r
§7Your physical damage is tied directly to your momentum. Moving at peak speeds grants a staggering §a§l+150%§r §7damage bonus. However, if you are stopped, trapped, or cornered, your muscle groups seize, inflicting a devastating §c§l-50%§r §7damage penalty. Every strike must be delivered mid-sprint or mid-dash.§r

§4§lThe Price of Hesitation§r
§7Swinging blindly at the air will tear your body apart. Missing an Epic Fight attack while moving at high velocities causes an immediate self-harm rupture, detonating your flesh for §c§l20% of your maximum health§r §7and dropping your movement speed by §c§l-90%§r §7for nearly a second. Focus your gaze; every whiff is an open invitation to your own execution.§r

§a§lGorging on the Slain§r
§7You cannot eat normal food—your hunger is locked at a baseline starvation limit. Instead, killing any living creature forces you to automatically devour their essence, instantly restoring your food levels to §e18 points§r §7and saturating your energy reserves. Slaking your thirst with the blood of monsters additionally rewards you with §a§l19x Bonus Experience§r§7.§r

§b§lFrenzied Momentum§r
§7Spawning into the world manifests the un-droppable §eNightfall Claws§r §7directly into your inventory. Landing successful strikes on targets freezes your speed decay, grants a brief grace period to maintain your momentum bar, and floods your veins with a stacking §4Strength§r §7buff that caps at §cLevel IX§r§7. Furthermore, land a hit, and your current movement speed instantly amplifies by §b+40%§r§7.§r

§c§lThe Hunted Hunter§r
§7Every 2.5 seconds, your animalistic aura emits a psychic scream, forcing all hostile entities within a massive §e128-block radius§r §7to break their pathfinding and ruthlessly lock onto your position. You cannot hide, you cannot sneak, and you will perpetually face the full, unbridled wrath of the world.§r`
};

// Standard Minecraft hex color mapping configurations
const mcColors = {
    '0': '#000000', '1': '#0000aa', '2': '#00aa00', '3': '#00aaaa',
    '4': '#aa0000', '5': '#aa00aa', '6': '#ffaa00', '7': '#aaaaaa',
    '8': '#555555', '9': '#5555ff', 'a': '#55ff55', 'b': '#55ffff',
    'c': '#ff5555', 'd': '#ff55ff', 'e': '#ffff55', 'f': '#ffffff'
};

// Parchment configurations designed to contrast smoothly on sepia/light themes
const parchmentColors = {
    '0': '#1a0000', '1': '#000066', '2': '#005500', '3': '#005555',
    '4': '#800000', '5': '#660066', '6': '#aa6600', '7': '#444444',
    '8': '#222222', '9': '#0000aa', 'a': '#008800', 'b': '#008888',
    'c': '#bb2222', 'd': '#880088', 'e': '#888800', 'f': '#ffffff'
};