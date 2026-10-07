export const RESUME_URL = `${import.meta.env.BASE_URL}resume.pdf`

export const bagItems = [
  {
    name: 'RESUME',
    description: "Navin's resume (PDF).",
    missingMessage: "Navin's resume isn't available yet. Check back soon!",
    url: RESUME_URL,
    external: true,
  },
  {
    name: 'GITHUB',
    description: "Navin's code and projects on GitHub.",
    url: 'https://github.com/navparthiban',
    external: true,
  },
  {
    name: 'LINKEDIN',
    description: "Connect with Navin on LinkedIn.",
    url: 'https://www.linkedin.com/in/navin-parthiban',
    external: true,
  },
  {
    name: 'EMAIL',
    description: 'Send Navin an email.',
    url: 'mailto:navparthiban@gmail.com',
    external: false,
  },
]
