import { Payload } from 'payload';
import { randomUUID } from 'crypto';

interface CustomerData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestPassword?: string;
}

export const customerService = {
  findOrCreate: async (payload: Payload, data: CustomerData) => {
    // 1. Check for existing user
    const existingCustomers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: data.guestEmail },
      },
    });

    if (existingCustomers.totalDocs > 0) {
      return existingCustomers.docs[0].id;
    }

    // 2. Create new Customer
    const passwordToUse = data.guestPassword || randomUUID();

    const newCustomer = await payload.create({
      collection: 'users',
      data: {
        email: data.guestEmail,
        password: passwordToUse,
        name: data.guestName,
        phone: data.guestPhone,
        address: data.guestAddress,
        role: 'customer',
      },
    });

    return newCustomer.id;
  }
};
