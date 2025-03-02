'use server';
import { z } from 'zod'
import { revalidatePath } from 'next/cache';
import { Redirect } from 'next';
import postgres from 'postgres';
import { redirect } from 'next/navigation'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };

    const { customerId, amount, status } = UpdateInvoice.parse(rawFormData)

    const amountIncents = amount * 100;

    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount =${amountIncents}, status = ${status}
        WHERE id = ${id}
    `;

    revalidatePath('/dashboard/Invoices');
    redirect('/dashboard/Invoices');

}

export async function createInvoice(formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };

    const { customerId, amount, status } = CreateInvoice.parse(rawFormData)
    const amountIncents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountIncents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/Invoices');
    redirect('/dashboard/Invoices');
}

//Since this action is being called in the /dashboard/invoices path, we don't need to call redirect. Calling revalidatePath will trigger a new server request and re-render the table.
export async function deleteInvoice(id:string){
    await sql`DELETE FROM INVOICES where ID = ${id}`;
    revalidatePath('/dashboard/Invoices');
}