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
    description: 'A web app where you upload a legal contract, take a quiz, read an AI summary in plain language, then quiz again to see how much you learned. I split it into a React frontend and Express backend so the API keys never reach the browser, and the backend falls back from Gemini to OpenRouter models if one fails.',
    link: 'https://clearsignlegalsimplifier.netlify.app/',
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
    role: 'Research Team Member',
    description: 'Reviewed 38 peer-reviewed studies on inherited arrhythmias like Long QT and Brugada syndrome. I proposed a risk assessment tool based on family history and genetics, and presented it at a research symposium with my team.',
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
    description: 'Taught 5 to 7 students a week, from kindergarten to high school with each student having an individualized lesson plan.',
  },
  {
    name: 'MEOWTH',
    level: 20,
    hp: 50,
    maxHp: 50,
    sprite: frontMeowth,
    backSprite: backMeowth,
    experience: 'Study Battle',
    type: 'Project',
    role: 'Developer',
    description: 'A web game for my CS 124 class that turns uploaded study notes into multiple-choice questions written by an LLM, which you answer to fight a boss in turn-based battles. Built with Next.js, TypeScript, Tailwind CSS, and Supabase. Still in development.',
    link: 'https://study-battle-navin.vercel.app/',
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
    role: 'Surgical Waiting Area Volunteer',
    description: 'Spent two years in the surgical waiting area, keeping families updated and supporting the nursing staff.',
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
    role: 'Developer',
    description:
      'Built an after-school activity lottery system for Lincoln Elementary with a student team, replacing a manual Google Form and spreadsheet process. I worked mainly on the backend, including roster generation, data validation, and Excel export.',
  },
]
