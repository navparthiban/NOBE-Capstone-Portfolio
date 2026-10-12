import backPorygon from '../assets/sprites/animated-back-porygon.gif'
import frontPorygon from '../assets/sprites/static-front-porygon.png'
import backElectrode from '../assets/sprites/animated-back-electrode.gif'
import frontElectrode from '../assets/sprites/static-front-electrode.png'
import backAlakazam from '../assets/sprites/animated-back-alakazam.gif'
import frontAlakazam from '../assets/sprites/static-front-alakazam.png'
import backMeowth from '../assets/sprites/animated-back-meowth.gif'
import frontMeowth from '../assets/sprites/static-front-meowth.png'
import backChansey from '../assets/sprites/animated-back-chansey.gif'
import frontChansey from '../assets/sprites/static-front-chansey.png'
import backMagneton from '../assets/sprites/animated-back-magneton.gif'
import frontMagneton from '../assets/sprites/static-front-magneton.png'

export const party = [
  {
    name: 'PORYGON',
    level: 18,
    hp: 60,
    maxHp: 60,
    sprite: frontPorygon,
    backSprite: backPorygon,
    experience: 'ClearSign',
    type: 'Project',
    role: 'Developer',
    description: 'A web app that turns long, confusing legal contracts into plain language.',
  },
  {
    name: 'ELECTRODE',
    level: 22,
    hp: 70,
    maxHp: 70,
    sprite: frontElectrode,
    backSprite: backElectrode,
    experience: 'SCARF Research',
    type: 'Research',
    role: 'Researcher',
    description: 'Research on inherited arrhythmias, heart rhythm conditions that run in families.',
  },
  {
    name: 'ALAKAZAM',
    level: 26,
    hp: 55,
    maxHp: 55,
    sprite: frontAlakazam,
    backSprite: backAlakazam,
    experience: 'Mathnasium',
    type: 'Work',
    role: 'Math Instructor',
    description: 'Teaching math to students as an instructor at Mathnasium.',
  },
  {
    name: 'MEOWTH',
    level: 20,
    hp: 50,
    maxHp: 50,
    sprite: frontMeowth,
    backSprite: backMeowth,
    experience: 'DECA Marketing Campaign',
    type: 'Competition',
    role: 'Campaign Member',
    description: 'A marketing campaign for DECA that placed in the top 10 at state.',
  },
  {
    name: 'CHANSEY',
    level: 16,
    hp: 90,
    maxHp: 90,
    sprite: frontChansey,
    backSprite: backChansey,
    experience: 'Edward Hospital',
    type: 'Volunteer',
    role: 'Volunteer',
    description: 'Volunteering at Edward Hospital.',
  },
  {
    name: 'MAGNETON',
    level: 24,
    hp: 65,
    maxHp: 65,
    sprite: frontMagneton,
    backSprite: backMagneton,
    experience: 'NOBE Tech Committee',
    type: 'Club',
    role: 'Software Team Member',
    description:
      'Building software for real clients with the NOBE Tech Committee, starting with the Lincoln Elementary project.',
  },
]
