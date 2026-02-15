import React from 'react';
import { PasskeyManager } from './PasskeyManager';

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface AccountSidebarProps {
  customer: Customer;
}

export function AccountSidebar({ customer }: AccountSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Account Details</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400">Name</div>
            <div className="font-medium text-charcoal-blue">{customer.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Email</div>
            <div className="font-medium text-charcoal-blue">{customer.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Phone</div>
            <div className="font-medium text-charcoal-blue">{customer.phone}</div>
          </div>
        </div>
      </div>

      <div className="bg-charcoal-blue/5 rounded-xl p-6 border border-charcoal-blue/10">
        <h3 className="font-bold text-charcoal-blue text-sm mb-2">Need immediate assistance?</h3>
        <p className="text-sm text-gray-600 mb-4">Our support team is available 24/7 for existing ticket updates.</p>
        <a href="tel:5550000000" className="text-charcoal-blue font-bold text-lg hover:text-golden-yellow transition-colors block">
          (555) 000-0000
        </a>
      </div>

      <PasskeyManager />
    </div>
  );
}
