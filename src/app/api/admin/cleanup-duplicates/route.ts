
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const typosToRemove = [
    'admin@mobilgarage.com',
    'admin@mobilgaragedoor.com',
    'admin@mobilegaragedoor.com' // We will handle this separately to keep one
  ]

  const results = []

  // 1. Remove Typos completely
  const typos = ['admin@mobilgarage.com', 'admin@mobilgaragedoor.com'];
  for (const email of typos) {
    try {
      const { docs } = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
      });

      for (const doc of docs) {
         await payload.delete({
             collection: 'users',
             id: doc.id
         });
         results.push(`Deleted typo user: ${email} (ID: ${doc.id})`);
      }
    } catch (e) {
      results.push(`Error processing ${email}: ${(e as Error).message}`);
    }
  }

  // 2. Handle Duplicates of the REAL admin
  const realAdmin = 'admin@mobilegaragedoor.com';
  try {
      const { docs } = await payload.find({
          collection: 'users',
          where: { email: { equals: realAdmin } },
          sort: '-createdAt', // Keep the newest? Or oldest? Usually keep the one with data.
      });

      if (docs.length > 1) {
          // Keep the first one (newest due to sort), delete the rest
          // OR better, keep the one with a Square Customer ID or Profile?
          // Let's just keep the first one found and delete others.
          const [keep, ...remove] = docs;
          results.push(`Keeping admin ID: ${keep.id}`);

          for (const user of remove) {
              await payload.delete({
                  collection: 'users',
                  id: user.id
              });
              results.push(`Removed duplicate admin ID: ${user.id}`);
          }
      } else {
          results.push(`Admin count is correct: ${docs.length}`);
      }

  } catch (e) {
      results.push(`Error processing real admin: ${(e as Error).message}`);
  }

  return NextResponse.json({ success: true, results })
}
