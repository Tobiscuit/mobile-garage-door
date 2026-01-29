/**
 * Seed Script for Payload CMS
 * 
 * Run this after creating your first admin user:
 *   npm run seed
 * 
 * This will populate all content from the existing hardcoded pages.
 * Safe to run multiple times - it checks if data already exists.
 */

import { getPayload } from 'payload';
import config from '../src/payload.config';

const seed = async () => {
  console.log('🌱 Starting seed...\n');

  const payload = await getPayload({ config });

  // ============================================
  // SERVICES
  // ============================================
  const existingServices = await payload.find({ collection: 'services', limit: 1 });
  
  if (existingServices.docs.length === 0) {
    console.log('📦 Seeding services...');
    
    const services = [
      {
        title: 'Precision Repair',
        slug: 'precision-repair',
        category: 'Critical Response',
        description: "Diagnostic-first approach to broken springs, cables, and openers. We carry 98% of parts on our trucks.",
        features: [
          { feature: 'Torsion Spring Replacement' },
          { feature: 'Cable Reset & Spooling' },
          { feature: 'Sensor Alignment' },
        ],
        icon: 'lightning',
        highlight: true,
        order: 1,
      },
      {
        title: 'Modern Installation',
        slug: 'modern-installation',
        category: 'Architecture',
        description: "Complete entryway transformation. We install high-R-value insulated doors that withstand local weather extremes.",
        features: [
          { feature: 'Custom Sizing' },
          { feature: 'Smart Opener Integration' },
          { feature: 'Old Door Haul-Away' },
        ],
        icon: 'building',
        highlight: false,
        order: 2,
      },
      {
        title: 'Annual Tune-Up',
        slug: 'annual-tune-up',
        category: 'Preventative',
        description: "The '25-Point Safety Inspection' that extends the life of your system and prevents guaranteed failure points.",
        features: [
          { feature: 'Lube & Balance' },
          { feature: 'Roller Inspection' },
          { feature: 'Safety Reverse Test' },
        ],
        icon: 'clipboard',
        highlight: false,
        order: 3,
      },
      {
        title: 'Automation & WiFi',
        slug: 'automation-wifi',
        category: 'Smart Home',
        description: "Open your door from your phone. Integration with HomeKit, Alexa, and Google Home.",
        features: [
          { feature: 'MyQ Setup' },
          { feature: 'Camera Installation' },
          { feature: 'Keypad Programming' },
        ],
        icon: 'phone',
        highlight: false,
        order: 4,
      },
    ];

    for (const service of services) {
      await payload.create({ collection: 'services', data: service });
    }
    console.log(`   ✅ Created ${services.length} services\n`);
  } else {
    console.log('⏭️  Services already exist, skipping...\n');
  }

  // ============================================
  // PROJECTS
  // ============================================
  const existingProjects = await payload.find({ collection: 'projects', limit: 1 });
  
  if (existingProjects.docs.length === 0) {
    console.log('📦 Seeding projects...');
    
    const projects = [
      {
        title: 'Logistics Hub: High-Speed Door Deployment',
        slug: 'commercial-fleet-hq',
        client: 'Regional Distribution Center',
        location: 'Industrial Park, Sector 4',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Replaced failing chain-link gates with high-speed, insulated steel sectional doors. Integrated with facility management software for automated access control.' }],
              },
            ],
          },
        },
        imageStyle: 'garage-pattern-steel',
        tags: [{ tag: 'Commercial' }, { tag: 'Automation' }, { tag: 'Security' }],
        stats: [
          { label: 'Install Time', value: '6 Hours' },
          { label: 'Efficiency Gain', value: '+40%' },
          { label: 'Cycle Rating', value: '100k' },
        ],
      },
      {
        title: 'Estate Modernization: Glass & Aluminum',
        slug: 'residential-modern-glass',
        client: 'Private Residence',
        location: 'Highland Estates',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Custom-fabricated aluminum frame with tempered frosted glass. Complete tear-out of 1980s wood doors. Smart opener integration with geofencing.' }],
              },
            ],
          },
        },
        imageStyle: 'garage-pattern-glass',
        tags: [{ tag: 'Residential' }, { tag: 'Design' }, { tag: 'Smart Home' }],
        stats: [
          { label: 'Curb Appeal', value: 'Max' },
          { label: 'R-Value', value: '12.9' },
          { label: 'Warranty', value: 'Lifetime' },
        ],
      },
      {
        title: 'Historic Preservation: Carriage House',
        slug: 'carriage-house-retro',
        client: 'Heritage Trust',
        location: 'Old Town District',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Synthetic composite overlay that mimics 100-year-old wood but requires zero staining. Silent belt-drive openers installed to protect fragile structure.' }],
              },
            ],
          },
        },
        imageStyle: 'garage-pattern-carriage',
        tags: [{ tag: 'Restoration' }, { tag: 'Custom' }, { tag: 'Quiet' }],
        stats: [
          { label: 'Style Match', value: '100%' },
          { label: 'Noise Reduction', value: '-25dB' },
          { label: 'Maintenance', value: 'Zero' },
        ],
      },
      {
        title: 'Critical Failure: Torsion Spring Snap',
        slug: 'emergency-spring-replacement',
        client: 'Emergency Call',
        location: 'Suburban Multi-Car',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Vehicle trapped inside. Rapid response team arrived within the hour. Converted hazardous extension springs to safe, high-cycle torsion system.' }],
              },
            ],
          },
        },
        imageStyle: 'garage-pattern-modern',
        tags: [{ tag: 'Repair' }, { tag: 'Emergency' }, { tag: 'Safety' }],
        stats: [
          { label: 'Response', value: '45 Min' },
          { label: 'Fix Time', value: '1 Hour' },
          { label: 'Safety Rating', value: 'Pass' },
        ],
      },
    ];

    for (const project of projects) {
      await payload.create({ collection: 'projects', data: project });
    }
    console.log(`   ✅ Created ${projects.length} projects\n`);
  } else {
    console.log('⏭️  Projects already exist, skipping...\n');
  }

  // ============================================
  // SITE SETTINGS
  // ============================================
  console.log('📦 Updating site settings...');
  
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      companyName: 'Mobile Garage Door Pros',
      phone: '(555) 000-0000',
      email: 'service@mobilegaragedoor.com',
      licenseNumber: 'CA LIC #1045678',
      insuranceAmount: '$2M Policy',
      bbbRating: 'A+',
      missionStatement: 'To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.',
      stats: [
        { value: '15+', label: 'Years in Service' },
        { value: '5,000+', label: 'Repairs Completed' },
        { value: '98%', label: 'Customer Satisfaction' },
        { value: '24/7', label: 'Emergency Response' },
      ],
      values: [
        { title: 'Reliability', description: 'We show up when we say we will. No excuses, no delays.' },
        { title: 'Transparency', description: 'Upfront pricing. No hidden fees. What we quote is what you pay.' },
        { title: 'Expertise', description: 'Factory-trained technicians with the tools for any job.' },
      ],
      // Brand Voice (Psychology-driven persona)
      brandVoice: `You are "The Garage Door Authority"—a trusted expert who speaks to contractors and homeowners alike.

VOICE:
• Confident and knowledgeable, like a master technician explaining things to a smart client
• Data-driven: use specific numbers, specs, and real-world results
• Respectful of the reader's intelligence—explain technical terms briefly, don't dumb down
• Direct and efficient—busy contractors don't have time for fluff

PSYCHOLOGY PRINCIPLES TO USE:
• Authority: Cite specifics (e.g., "R-18 insulation" not "good insulation")
• Social Proof: Reference "our contractors" or "homeowners we've worked with"
• Reciprocity: Offer genuine value (tips, comparisons) before any ask
• Scarcity: When relevant, note limited availability or time-sensitive factors
• Commitment: Remind readers of their goals (safety, efficiency, curb appeal)

PRIMARY AUDIENCE: Contractors, property managers, fleet operators
SECONDARY AUDIENCE: Homeowners with multi-car garages or premium properties`,
      brandTone: `• Professional but not corporate—think trusted trade publication, not marketing brochure
• Helpful first, promotional second
• Calm confidence—never desperate or salesy
• Occasional dry humor is fine, but prioritize clarity`,
      brandAvoid: `NEVER USE:
• "Best in class", "world-class", "cutting-edge" (vague superlatives)
• "Synergy", "leverage", "paradigm" (corporate jargon)
• Exclamation points!!! (too salesy)
• "Don't wait!", "Act now!", "Limited time!" (pressure tactics)
• Emojis 🚫
• "We're passionate about..." (cliché)
• Guarantees we can't back up specifically`,
    },
  });
  console.log('   ✅ Site settings updated\n');

  console.log('🎉 Seed complete!\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
