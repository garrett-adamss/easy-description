This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.






## Setting Up DB
🛠️ Step-by-Step Guide: Connect PROJECT to project_db
🔁 1. Clone the TEMPLATE repo
bash
Copy
Edit
git clone https://github.com/your-username/TEMPLATE.git PROJECT
cd PROJECT
🧪 2. Create a new Supabase project
Go to https://supabase.com

Click New Project

Name it project_db or whatever you want

Set a secure database password

Wait for the project to provision

🧾 3. Get your Project Ref
In the Supabase Dashboard, open your project_db

Look at the URL in your browser:

ruby
Copy
Edit
https://supabase.com/dashboard/project/**abcd1234xyz**
Copy the bold part → that’s your project-ref.

🔐 4. Add your Supabase credentials to .env
In the PROJECT repo, create a file:

bash
Copy
Edit
touch .env
And fill it with:

env
Copy
Edit
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
You can find these in your Supabase dashboard under
Settings → API → Project API keys

📦 5. Install the Supabase CLI
If you haven’t already:

bash
Copy
Edit
npm install -g supabase
🔗 6. Link your project with Supabase
bash
Copy
Edit
supabase link --project-ref abcd1234xyz
Replace abcd1234xyz with your actual project ref from Step 3.

This creates a supabase/config.toml file that links your local project to your remote Supabase database.

⬆️ 7. Push your schema
bash
Copy
Edit
supabase db push --file supabase/schema_init.sql
This sends your full database schema (tables, functions, RLS, etc.) to your new project_db.

✅ 8. Confirm it worked
Go to your Supabase Dashboard:

Check the Table Editor → your tables should be there

Check SQL Editor → Triggers / Policies → your logic should be there

Check Authentication → Policies if you added RLS
