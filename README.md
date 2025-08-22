[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swellstores/verswell-commerce&project-name=commerce&repo-name=commerce&demo-title=Next.js%20Swell%20Commerce&demo-url=https://verswell-commerce.vercel.app/&demo-image=https%3A%2F%2Fbigcommerce-demo-asset-ksvtgfvnd.vercel.app%2Fbigcommerce.png&env=SWELL_STORE_ID,SWELL_PUBLIC_KEY,SWELL_REVALIDATION_SECRET,SITE_NAME,TWITTER_CREATOR,TWITTER_SITE)

# Next.js Swell Commerce

A Next.js 14 and App Router-ready ecommerce template featuring:

- Next.js App Router
- Optimized for SEO using Next.js's Metadata
- React Server Components (RSCs) and Suspense
- Server Actions for mutations
- Edge Runtime
- New fetching and caching paradigms
- Dynamic OG images
- Styling with Tailwind CSS
- Checkout and payments with Swell
- Automatic light/dark mode based on system settings

Next.js Commerce utilizes the Swell Frontend API to provide client-safe access to your store's data. The Frontend API has read-only permissions for most models including products, categories, navigation menus, pages, and more. With the addition of a session token, cart management, checkout, and account editing flows scoped to each customer are also available.

> Note: Looking for Next.js Commerce v1? View the [code](https://github.com/vercel/commerce/tree/v1), [demo](https://commerce-v1.vercel.store), and [release notes](https://github.com/vercel/commerce/releases/tag/v1)

## Project setup

To connect Next.js Commerce to a Swell store, you will need to set the environment variables [defined in `.env.example`](.env.example). Using [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this is recommended, but a `.env` file is all that is necessary.

> Note: If using an `.env` file, you should not commit this to your repository as it may expose secrets that allow others to access your store.

_To use Vercel Environment Variables:_

1. Install Vercel CLI: `npm i -g vercel`
2. Link a Vercel project: `vercel link` (this creates a `.vercel` directory)
3. Download your environment variables: `vercel env pull`

<details>
  <summary>Expand if you work at Vercel and want to run locally and/or contribute</summary>

1. Run `vc link`.
2. Select the `Vercel Solutions` scope.
3. Connect to the existing `commerce-swell` project.
4. Run `vc env pull` to get environment variables.
5. Run `pnpm dev` to ensure everything is working correctly.
</details>

### Connecting to your Swell store

1. Create a `SWELL_STORE_ID` environment variable and use your Swell store ID as the the value. When logged in to the Swell admin dashboard, the current store's ID is visible in the URL as the subdomain: `https://SWELL_STORE_ID.swell.store/admin/settings/api`

2. In order to use the Frontend API, you need to obtain a public key for your Swell Store. In the admin dashboard, go to _Developer > API keys_ to create a new key. Once created, set this as the value of `SWELL_PUBLIC_KEY` in your environment variables.

<details>
  <summary>Expand to view detailed walkthrough</summary>

1. Navigate to `https://SWELL_STORE_ID.swell.store/admin/settings/api`.
2. Click the `Add public key` button.
   ![Swell add public key](https://github.com/swellstores/verswell-commerce/assets/9212793/aaf595b5-bb94-490c-8d85-8edfc68f9d69)
3. Add a decription to your public key and press the `Create Key` button
   ![swell-internal-next-marketplace swell store_admin_settings_api (1)](https://github.com/swellstores/verswell-commerce/assets/9212793/4b825477-c8e3-410e-abab-f4650b70b5cb)
4. Copy the public key and assign it to the `SWELL_PUBLIC_KEY` environment variable
</details>

### Running locally

> Note: Ensure you are using Node v16 or above before running the install command.

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Production deployment

### Configure on-demand incremental static regeneration (ISR)

Using [on-demand revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating#using-on-demand-revalidation) in Next.js is recommended to optimize data fetching and serve requests from cache unless data is changed.

We can do this with Swell's [webhooks](https://developers.swell.is/backend-api/webhooks/the-webhook-model) triggered by certain [model events](https://developers.swell.is/backend-api/events/event-types), which can notify your Next.js app when data it depends on has changed.

The following webhook events are pre-configured in `/app/api/revalidate/route.ts` and automatically revalidate the Next.js cache.

- `product.created`
- `product.deleted`
- `product.updated`
- `category.created`
- `category.deleted`
- `category.updated`

The above product events are triggered when variants are added, updated, and removed, as well as when stock is updated.

> Note: If you add functionality that uses data from other models, you will need to configure the relevant events to listen for in `/app/api/revalidate/route.ts`.

#### Set up secret for securing webhook requests

1. Create your own secret or [generate a random UUID](https://www.uuidgenerator.net/guid).
2. Create an environment variable named `SWELL_REVALIDATION_SECRET` and use the value from step 1.

#### Configure webhooks in Swell

1. Navigate to `https://SWELL_STORE_ID.swell.store/admin/settings/webhooks`.
2. Add a new webhook pointing to `https://DEPLOYMENT_URL/api/revalidate?secret=SECRET`, where `DEPLOYMENT_URL` is the domain where your app is deployed, and `[SECRET]` is the secret you just created.
3. Select the six product and category events listed above. You can add more sets for other preview urls, environments, or local development.

<details>
  <summary>Expand to view detailed walkthrough</summary>
   ![Swell store webhooks](https://github.com/swellstores/verswell-commerce/assets/9212793/dca90e1c-1802-4d96-925e-582b427e2d5d)
   ![Swell store add webhook](https://github.com/swellstores/verswell-commerce/assets/9212793/25178bf9-ad68-447e-9f3f-eb613005653e)
   ![swell-internal-next-marketplace swell store_admin_settings_api (7)](https://github.com/swellstores/verswell-commerce/assets/9212793/a8565675-3cff-4b61-9881-f243ec5e5746)

#### Testing webhooks during local development

The easiest way to test webhooks while developing locally is to use [ngrok](https://ngrok.com).

1. [Install and configure ngrok](https://ngrok.com/download) (you will need to create an account).
1. Run your app locally, `npm run dev`.
1. In a separate terminal session, run `ngrok http 3000`.
1. Use the url generated by ngrok and add or update your webhook urls in Swell.
1. You can now make changes to your store and your local app should receive updates. You can also use the `Send test notification` button to trigger a generic webhook test.

</details>
