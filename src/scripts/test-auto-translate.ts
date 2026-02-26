import 'dotenv/config';
import payload from 'payload';
import config from '../payload.config';

async function verifyTranslation() {
  await payload.init({
    config,
    local: true,
  });

  const uniqueSlug = `test-project-${Date.now()}`;
  console.log('\n=============================================');
  console.log('🚀 Phase 1: Creating English Content');
  console.log('=============================================');
  console.log(`Creating test project: ${uniqueSlug}`);

  const englishDoc = await payload.create({
    collection: 'projects',
    locale: 'en',
    data: {
      title: 'Broken Springs Replaced in Minutes',
      slug: uniqueSlug,
      client: 'Residential Customer',
      location: 'The Woodlands, TX',
      imageStyle: 'garage-pattern-steel',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'We arrived quickly to replace two broken torsion springs, ensuring the customer could get their car out of the garage. The total time for repair was under 45 minutes.', version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        }
      },
      challenge: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'The customer was stuck inside their garage and had an important meeting to attend.', version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        }
      },
      solution: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'We dispatched our emergency team and replaced the springs with high-cycle parts.', version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        }
      },
      stats: [
        { label: 'Repair Time', value: '45 Minutes' }
      ]
    },
  });

  console.log(`✅ Project created with ID: ${englishDoc.id}`);
  
  console.log('\n=============================================');
  console.log('⏳ Phase 2 & 3: Waiting for Background Hook & Verifying');
  console.log('=============================================');
  console.log(`Waiting for Gemini AI background translation hook to finish...`);
  
  let spanishDoc: any = null;
  let attempts = 0;
  const maxAttempts = 15; // 30 seconds max
  
  while (attempts < maxAttempts) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch with fallbackLocale: 'none' or 'false' to ensure we don't get English back by default
    const doc = await payload.findByID({
      collection: 'projects',
      id: englishDoc.id,
      locale: 'es',
      fallbackLocale: false,
    });
    
    // Check if translation happened (Title changed from English to Spanish)
    if (doc.title && doc.title !== englishDoc.title) {
      spanishDoc = doc;
      break;
    }
    process.stdout.write('.');
  }
  console.log();

  if (!spanishDoc) {
    console.error('❌ Failed! Background hook never saved the Spanish translation (timeout after 30s).');
  } else {
    console.log('\n---------------------------------------------');
    console.log('🇺🇸 ENGLISH (Original)');
    console.log('---------------------------------------------');
    console.log('Title:', englishDoc.title);
    console.log('Client:', englishDoc.client);
    console.log('Location:', englishDoc.location); 
    console.log('Repair Time:', englishDoc.stats?.[0]?.value);
    console.log('Description:', englishDoc.description.root.children[0].children[0].text);
    
    console.log('\n---------------------------------------------');
    console.log('🇲🇽 SPANISH (AI Auto-Translated)');
    console.log('---------------------------------------------');
    console.log('Title:', spanishDoc.title);
    console.log('Client:', spanishDoc.client);
    console.log('Location:', spanishDoc.location); 
    console.log('Repair Time:', spanishDoc.stats?.[0]?.value);
    console.log('Description:', spanishDoc.description.root.children[0].children[0].text);
    console.log('---------------------------------------------\n');
    console.log('✅ Translation successful!');
  }

  console.log(`\n🧹 Phase 4: Cleaning up test project...`);
  await payload.delete({
    collection: 'projects',
    id: englishDoc.id,
  });
  console.log(`✅ Cleanup complete.`);
  process.exit(0);
}

verifyTranslation().catch(console.error);
