import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const cleanRedundancy = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })
  payload.logger.info('Starting redundancy cleanup...')

  const projects = await payload.find({
    collection: 'projects',
    limit: 100,
  })

  for (const project of projects.docs) {
    const description = project.description as any;
    
    if (!description?.root?.children) {
        continue;
    }

    const newChildren = [];
    let skipNext = false;

    // Iterate through children and filter out Challenge/Solution sections
    for (let i = 0; i < description.root.children.length; i++) {
        const node = description.root.children[i];
        
        // Check if node is a header for Challenge or Solution
        if (node.type === 'heading') {
            const text = node.children?.[0]?.text;
            if (text === 'The Challenge' || text === 'Our Solution') {
                // Skip this header
                // Also skip the next node (the paragraph content)
                // In the seed, the content is always the immediate next sibling
                i++; // Skip next iteration
                continue;
            }
        }
        
        newChildren.push(node);
    }

    // Only update if changes were made
    if (newChildren.length !== description.root.children.length) {
        payload.logger.info(`Cleaning redundancy in project: ${project.title}`)
        
        const newDescription = {
            ...description,
            root: {
                ...description.root,
                children: newChildren
            }
        };

        await payload.update({
            collection: 'projects',
            id: project.id,
            data: {
                description: newDescription
            }
        })
    }
  }

  payload.logger.info('Cleanup complete.')
  process.exit(0)
}

cleanRedundancy()
