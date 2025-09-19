# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fa2f38e2-5939-4c65-a945-2c0f8029da84

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fa2f38e2-5939-4c65-a945-2c0f8029da84) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Card art assets

Custom artwork for cards should be stored in `public/card-art/` with filenames that match the card ID. The game first looks for a
`<cardId>.jpg` image and then for `<cardId>.png`. If neither file is present the UI will automatically fall back to the existing
placeholder illustrations.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fa2f38e2-5939-4c65-a945-2c0f8029da84) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Unified AI configuration & debugging

The new unified AI stack uses the enhanced strategist pipeline that powers both the in-game agent and automated tests.

- Instantiate the AI with `AIFactory.createStrategist(difficulty)`. This returns an enhanced strategist wired to the latest `AI_PRESETS` for `easy`, `medium`, `hard`, and `legendary` modes. For lower-level experiments you can also call `createAiStrategist` directly from `@/data/aiStrategy` to obtain the normalized baseline heuristics.
- Turn planning flows through `chooseTurnActions` in `@/ai/enhancedController`. Pass the live game state and strategist to receive a ranked list of card plays plus short-form `sequenceDetails` suitable for logging.
- Strategy logging defaults to concise one-line summaries. Set the `featureFlags.aiVerboseStrategyLog` flag (see `@/state/featureFlags`) to include the full adaptive context, synergy notes, and evaluation breakdowns in the game log when debugging complex situations.
- All supported difficulties—`EASY`, `NORMAL`, `HARD`, and `TOP_SECRET_PLUS`—are exercised via `bun test`. The `src/ai/__tests__/unifiedAiPlanning.test.ts` suite simulates turns to ensure at least one legal card is played and that the generated strategy messages stay brief. Run `bun test` after tweaking presets or heuristics to confirm the AI still behaves as expected.
