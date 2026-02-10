import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { portfolioItems } from '@/data/projects'

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })

  payload.logger.info('seeding...')

  // 1. Create Admin User
  const users = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'admin@mobilegaragedoor.com',
      },
    },
  })

  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@mobilegaragedoor.com',
        password: 'password123',
        role: 'admin',
      },
    })
    payload.logger.info('Created Admin User: admin@mobilegaragedoor.com / password123')
  } else {
    payload.logger.info('Admin User already exists.')
  }

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
          // Construct Rich Text for Description
          // Challenge + Solution + Benefits
          const richTextDescription = [
            {
              children: [{ text: project.subtitle, bold: true }],
              type: 'h3',
            },
            {
              children: [{ text: 'The Challenge' }],
              type: 'h4',
            },
            {
              children: [{ text: project.challenge }],
            },
            {
              children: [{ text: 'Our Solution' }],
              type: 'h4',
            },
            {
              children: [{ text: project.solution }],
            },
            {
              children: [{ text: 'Key Benefits' }],
              type: 'h4',
            },
            {
              children: project.benefits.map(benefit => ({
                text: benefit,
              })),
              type: 'ul', // Simplified list structure (Payload rich text is complex, often just text blocks work for basic seeding)
            }
          ];

          // Simplified Rich Text: Payload expects a specific JSON structure (Slate/Lexical). 
          // For safety/speed, we will just put the challenge/solution in simple paragraphs if stricter validation exists.
          // But let's try a basic Slate structure.
          
          await payload.create({
            collection: 'projects',
            data: {
              title: project.title,
              slug: project.id,
              client: 'Residential Customer', // Default
              location: 'Greater Seattle Area', // Default
              imageStyle: project.imageAfter, // mapped from imageAfter which matches select values
              tags: [
                  { tag: 'Installation' },
                  { tag: 'Residential' }
              ],
              stats: [
                  { label: 'Time', value: '1 Day' },
                  { label: 'Warranty', value: 'Limited Lifetime' }
              ],
              description: [
                  {
                      children: [{ text: project.subtitle, bold: true }],
                  },
                  {
                      children: [{ text: '' }],
                  },
                  {
                      children: [{ text: 'Challenge: ', bold: true }, { text: project.challenge }],
                  },
                  {
                      children: [{ text: '' }],
                  },
                  {
                      children: [{ text: 'Solution: ', bold: true }, { text: project.solution }],
                  },
              ],
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
