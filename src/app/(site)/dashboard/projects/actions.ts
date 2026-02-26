'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getProjects() {
  const payload = await getPayload({ config: configPromise });
  const results = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  });
  return results.docs;
}

export async function getProjectById(id: string) {
  const payload = await getPayload({ config: configPromise });
  try {
    const project = await payload.findByID({
      collection: 'projects',
      id,
    });
    return project;
  } catch (error) {
    return null;
  }
}

export async function createProject(formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const challenge = formData.get('challenge') as string;
  const solution = formData.get('solution') as string;
  const client = formData.get('client') as string;
  const location = formData.get('location') as string;
  const completionDate = formData.get('completionDate') as string;
  const galleryStr = formData.get('gallery') as string;
  
  let gallery = [];
  try {
      if (galleryStr) gallery = JSON.parse(galleryStr);
  } catch (e) {
      console.error('Failed to parse gallery JSON:', e);
  }

  try {
    await payload.create({
      collection: 'projects',
      data: {
        title,
        // Pass HTML to transient fields - hook will convert to Lexical
        htmlDescription: description,
        htmlChallenge: challenge,
        htmlSolution: solution,
        client,
        location,
        completionDate,
        gallery,
        slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        imageStyle: 'garage-pattern-modern', // Default for now
        tags: [{ tag: 'General' }], // Default tag
        stats: [], // Empty stats
      } as any, 
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    return { error: 'Failed to create project' };
  }

  revalidatePath('/dashboard/projects');
  redirect('/dashboard/projects');
}

export async function updateProject(id: string, formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const challenge = formData.get('challenge') as string;
  const solution = formData.get('solution') as string;
  const client = formData.get('client') as string;
  const location = formData.get('location') as string;
  const completionDate = formData.get('completionDate') as string;
  const galleryStr = formData.get('gallery') as string;

  let gallery = [];
  try {
      if (galleryStr) gallery = JSON.parse(galleryStr);
  } catch (e) {
      console.error('Failed to parse gallery JSON:', e);
  }

  try {
    await payload.update({
      collection: 'projects',
      id,
      data: {
        title,
        // Pass HTML to transient fields - hook will convert to Lexical
        htmlDescription: description,
        htmlChallenge: challenge,
        htmlSolution: solution,
        client,
        location,
        completionDate,
        gallery,
      } as any,
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    return { error: 'Failed to update project' };
  }

  revalidatePath('/dashboard/projects');
  redirect('/dashboard/projects');
}
