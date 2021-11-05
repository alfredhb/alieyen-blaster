# Events Emitted During Levels and associated parameters passed with them
*please update this with new events when they're created*

## **Win / Lose Conditions**

### *playerdead*
* emitted when lives of player reach 0

### *startleveltimer*
* emitted by template-level to begin the level timer

### *leveltimerover*
* emitted when the level timer reaches 0

### *playerhit* ( damage )
* emitted by an alien who successfully charged an attack and said attack has reached
the player's hud
* **damage**: { number } - How many lives this attack should remove


## **Powerups**

### *healplayer* ( health )
* emitted by a health powerup when hit. This should recharge player health up to current +
health, or maximum whichever is lower.
* **health**: { number } - How many lives player should heal

### *giveshield*
* emitted by a shield powerup when hit. This should provide the player with a shield
if they currently don't have one. Shields block the next attack no matter the damage
and then break
