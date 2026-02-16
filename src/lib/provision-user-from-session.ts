import { randomBytes } from 'crypto';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

type SessionUser = {
  email?: string;
  role?: string;
};

type AppRole = 'admin' | 'technician' | 'dispatcher' | 'customer';

export type ProvisionedUser = {
  role: AppRole;
  profileComplete: boolean;
};

function generateBootstrapPassword() {
  return `BA_${randomBytes(24).toString('hex')}`;
}

function composeName(firstName?: string, lastName?: string) {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ').trim();
}

function isProfileComplete(role: AppRole, name?: string | null) {
  if (role === 'admin' || role === 'technician' || role === 'dispatcher') {
    return Boolean(String(name || '').trim());
  }
  return true;
}

export async function provisionUserFromSession(sessionUser?: SessionUser): Promise<ProvisionedUser> {
  const email = String(sessionUser?.email || '').toLowerCase().trim();
  if (!email) {
    return { role: 'customer', profileComplete: true };
  }

  const payload = await getPayload({ config: configPromise });

  const [userResult, inviteResult] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    }),
    payload.find({
      collection: 'staff-invites' as any,
      where: {
        and: [
          { email: { equals: email } },
          { status: { equals: 'pending' } },
        ],
      },
      limit: 1,
      depth: 0,
    }),
  ]);

  const invite = inviteResult.docs[0] as {
    id: number | string;
    role?: AppRole;
    firstName?: string;
    lastName?: string;
  } | undefined;
  const invitedRole: AppRole = invite?.role === 'admin' || invite?.role === 'technician'
    ? invite.role
    : 'customer';

  const existing = userResult.docs[0] as { id: number | string; role?: AppRole; name?: string | null } | undefined;

  if (!existing) {
    const invitedName = composeName(invite?.firstName, invite?.lastName);
    const created = await payload.create({
      collection: 'users',
      data: {
        email,
        password: generateBootstrapPassword(),
        role: invite ? invitedRole : 'customer',
        ...(invitedName ? { name: invitedName } : {}),
      } as any,
    });

    if (invite) {
      await payload.update({
        collection: 'staff-invites' as any,
        id: invite.id,
        data: {
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
        } as any,
      });
    }

    const createdRole = (created as { role?: AppRole }).role || (invite ? invitedRole : 'customer');
    const createdName = (created as { name?: string | null }).name || invitedName;
    return {
      role: createdRole,
      profileComplete: isProfileComplete(createdRole, createdName),
    };
  }

  if (invite && (existing.role !== 'admin' && existing.role !== 'technician')) {
    const invitedName = composeName(invite.firstName, invite.lastName);
    const updated = await payload.update({
      collection: 'users',
      id: existing.id,
      data: {
        role: invitedRole,
        ...(!existing.name && invitedName ? { name: invitedName } : {}),
      } as any,
    });

    await payload.update({
      collection: 'staff-invites' as any,
      id: invite.id,
      data: {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      } as any,
    });

    const updatedRole = (updated as { role?: AppRole }).role || invitedRole;
    const updatedName = (updated as { name?: string | null }).name || existing.name || invitedName;
    return {
      role: updatedRole,
      profileComplete: isProfileComplete(updatedRole, updatedName),
    };
  }

  const role = existing.role || 'customer';
  return {
    role,
    profileComplete: isProfileComplete(role, existing.name),
  };
}
