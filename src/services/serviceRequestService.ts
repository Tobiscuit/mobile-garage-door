import { Payload } from 'payload';

export const serviceRequestService = {
  getActiveRequests: async (payload: Payload, userId: string | number) => {
    return payload.find({
      collection: 'service-requests' as any,
      where: {
        customer: { equals: userId },
        status: { 
            not_in: ['completed', 'cancelled'] // Exclude both completed and cancelled
        }, 
      },
      sort: '-createdAt',
    });
  },

  getPastRequests: async (payload: Payload, userId: string | number) => {
    return payload.find({
      collection: 'service-requests' as any,
      where: {
        customer: { equals: userId },
        status: { 
            in: ['completed', 'cancelled'] // Include cancelled in history
        },
      },
      sort: '-createdAt',
    });
  },

  getAssignedRequests: async (payload: Payload, techId: string | number) => {
    return payload.find({
      collection: 'service-requests' as any,
      where: {
        assignedTech: { equals: techId },
        status: { not_equals: 'completed' },
      },
      sort: 'scheduledTime', // Sort by schedule for techs
    });
  }
};
