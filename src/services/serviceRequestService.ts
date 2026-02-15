import { Payload } from 'payload';

export const serviceRequestService = {
  getActiveRequests: async (payload: Payload, userId: string | number) => {
    return payload.find({
      collection: 'service-requests' as any,
      where: {
        customer: { equals: userId },
        status: { not_equals: 'completed' }, // and not cancelled
      },
      sort: '-createdAt',
    });
  },

  getPastRequests: async (payload: Payload, userId: string | number) => {
    return payload.find({
      collection: 'service-requests' as any,
      where: {
        customer: { equals: userId },
        status: { equals: 'completed' },
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
