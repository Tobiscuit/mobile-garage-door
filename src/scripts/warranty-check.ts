import { getPayload } from 'payload';
import config from '../payload.config';
import dotenv from 'dotenv';
dotenv.config();

const WARN_DAYS = 30; // Notify 30 days before expiration

async function runWarrantyCheck() {
  console.log('🔍 Starting Warranty Watch...');

  const payload = await getPayload({ config });

  // 1. Check if feature is enabled
  const settings = await payload.findGlobal({ slug: 'settings' });
  
  if (!settings.warranty?.enableNotifications) {
      console.log('⏸️ Warranty Notifications are DISABLED in Global Settings.');
      process.exit(0);
  }

  // 2. Calculate Date Range
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + WARN_DAYS);
  
  // Create range for "Target Date" (Start of day to end of day)
  const startOfDay = new Date(targetDate.setHours(0,0,0,0)).toISOString();
  const endOfDay = new Date(targetDate.setHours(23,59,59,999)).toISOString();

  console.log(`📅 Checking for warranties expiring on: ${startOfDay.split('T')[0]}`);

  // 3. Find Projects expiring exactly 30 days from now
  const expiringProjects = await payload.find({
    collection: 'projects',
    where: {
        warrantyExpiration: {
            greater_than_equal: startOfDay,
            less_than_equal: endOfDay,
        }
    }
  });

  if (expiringProjects.totalDocs === 0) {
      console.log('✅ No warranties expiring in 30 days.');
      process.exit(0);
  }

  console.log(`🚨 Found ${expiringProjects.totalDocs} expiring warranties!`);

  // 4. Send Emails (Simulation for now)
  for (const project of expiringProjects.docs) {
      console.log(`\n📧 SENDING NOTIFICATION FOR: ${project.title}`);
      console.log(`   - Client: ${project.client}`);
      console.log(`   - Expiration: ${project.warrantyExpiration}`);
      
      const emailBody = settings.warranty.notificationEmailTemplate
          ?.replace('{{client}}', project.client as string)
          .replace('{{project}}', project.title);

      console.log(`   - Body Preview: ${emailBody?.substring(0, 50)}...`);
      
      // In a real scenario, we would call payload.sendEmail here
      // await payload.sendEmail({ ... })
  }

  console.log('\n🏁 Warranty Watch Complete.');
  process.exit(0);
}

runWarrantyCheck();
