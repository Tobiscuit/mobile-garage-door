import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { portfolioItems } from '@/data/projects'

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })

  payload.logger.info('seeding...')

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
      payload.logger.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD env vars are REQUIRED for seeding.')
      process.exit(1);
  }

  const finalPassword = password;

  // 1. Create Admin User
  // Check if THIS specific user exists
  const existingUser = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
  })

  if (existingUser.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: email,
        password: finalPassword,
      },
    })
    payload.logger.info(`Created Admin User: ${email}`)
  } else {
    payload.logger.info(`Admin User already exists: ${email}`)
  }

  // Helper to create simple Lexical features
  const createLexicalParagraph = (text: string, bold: boolean = false) => ({
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "detail": 0,
        "format": bold ? 1 : 0, // 1 is bold
        "mode": "normal",
        "style": "",
        "text": text,
        "version": 1
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "version": 1
  });

  const createLexicalHeader = (text: string, tag: "h1" | "h2" | "h3" | "h4") => ({
    "type": "heading",
    "tag": tag,
    "children": [
        {
          "type": "text",
          "detail": 0,
          "format": 0,
          "mode": "normal",
          "style": "",
          "text": text,
          "version": 1
        }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "version": 1
  });

  // 2. Seed Projects
  for (const project of portfolioItems) {
    const existingProjects = await payload.find({
      collection: 'projects',
      where: {
        slug: {
          equals: project.id,
        },
      },
    })

    if (existingProjects.totalDocs === 0) {
      try {
          // Construct Lexical Rich Text for Description
          const lexicalContent = {
              "root": {
                "type": "root",
                "format": "",
                "indent": 0,
                "version": 1,
                "direction": "ltr",
                "children": [
                    createLexicalHeader(project.subtitle, 'h3'),
                    createLexicalHeader('The Challenge', 'h4'),
                    createLexicalParagraph(project.challenge),
                    createLexicalHeader('Our Solution', 'h4'),
                    createLexicalParagraph(project.solution),
                    createLexicalHeader('Key Benefits', 'h4'),
                    // Benefits list as paragraphs for simplicity in seeding
                    ...project.benefits.map(b => createLexicalParagraph(`• ${b}`)) 
                ]
              }
          };

          await payload.create({
            collection: 'projects',
            data: {
              title: project.title,
              slug: project.id,
              client: 'Residential Customer',
              location: 'Greater Seattle Area',
              imageStyle: project.imageAfter as any, // Cast to any to satisfy TS enum check
              tags: [
                  { tag: 'Installation' },
                  { tag: 'Residential' }
              ],
              stats: [
                  { label: 'Time', value: '1 Day' },
                  { label: 'Warranty', value: 'Limited Lifetime' }
              ],
              description: lexicalContent as any, // Cast to any to avoid complex Lexical type generation in seed
            },
          })
          payload.logger.info(`Created Project: ${project.title}`)
      } catch (e: any) {
          payload.logger.error(`Failed to seed project ${project.title}: ${e.message}`)
      }
    } else {
      payload.logger.info(`Project already exists: ${project.title}`)
    }
  }

  payload.logger.info('Seeding complete.')
  process.exit(0)
}

seed()
