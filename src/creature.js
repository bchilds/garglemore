import constants from './constants';
import archetypes from './archetypes'
import getStats from './stats'

function genCreatureStats(level, type) {
  let stats =  getStats(level, archetypes[type].modifiers)
  stats.health = stats.health / 2;
  stats.attack = stats.attack / 2;
  return stats;
}

export default class Creature{
  constructor(scene, x, y, level, type) {
    let stats = genCreatureStats(level, type)

    this.archetype = archetypes[type]
    this.tint = this.archetype.color
    this.scene 	= scene;
    this.stats 	= stats;
    this.scale 	= this.getScaleFromStats(stats);
    this.isRendered = false;
    this.initialCoords = { x, y };
    this.uniqueId = Math.random(); // lolol "unique"
  }
  
  renderSelf() {
    const { x, y } = this.initialCoords;
    this.sprite = this.scene.physics.add.sprite(x, y, 'zombie');
    this.sprite.setScale(this.scale);
    this.sprite.setTint(this.tint)
    this.isRendered = true;
    this.sprite.uniqueId = this.uniqueId;
  }

  getScaleFromStats(statVals){
    let statSum = 0.0;

    for(let statName in statVals){
      let statRatio = statVals[statName] / constants.baseStatValue
      if(statName == 'speed')
      {
        statRatio = statVals[statName] / constants.monsterBaseSpeed
        statRatio = 1 - statRatio;
      }

      statSum = statSum + statRatio;
    }

    return statSum + 1;
  }

  moveInDirection(vector) {
    if (!this.sprite) return;    
    vector = vector.scale(this.getSpeedInPx())
    this.sprite.setVelocityX(vector.x)
    this.sprite.setVelocityY(vector.y)
  }

  moveTowards(renderObj){
    if (!this.sprite) return;
    let pxSpeed = this.getSpeedInPx();
    this.scene.physics.moveToObject(this.sprite, renderObj, pxSpeed);
    this.animateMovement(renderObj);
  }

  damage(attackDamage){
    if(this.stats.health < 0){
      return
    }

    this.stats.health = this.stats.health - attackDamage
  }

  deleteCollider(){
    if(!this.collider){
      return
    }

    this.collider.destroy()
    this.collider = null
  }

  animateMovement(renderObj){
    let direction = this.getMovementDirection(renderObj);
    this.sprite.anims.play('zombie-' + direction, true);
  }

  getMovementDirection(renderObj){
    let deltaX = renderObj.x - this.sprite.x;
    let deltaY = renderObj.y - this.sprite.y;

    if(Math.abs(deltaX) <= Math.abs(deltaY) && deltaY < 0){
      return 'up';
    }

    if(Math.abs(deltaX) <= Math.abs(deltaY) && deltaY > 0){
      return 'down';
    }

    if (Math.abs(deltaY) <= Math.abs(deltaX) && deltaX > 0) {
      return 'right';
    }

    if (Math.abs(deltaY) <= Math.abs(deltaX) && deltaX < 0) {
      return 'left';
    }

    return 'down';
  }

  getSpeedInPx(){
    const SPEED_UNIT_PX = constants.monsterBaseSpeed;

    return this.getSpeed() * SPEED_UNIT_PX;
  }

  getSpeed(){
    return Phaser.Math.Clamp(this.stats.speed, 0.2, 0.6);
  }

  isHealthy() {
    return this.stats.health > 0;
  }
}
