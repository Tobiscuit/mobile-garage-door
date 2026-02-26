import type { GlobalConfig } from 'payload';

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Settings',
  admin: {
    group: 'System',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Site Settings',
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
          defaultValue: 'TX Registered & Bonded',
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
          defaultValue: `You are "Mobil Garage Door"—a trusted expert who speaks to contractors and homeowners alike.
Your tone is:
• Professional & Industrial: Use terms like "fabrication," "deployment," "specs," "security envelope."
• Direct & Confident: No fluff. Short sentences.
• Helpful but not eager: You are the expert they need.

Guidelines:
• Never use "Salesy" language (e.g., "Act now!", "Best price!").
• Focus on Technical Specs and Long-term Value.
• Authority: Cite specifics (e.g., "R-18 insulation" not "good insulation")
• If asked about price: "Pricing varies by spec. Book a diagnostic for an exact quote."`,
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
          ]
        },
        {
          label: 'Admin Preferences',
          fields: [
            {
              name: 'themePreference',
              type: 'select',
              label: 'Light Mode Theme',
              defaultValue: 'candlelight',
              options: [
                { label: 'Candlelight (Warm & Ambient)', value: 'candlelight' },
                { label: 'Original (High Contrast White)', value: 'original' },
              ],
              admin: {
                description: 'Select the color palette used when the dashboard is in Light Mode.',
              }
            }
          ]
        },
        {
          label: 'Automations & Warranty',
          fields: [
            {
              name: 'warranty',
              type: 'group',
              label: 'Warranty Automation',
              fields: [
                {
                  name: 'enableNotifications',
                  type: 'checkbox',
                  label: 'Enable 11-Month Warranty Checkup Emails',
                  defaultValue: false,
                },
                {
                  name: 'notificationEmailTemplate',
                  type: 'textarea',
                  label: 'Email Template (Text)',
                  defaultValue: "Hi {{client}},\n\nYour garage door labor warranty is expiring soon! Book a free checkup now.",
                  admin: {
                    description: 'Use {{client}} and {{project}} as placeholders.',
                  },
                },
              ],
            },
          ]
        }
      ]
    }
  ],
};
