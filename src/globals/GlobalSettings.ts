import { GlobalConfig } from 'payload';

export const GlobalSettings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Config',
  },
  access: {
    read: () => true,
  },
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
  ],
};
