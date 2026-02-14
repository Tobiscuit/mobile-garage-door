import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TechnicianClient from './TechnicianClient';

export default async function TechnicianPage() {
    const payload = await getPayload({ config: configPromise });
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (!user || !('role' in user) || user.role !== 'technician') {
        redirect('/admin/login');
    }

    return <TechnicianClient user={user} />;
}
