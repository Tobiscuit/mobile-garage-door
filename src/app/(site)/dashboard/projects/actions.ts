'use server';

import { getDB } from "@/db";
import { projects, projectGallery, projectTags, projectStats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { redirect } from 'vinext/navigation';
import { getCloudflareContext } from "vinext/cloudflare";

export async function getProjects() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  return db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
    with: {
        gallery: { with: { media: true } },
        tags: true,
        stats: true
    }
  });
}

export async function getProjectById(id: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  try {
    const projectId = parseInt(id);
    return db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            gallery: { with: { media: true } },
            tags: true,
            stats: true
        }
    });
  } catch (error) {
    return null;
  }
}

export async function createProject(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const challenge = formData.get('challenge') as string;
  const solution = formData.get('solution') as string;
  const client = formData.get('client') as string;
  const location = formData.get('location') as string;
  const completionDate = formData.get('completionDate') as string;
  const galleryStr = formData.get('gallery') as string;
  
  let galleryItems: any[] = [];
  try {
      if (galleryStr) galleryItems = JSON.parse(galleryStr);
  } catch (e) {}

  try {
    const newProjects = await db.insert(projects).values({
        title,
        htmlDescription: description,
        htmlChallenge: challenge,
        htmlSolution: solution,
        client,
        location,
        completionDate,
        slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        imageStyle: 'garage-pattern-modern',
    }).returning();

    const newProject = newProjects[0];

    if (galleryItems.length > 0) {
        await db.insert(projectGallery).values(
            galleryItems.map((item, idx) => ({
                projectId: newProject.id,
                mediaId: item.image,
                caption: item.caption,
                order: idx
            }))
        );
    }

    await db.insert(projectTags).values({
        projectId: newProject.id,
        tag: 'General'
    });

  } catch (error) {
    console.error('Create Project Error:', error);
    return { error: 'Failed to create project' };
  }

  revalidatePath('/dashboard/projects');
  redirect('/dashboard/projects');
}

export async function updateProject(id: string, formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const challenge = formData.get('challenge') as string;
  const solution = formData.get('solution') as string;
  const client = formData.get('client') as string;
  const location = formData.get('location') as string;
  const completionDate = formData.get('completionDate') as string;
  const galleryStr = formData.get('gallery') as string;

  let galleryItems: any[] = [];
  try {
      if (galleryStr) galleryItems = JSON.parse(galleryStr);
  } catch (e) {}

  try {
    const projectId = parseInt(id);
    await db.update(projects).set({
        title,
        htmlDescription: description,
        htmlChallenge: challenge,
        htmlSolution: solution,
        client,
        location,
        completionDate,
        updatedAt: new Date().toISOString()
    }).where(eq(projects.id, projectId));

    await db.delete(projectGallery).where(eq(projectGallery.projectId, projectId));
    if (galleryItems.length > 0) {
        await db.insert(projectGallery).values(
            galleryItems.map((item, idx) => ({
                projectId,
                mediaId: item.image,
                caption: item.caption,
                order: idx
            }))
        );
    }
  } catch (error) {
    console.error('Update Project Error:', error);
    return { error: 'Failed to update project' };
  }

  revalidatePath('/dashboard/projects');
  redirect('/dashboard/projects');
}
