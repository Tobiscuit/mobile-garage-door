
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const emailsToRemove = [
    'admin@mobilgarage.com',
    'admin@mobilgaragedoor.com'
  ]

  const results = []

  for (const email of emailsToRemove) {
    try {
      const result = await payload.delete({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
      })
      
      if (result.docs.length > 0) {
        results.push(`Removed: ${email}`)
      } else {
        results.push(`Not found: ${email}`)
      }
    } catch (error) {
      results.push(`Error removing ${email}: ${error.message}`)
    }
  }

  return NextResponse.json({ success: true, results })
}
