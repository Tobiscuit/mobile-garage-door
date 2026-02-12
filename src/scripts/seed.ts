import 'dotenv/config'
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
        role: 'admin',
      } as any,
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

  const createSimpleLexicalDocument = (text: string) => ({
    "root": {
      "type": "root",
      "format": "",
      "indent": 0,
      "version": 1,
      "direction": "ltr",
      "children": [
        createLexicalParagraph(text)
      ]
    }
  });

  // 2. Seed Projects
  for (const project of portfolioItems) {
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
              createLexicalHeader('Key Benefits', 'h4'),
              // Benefits list as paragraphs for simplicity in seeding
              ...project.benefits.map(b => createLexicalParagraph(`• ${b}`)) 
          ]
        }
    };

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
          await payload.create({
            collection: 'projects',
            data: {
              title: project.title,
              slug: project.id,
              client: 'Residential Customer',
              location: 'Houston & Surrounding Areas',
              imageStyle: project.imageAfter as any, // Cast to any to satisfy TS enum check
              tags: [
                  { tag: 'Installation' },
                  { tag: 'Residential' }
              ],
              stats: [
                  { label: 'Time', value: '1 Day' },
                  { label: 'Warranty', value: 'Limited Lifetime' }
              ],
              description: lexicalContent as any, 
              challenge: createSimpleLexicalDocument(project.challenge) as any,
              solution: createSimpleLexicalDocument(project.solution) as any,
            },
          })
          payload.logger.info(`Created Project: ${project.title}`)
      } catch (e: any) {
          payload.logger.error(`Failed to seed project ${project.title}: ${e.message}`)
      }
    } else {
      payload.logger.info(`Updating existing project: ${project.title}`)
      try {
        await payload.update({
          collection: 'projects',
          id: existingProjects.docs[0].id,
          data: {
             challenge: createSimpleLexicalDocument(project.challenge) as any,
             solution: createSimpleLexicalDocument(project.solution) as any,
             description: lexicalContent as any,
          }
        })
      } catch (e: any) {
         payload.logger.error(`Failed to update project ${project.title}: ${e.message}`)
      }
    }
  }

  // 3. Seed Testimonials
  const testimonials = [
    {
      author: 'Ethan Carter',
      location: 'Homeowner • Spring Repair',
      quote: "Tech arrived in 45 mins. Had the exact spring needed on the truck. No upsell, just solved the problem. Exactly what you want.",
      rating: 5,
      featured: true,
    },
    {
      author: 'Sophia Bennett',
      location: 'General Contractor • Installation',
      quote: "We use Mobil Garage for all our new builds. Their reliability is unmatched in the local market. They simply show up and get it done.",
      rating: 5,
      featured: true,
    },
  ]

  for (const t of testimonials) {
    const existing = await payload.find({
      collection: 'testimonials',
      where: { author: { equals: t.author } },
    })
    if (existing.totalDocs === 0) {
      await payload.create({ collection: 'testimonials', data: t })
      payload.logger.info(`Created Testimonial: ${t.author}`)
    }
  }

  // 4. Seed Services
  const servicesData = [
    {
      title: 'Something Broken?',
      slug: 'emergency-repair',
      category: 'Critical Response',
      description: 'Most common issues we fix same-day:',
      highlight: false,
      icon: 'lightning',
      order: 1,
      features: [
        { feature: "Door Stuck / Won't Open" },
        { feature: 'Loud Grinding Noise' },
        { feature: 'Broken Spring (Pop Sound)' },
        { feature: 'Off Track / Crooked' },
        { feature: 'Opener Unresponsive' },
      ],
    },
    {
      title: 'Contractors & Builders',
      slug: 'contractor-portal',
      category: 'Commercial',
      description: 'Volume pricing, dedicated project managers, and 100% schedule reliability.',
      highlight: true,
      icon: 'building',
      order: 2,
      features: [
        { feature: 'Volume Pricing' },
        { feature: 'Dedicated Project Managers' },
        { feature: 'Schedule Reliability' },
      ],
    },
    {
      title: 'New Installations',
      slug: 'installations',
      category: 'Design',
      description: "Visualize your home's potential. Modern, Carriage, and Glass styles.",
      highlight: false,
      icon: 'building',
      order: 3,
      features: [
        { feature: 'Modern Styles' },
        { feature: 'Carriage Styles' },
        { feature: 'Glass Styles' },
      ],
    },
  ]

  for (const s of servicesData) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: s.slug } },
    })
    if (existing.totalDocs === 0) {
      await payload.create({ collection: 'services', data: s as any })
      payload.logger.info(`Created Service: ${s.title}`)
    }
  }

  payload.logger.info('Seeding complete.')
  process.exit(0)
}

seed()
