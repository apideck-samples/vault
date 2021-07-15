# Integration settings

#### A sample project for managing integration settings with the [Apideck Vault API](https://developers.apideck.com/apis/vault/reference).

Building integrations starts with handling user credentials and generating access tokens for the APIs you want to use. When you're looking to connect to an API, the first step is authentication. Vault helps you store API keys, integration settings, and access tokens from customers.

Built with [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind](https://tailwindcss.com/).

![](/public/img/vault.png)

## Run the sample locally

### Requirements

- **An Apideck account**: You can sign up for an Apideck account here: https://app.apideck.com/signup
- **Apideck Application ID**: Available in your Apideck dashboard.
- **Apideck API Key**: Available in your Apideck dashboard.
- **Configured Integrations**: This sample shows how to manage credentials for integrations. You'll need to select and configure the integrations you want to make available to your users.

### Installing the sample

This project uses the Vault API. Visit https://developers.apideck.com/apis/vault/reference for documentation of the API.

#### Step 1: Update your environment variables

- Copy `.env.example` and create a `.env.local` file
- Add your API key: `UNIFY_API_KEY=<your-api-key>`
- Your env should also include `NEXT_PUBLIC_UNIFY_API_URL=https://unify.apideck.com`
- Optional: Add a Busnag API key to activate [Bugsnag](https://www.bugsnag.com/) error monitoring.

#### Step 2: Install dependencies

- Install dependencies with `yarn` or `npm install`
- Run the development server with `yarn dev` or `npm run dev`
- Visit `http://localhost:3003/` to see if it's running. You should see a message that your session is invalid.

#### Step 3: Create a new session

You have to make a POST request to the Vault API to create a valid session for a user, hereafter referred to as the consumer ID.
In order to make the request, you need your Apideck API Key, Application ID, and Consumer ID. The Consumer ID is stored inside Apideck Vault. This can be a user ID, account ID, device ID, or another entity that can be linked to integrations within your app.

Your request headers should include `Authorization`, `X-APIDECK-CONSUMER-ID`, and `X-APIDECK-APP-ID`.
The body of your request should include the `redirect_uri`, which is used for the return link, and the consumer data:

```
  consumer_metadata: {
    account_name: 'Apideck Vault Sample',
    user_name: 'vault@apideck.com',
    image: 'https://unavatar.now.sh/testing-vault'
  },
  redirect_uri: 'https://app.apideck.com',
```

After making the request, you should receive a response that includes the `session_uri` that has the bearer token that is needed to run the sample project. Copy the `session_uri`, paste it in your browser and replace `https://vault.apideck.com` with `localhost:3003`. Your URL should look like this: `http://localhost:3003/session/<your-bearer-token>`.

If you add your API key, Application ID, and consumer ID to the `.env.local` file you can also start a session from the UI (only during development). When you start the application and get prompt with the "session invalid" message, you can click the "Create session" button to make an API request to the Vault API and get redirected to the `/session/<token>` route.

##### Example using curl

```
curl -X POST https://unify.apideck.com/vault/sessions
    -H "Content-Type: application/json"
    -H "Authorization: Bearer <your-api-key>"
    -H "X-APIDECK-CONSUMER-ID: <consumer-id>"
    -H "X-APIDECK-APP-ID: <application-id>"
    -d '{"consumer_metadata": { "account_name" : "Sample", "user_name": "vault@sample", "image": "https://unavatar.now.sh/jake" }}'
```

##### Example using Postman

An easy way to make requests is by using [Postman](https://www.postman.com/), a tool for API development. You can download it here: https://www.postman.com/downloads/.

**Step 1: Authorize**<br/>
To verify the identity of the client sending a request, you need to add your API key to the request headers.

- Open the Authorization tab in Postman and select the type `Bearer Token`.
- Add your API key to the `token` field

**Step 2: Add request headers**<br/>
Open the Headers tab in Postman and add the following headers:

- `X-APIDECK-CONSUMER-ID` - Your Consumer ID
- `X-APIDECK-APP-ID` - Your Application ID

**Step 3: Make Request**<br/>
You should now be able to make requests to the Vault API.

- Enter the session URL to the request field: https://unify.apideck.com/vault/sessions
- Make sure you're making a POST request

#### Theming

By default, the Vault will match the colors of your Apideck ecosystem. If you haven't made any changes in the theming settings of your ecosystem, you could also overwrite the default settings inside `src/config/defaults` or send a `theme` object in the body of the `session` request.

#### Logs

By default, the logs are shown. If you want to hide the logs view, send `show_logs: false` inside the `settings` object when creating a session or change the default settings inside `src/config/defaults`.

## Hosted Vault

A hosted version of the Vault is a simple solution, so you don't need to build your own UI to handle the integration settings and authentication. The Hosted Vault is a great way to explore Unify without needing to build an integrations overview to get started. Visit https://app.apideck.com/ to learn more.
