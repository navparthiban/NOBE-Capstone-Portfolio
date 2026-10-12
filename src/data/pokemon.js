import bisharp from '../assets/sprites/animated-front-bisharp.gif'
import hypno from '../assets/sprites/animated-front-hypno.gif'
import watchog from '../assets/sprites/animated-front-watchog.gif'

export const recruiterTeam = [
  {
    name: 'WATCHOG',
    level: 20,
    maxHp: 40,
    sprite: watchog,
    attack: { name: 'Interview', damage: 10 },
  },
  {
    name: 'HYPNO',
    level: 25,
    maxHp: 50,
    sprite: hypno,
    attack: { name: 'Coding Test', damage: 12 },
  },
  {
    name: 'BISHARP',
    level: 30,
    maxHp: 60,
    sprite: bisharp,
    attack: { name: 'Negotiate', damage: 14 },
  },
]
