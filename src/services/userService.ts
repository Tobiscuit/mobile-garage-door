import { Payload } from 'payload';

export const userService = {
  getProfile: async (payload: Payload, userId: string | number) => {
    return payload.findByID({
      collection: 'users',
      id: userId,
    });
  },

  updateProfile: async (payload: Payload, userId: string | number, data: any) => {
    return payload.update({
      collection: 'users',
      id: userId,
      data,
    });
  }
};
