// 'use client'

import CustomersTable from '@/app/ui/customers/table';
import { customers, invoices } from '@/app/lib/placeholder-data';
import {
  FormattedCustomersTable,
} from '@/app/lib/definitions';
import { fetchLatestInvoices } from '@/app/lib/data';
import { Suspense } from 'react';


const calculateCustomerData = () => {
  return customers.map((customer) => {
    const customerInvoices = invoices.filter(
      (invoice) => invoice.customer_id === customer.id
    );

    const total_pending = customerInvoices
      .filter((invoice) => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const total_paid = customerInvoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      ...customer,
      total_pending,
      total_paid,
      total_invoices: customerInvoices.length, // Total invoices for the customer
    };
  });
};

const customerData: FormattedCustomersTable[] = calculateCustomerData();
console.log(customerData);

export default function CustomerPage() {
  return (
    <div>
      <Suspense fallback={<p>Loading customers...</p>}>
        <CustomersTable customers={customerData} />
      </Suspense>
    </div>
  );
}
