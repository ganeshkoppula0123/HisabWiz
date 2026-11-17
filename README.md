# HisabWiz

### Everyday calculators for money, shops, property, and life

HisabWiz is a mobile-first calculator toolkit built with plain HTML, CSS, and JavaScript. Calculators work without an account, and recent calculations stay on the device. Optional sign-in and profiles can be enabled with a Supabase project.

![HTML5](https://img.shields.io/badge/HTML5-structure-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-responsive-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-installable-287252)
![GitHub Pages](https://img.shields.io/badge/deployment-GitHub%20Pages-222222?logo=github)

> **Project status:** The GitHub Pages workflow is configured, but this folder has not yet been published to a GitHub repository.

## Features

### 13 practical calculators

| Tool | What it does |
| --- | --- |
| Simple interest | Estimate simple interest using a monthly rate per ₹100 and a month- or year-based duration. |
| Basic calculator | Add, subtract, multiply, and divide, with a live preview before `=`. |
| GST billing | Estimate quantity, discount, GST-inclusive or exclusive totals, CGST/SGST or IGST, and gross profit. |
| Property | Convert common land-area units and optionally estimate value from price per square foot. |
| Loan EMI | Estimate monthly reducing-balance payments, total interest, and repayment. |
| Percentage | Find a percentage of an amount, calculate a share, or compare a price change. |
| Date | Count elapsed days or add/subtract days from a date. |
| Age | Calculate age in years and months, with the next birthday. |
| Unit converter | Convert length, weight, volume, area, and temperature. |
| Fuel cost | Estimate trip fuel use and cost from distance, mileage, and fuel price. |
| Electricity bill | Estimate energy and fixed charges using units and a per-unit rate entered by the user. |
| Bill split | Divide a bill evenly among a group, with an optional tip. |
| Savings goal | Estimate monthly savings needed or time to goal; investment returns are not assumed. |

The home page shows all 13 tools and an animated spotlight for popular interest, EMI, shop billing, percentage, and property calculations. A daily spinner also offers a good wish and a random, emoji-matched line from **365 original positive quotes**.

### Built for everyday use

- **Mobile-first UI:** responsive layout, keyboard access, and visible focus states.
- **Installable PWA:** manifest, home-screen icons, and an offline app shell when served over HTTPS.
- **On-device history:** up to 10 recent summaries, with a clear-history action.
- **Copy results:** use the copy controls where browser clipboard support is available.
- **Optional accounts:** Supabase email/password sign-in and editable profiles; registration is never required to use calculators.
- **Privacy-minded:** no analytics or ads. Calculations and calculation history stay in the browser.

## Run locally

1. Download or clone the project.
2. Open `index.html` in a browser, or double-click `start_app.bat`.

Opening the file directly supports calculations, but browser installation and service-worker offline caching require `localhost` or HTTPS. Supabase sign-in also requires a configured project and a `localhost` or HTTPS origin.

## Optional Supabase accounts

This app is configured for its Supabase project in `supabase-config.js`. If you connect a different project:

1. Copy the project’s **Project URL** and **anon/public or publishable key** into `supabase-config.js`. This file is browser-visible; **never use a service-role or secret key**.
2. Apply `supabase/migrations/20261118000000_create_profiles.sql` in the project’s SQL editor. It creates a `profiles` table with row-level security so each signed-in user can access only their own profile.
3. Configure Supabase Auth email confirmation and allowed redirect/site URLs for the deployed HTTPS origin and any local development origin.
4. Serve the app on `localhost` or HTTPS and test registration, email confirmation, sign-in, profile editing, and sign-out.

Email/password auth is provided by the Supabase JavaScript client, loaded from a CDN only when both public configuration values are present. Account features need an internet connection; the calculators remain usable without signing in or when account configuration is absent. Passwords are sent to Supabase for authentication and are not saved by HisabWiz.

## Publish with GitHub Desktop

Git is **not installed** in the project environment, and this folder is not yet a Git repository. GitHub Desktop is the simplest Windows option; it includes Git integration, so a separate Git install is not required.

1. Create a GitHub account at [github.com/signup](https://github.com/signup), if needed.
2. Download and install [GitHub Desktop](https://desktop.github.com/), then sign in.
3. In GitHub Desktop, choose **File → Add Local Repository** and select this project folder.
4. If prompted that it is not a repository, choose the option to create a repository in the selected folder. Keep the existing project files.
5. Commit the project files, then choose **Publish repository**. Choose a repository name such as `HisabWiz`. A public repository is the simplest option for a free GitHub Pages site.
6. On GitHub, open **Settings → Pages** and choose **GitHub Actions** as the deployment source.
7. Push the `main` branch. The included workflow deploys the static app; check the **Actions** tab for completion and the deployed site URL.

The workflow is at `.github/workflows/deploy-pages.yml`. It copies the app, quote data, privacy page, and icons into the Pages artifact. Relative asset paths allow the PWA to work from a repository subpath.

### Alternative: Git for Windows

If you prefer the command line, install [Git for Windows](https://git-scm.com/download/win), then initialize and push this folder using Git. Do not commit credentials, signing keys, or private customer data.

## Project files

```text
.
├── index.html                 # App UI and calculator forms
├── styles.css                 # Responsive styling
├── script.js                  # Calculator logic, navigation, and spinner behavior
├── auth.js                    # Optional Supabase authentication and profile UI
├── supabase-config.js         # Browser-visible Supabase URL and public key
├── daily-quotes.js            # 365 locally generated positive quote lines
├── manifest.webmanifest       # PWA metadata and icons
├── service-worker.js          # Offline app-shell cache
├── privacy.html               # Privacy information
├── supabase/migrations/       # Supabase profile table and row-level security
├── icons/                     # PWA, Apple, favicon, and store icons
└── .github/workflows/         # GitHub Pages deployment workflow
```

## Calculation and privacy notes

- Interest is simple interest, not compounded.
- GST, EMI, fuel, and property results are estimates. Check actual rates, tax rules, lender terms, and local land-unit definitions.
- GST billing supports 0%, 5%, 12%, 18%, and 28% examples. It rounds tax amounts to the nearest paise and is not an official tax invoice or tax service; verify the applicable rate and place-of-supply rules.
- The electricity estimator uses the per-unit rate and fixed charges entered by the user. It does not apply provider tariff slabs, subsidies, duties, or taxes automatically.
- The savings planner does not include interest or investment returns.
- Date differences count elapsed days and do not count the start date.
- Calculation inputs stay in the browser. Recent summaries are stored in local browser storage; exact birth dates are not included in age history.
- The daily wish and quote are selected locally and are not saved.
- This app is a calculator, not financial, tax, lending, medical, or property advice.

## Name

**HisabWiz** combines *hisab* (calculation or accounts) with *wiz* (a quick, helpful expert). Name screening is preliminary only and is not trademark or legal clearance. Check current app listings and the relevant trademark registries before commercial release.

## Presentation

See the [HisabWiz project overview presentation](./HisabWiz-Project-Overview.pptx) for the problem, features, privacy approach, technical overview, deployment steps, and roadmap.
