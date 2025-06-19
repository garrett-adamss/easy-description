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
🧪 1. Create a new Supabase project
- Go to https://supabase.com
- Click New Project
- Name it new project
- Set a secure database password

🧾 2. Get your Project Ref
In the Supabase Dashboard, open your new project

Look at the URL in your browser:
```ruby
https://supabase.com/dashboard/project/**abcd1234xyz**
```
Copy the bold part → that’s your project-ref.

🔐 3. Add your Supabase credentials to .env.local
```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
You can find these in your Supabase dashboard under
Settings → API → Project API keys

🔗 4. Link your project with Supabase
```bash
npx supabase@latest link --project-ref abcd1234xyz
```
Replace abcd1234xyz with your actual project ref from Step 3.

This creates a supabase/config.toml file that links your local project to your remote Supabase database.

⬆️ 5. Push your schema
```bash
supabase db push --file supabase/schema_init.sql
```
This sends your full database schema (tables, functions, RLS, etc.) to your new project_db.

✅ 6. Confirm it worked
- Go to your Supabase Dashboard:
- Check the Table Editor → your tables should be there
- Check SQL Editor → Triggers / Policies → your logic should be there
- Check Authentication → Policies if you added RLS


## Cloning template 

##### 1. Clone your template repository into a new project folder
```bash
git clone https://github.com/garrett-adamss/saas-vercel-supabase.git easy-description
```
##### 2. Move into the new project directory
```bash
cd easy-description
```
##### 3. Rename the original remote (your template) to `template`
```bash
git remote rename origin template
```
##### 4. Create a new GitHub repo for your SaaS project (e.g., https://github.com/garrett-adamss/easy-description.git)
##### Then link your SaaS project to that new GitHub repo
```bash
git remote add origin https://github.com/garrett-adamss/easy-description.git
```

##### 5. Push your code to your new SaaS repo
```bash
git push -u origin main
```

🔁 Later, to pull in updates from your template:
```bash
# Fetch the latest changes from the template repo
git fetch template

# Merge changes from the template's main branch into your project
git merge template/main
```

Or to pull in just one folder/module (e.g., updated auth module):
```bash
git checkout template/main -- modules/auth
```