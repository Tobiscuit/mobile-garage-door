import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    // Company Info
    {
      type: 'collapsible',
      label: 'Company Information',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'companyName',
          type: 'text',
          required: true,
          label: 'Business Name',
          defaultValue: 'Mobil Garage Door Pros',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: '24/7 Hotline',
          defaultValue: '832-419-1293',
        },
        {
          name: 'email',
          type: 'text',
          required: true,
          label: 'Support Email',
          defaultValue: 'service@mobilgaragedoor.com',
        },
        {
          name: 'licenseNumber',
          type: 'text',
          label: 'Contractor License',
          defaultValue: 'CA LIC #1045678',
        },
        {
          name: 'insuranceAmount',
          type: 'text',
          label: 'Liability Insurance',
          defaultValue: '$2M Policy',
        },
        {
          name: 'bbbRating',
          type: 'text',
          label: 'BBB Rating',
          defaultValue: 'A+',
        },
      ],
    },
    // About Page Content
    {
      type: 'collapsible',
      label: 'About Page',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'missionStatement',
          type: 'textarea',
          label: 'Mission Statement',
          defaultValue: 'To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.',
        },
        {
          name: 'stats',
          type: 'array',
          label: 'Company Stats',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { description: 'E.g., "15+", "5,000+", "98%"' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { description: 'E.g., "Years in Service", "Repairs Completed"' },
            },
          ],
        },
        {
          name: 'values',
          type: 'array',
          label: 'Core Values',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
    // Brand Voice (Editable AI Persona)
    {
      type: 'collapsible',
      label: 'Brand Voice (AI Writing Style)',
      admin: {
        initCollapsed: true,
        description: 'These settings guide how AI generates content for your business.',
      },
      fields: [
        {
          name: 'brandVoice',
          type: 'textarea',
          label: 'Writing Style',
          admin: {
            description: 'Describe your brand\'s voice and personality',
          },
          defaultValue: `You are "The Garage Door Authority"—a trusted expert who speaks to contractors and homeowners alike.

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
        },
        {
          name: 'brandTone',
          type: 'textarea',
          label: 'Tone Notes',
          admin: {
            description: 'Emotional register and feel',
          },
          defaultValue: `• Professional but not corporate—think trusted trade publication, not marketing brochure
• Helpful first, promotional second
• Calm confidence—never desperate or salesy
• Occasional dry humor is fine, but prioritize clarity`,
        },
        {
          name: 'brandAvoid',
          type: 'textarea',
          label: 'Words & Phrases to Avoid',
          admin: {
            description: 'Things the AI should never say',
          },
          defaultValue: `NEVER USE:
• "Best in class", "world-class", "cutting-edge" (vague superlatives)
• "Synergy", "leverage", "paradigm" (corporate jargon)
• Exclamation points!!! (too salesy)
• "Don't wait!", "Act now!", "Limited time!" (pressure tactics)
• Emojis 🚫
• "We're passionate about..." (cliché)
• Guarantees we can't back up specifically`,
        },
      ],
    },
  ],
};
