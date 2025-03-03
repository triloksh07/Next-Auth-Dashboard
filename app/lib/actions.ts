'use server';
import { z } from 'zod'
import { revalidatePath } from 'next/cache';
import { Redirect } from 'next';
import postgres from 'postgres';
import { redirect } from 'next/navigation'
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater then $0' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
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

    try {
        await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount =${amountIncents}, status = ${status}
    WHERE id = ${id}
`;
    } catch (error) {
        console.log('Error updating invoice');
        console.log(error);
    }

    revalidatePath('/dashboard/Invoices');
    redirect('/dashboard/Invoices');

}

// old createInvoice function
// export async function createInvoice(formData: FormData) {
//     const rawFormData = {
//         customerId: formData.get('customerId'),
//         amount: formData.get('amount'),
//         status: formData.get('status'),
//     };

//     const { customerId, amount, status } = CreateInvoice.parse(rawFormData)

//     const amountIncents = amount * 100;
//     const date = new Date().toISOString().split('T')[0];

//     try {
//         await sql`
//     INSERT INTO invoices (customer_id, amount, status, date)
//     VALUES (${customerId}, ${amountIncents}, ${status}, ${date})
//     `;
//     } catch (error) {
//         console.log(error); // log err to the console for now 
//     }

//     revalidatePath('/dashboard/Invoices');
//     redirect('/dashboard/Invoices');
// }

// new createInvoice Function
// export async function createInvoice(prevState: State, formData: FormData) {
//     // Validate form using Zod
//     const validatedFields = CreateInvoice.safeParse({
//       customerId: formData.get('customerId'),
//       amount: formData.get('amount'),
//       status: formData.get('status'),
//     });
   
//     // If form validation fails, return errors early. Otherwise, continue.
//     if (!validatedFields.success) {
//       return {
//         errors: validatedFields.error.flatten().fieldErrors,
//         message: 'Missing Fields. Failed to Create Invoice.',
//       };
//     }
   
//     // Prepare data for insertion into the database
//     const { customerId, amount, status } = validatedFields.data;
//     const amountInCents = amount * 100;
//     const date = new Date().toISOString().split('T')[0];
   
//     // Insert data into the database
//     try {
//       await sql`
//         INSERT INTO invoices (customer_id, amount, status, date)
//         VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
//       `;
//     } catch (error) {
//       // If a database error occurs, return a more specific error.
//       return {
//         message: 'Database Error: Failed to Create Invoice.',
//       };
//     }
   
//     // Revalidate the cache for the invoices page and redirect the user.
//     revalidatePath('/dashboard/Invoices');
//     redirect('/dashboard/Invoices');
//   }

//updated createInvoice function
export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      console.log('Validation Errors:', validatedFields.error.flatten().fieldErrors); // Debugging log
  
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
  
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
  
    // Insert data into the database
    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }
  
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/Invoices');
    redirect('/dashboard/Invoices');
  }
  

//Since this action is being called in the /dashboard/invoices path, we don't need to call redirect. Calling revalidatePath will trigger a new server request and re-render the table.
export async function deleteInvoice(id: string) {

    // Simulating throwing an error
    // throw new Error('Failed to Delete Invoice');

    // unreachable code block 
    await sql`DELETE FROM INVOICES where ID = ${id}`;
    revalidatePath('/dashboard/Invoices');
}
