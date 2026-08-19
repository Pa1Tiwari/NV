# NV — Traditional Indian Wear

A full-stack storefront front end (HTML/CSS/JS) wired up to Supabase for products, auth, and orders.

## Files
- `index.html` — page structure/markup
- `style.css` — full design system and styling
- `script.js` — Supabase integration, cart, auth, filtering, checkout
- `supabase-schema.sql` — database schema + RLS policies + sample products

The site works immediately with **demo data** even before Supabase is connected, so you can preview it by just opening `index.html`.

## Connect Supabase (5 minutes)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run.
   This creates `products`, `profiles`, `orders`, `order_items`, `wishlist`, `subscribers` tables with row-level security, plus 10 sample products.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
4. Open `script.js` and set:
   ```js
   const SUPABASE_URL = "https://xxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-key";
   ```
5. In **Authentication → Providers**, make sure **Email** sign-up is enabled (it is by default). For local testing, you may want to turn off "Confirm email" under Authentication → Settings, so accounts activate instantly.
6. Reload the site — products now load live from Supabase, and sign in/sign up/checkout all read and write real data.

## Adding your logo
Once you have the logo file, replace the text `NV` wordmark:
- In `index.html`, swap `<span class="logo-mark" id="logoMark">NV</span>` for an `<img>` tag pointing at your logo file, and do the same for the footer's `.logo-mark-light`.
- You may want to add a `<link rel="icon" href="...">` favicon tag in `<head>` too.

## Adding real product photos
Set the `image_url` column on each row in the `products` table (Supabase Table Editor, or via the **Storage** feature — create a public bucket, upload images, and paste the public URL into `image_url`). Until then, product cards show a soft monogram placeholder.

## Making yourself an admin (so you can list products)

1. Sign up for an account on the site itself (the "account" icon in the header → Create Account).
2. In Supabase → **SQL Editor**, run:
   ```sql
   update public.profiles set is_admin = true where id =
     (select id from auth.users where email = 'you@example.com');
   ```
3. Refresh the site and sign in. A **"+" icon** now appears in the header — click it to open the listing form.
4. Fill in the photo, name, description, price, fabric/colour, available sizes, and stock, then **Publish Listing**. It uploads the photo to the `product-images` storage bucket and inserts a row into `products` — the new item appears on the storefront immediately, no redeploy needed.

## The cart

Every visitor gets a cart (stored in `localStorage`) as soon as they add something, no account required. Once a shopper signs in, their cart is also mirrored to a `cart_items` table in Supabase — so it follows them if they come back on another device, and merges with whatever's already in their bag locally.

## What's implemented
- Product catalog pulled from Supabase, with category filter chips, live search, and "load more" pagination
- **Admin listing tool** — signed-in admins get a "+" icon in the header to publish new products (photo upload + name, description, price, compare-at price, fabric, colour, sizes, stock, featured flag) directly into Supabase
- Quick-view modal with size selection and quantity stepper
- Cart persisted in `localStorage` for every visitor, and mirrored to a per-user `cart_items` table in Supabase once signed in
- Email/password auth via Supabase Auth (sign up, sign in, sign out, session-aware UI)
- Checkout writes an `orders` row + `order_items` rows (requires sign-in)
- Newsletter signup writes to a `subscribers` table
- Fully responsive layout, keyboard-focus styles, and `prefers-reduced-motion` support

## Extending it
- Payments aren't wired up — `handleCheckout()` in `script.js` currently just records the order as `pending`. Plug in Razorpay/Stripe there before going live.
- Add an admin view (or just use the Supabase Table Editor) to manage products and order status.
- Consider Supabase Storage for product images and a `product_images` table if you want multiple photos per product.
