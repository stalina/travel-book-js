---
id: doc-14
title: Google Tag Manager Configuration Guide for Travel Book JS
type: other
created_date: '2025-11-27 08:37'
---
# Google Tag Manager Configuration Guide for Travel Book JS

## Introduction

This guide explains how to configure Google Tag Manager (GTM) to receive and forward custom events to Google Analytics 4 (GA4).

## Prerequisites

- A Google Tag Manager account with the container `GTM-TDDMJFGF` already created
- A Google Analytics 4 property configured
- The GA4 measurement ID (format: `G-XXXXXXXXXX`)

## Architecture overview

```
Vue.js application
    ↓
AnalyticsService (singleton)
    ↓
dataLayer.push({ event: '...', ... })
    ↓
Google Tag Manager (GTM-TDDMJFGF)
    ↓
Google Analytics 4 (G-XXXXXXXXXX)
```

## Custom events sent

The application sends the following events via `dataLayer.push()`:

### 1. `page_view`
- Triggered: on every route change
- Parameters:
  - `page_name`: page identifier (landing, home, editor, privacy)
  - `page_title`: human-friendly page title

### 2. `album_creation_start`
- Triggered: when the user selects a JSON file or folder
- Parameters: none

### 3. `editor_opened`
- Triggered: when the editor opens with data loaded
- Parameters:
  - `step_count`: number of steps in the trip

### 4. `preview_opened`
- Triggered: when the preview is opened
- Parameters: none

### 5. `pdf_exported`
- Triggered: when the user starts a print/PDF export
- Parameters: none

### 6. `consent_update`
- Triggered: when the user updates cookie/analytics consent
- Parameters:
  - `analytics_consent`: `granted` or `denied`

## Google Tag Manager configuration

### Step 1: Create the GA4 configuration tag

1. In GTM, go to **Tags** → **New**
2. Click **Tag Configuration**
3. Select **Google Analytics: GA4 Configuration**
4. Enter your GA4 **Measurement ID** (G-XXXXXXXXXX)
5. Under **Triggering**, select **Initialization - All Pages**
6. Name the tag: `GA4 - Configuration`
7. Save

### Step 2: Create custom triggers

Create a trigger for each custom event:

#### Trigger: page_view
1. **Triggers** → **New**
2. Type: **Custom Event**
3. Event name: `page_view`
4. Save as: `CE - Page View`

#### Trigger: album_creation_start
1. **Triggers** → **New**
2. Type: **Custom Event**
3. Event name: `album_creation_start`
4. Save as: `CE - Album Creation Start`

#### Trigger: editor_opened
1. **Triggers** → **New**
2. Type: **Custom Event**
3. Event name: `editor_opened`
4. Save as: `CE - Editor Opened`

#### Trigger: preview_opened
1. **Triggers** → **New**
2. Type: **Custom Event**
3. Event name: `preview_opened`
4. Save as: `CE - Preview Opened`

#### Trigger: pdf_exported
1. **Triggers** → **New**
2. Type: **Custom Event**
3. Event name: `pdf_exported`
4. Save as: `CE - PDF Exported`

### Step 3: Create dataLayer variables

To capture event parameters, create dataLayer variables:

#### Variable: page_name
1. **Variables** → **New**
2. Type: **Data Layer Variable**
3. Data Layer Variable Name: `page_name`
4. Save as: `DL - Page Name`

#### Variable: page_title
1. **Variables** → **New**
2. Type: **Data Layer Variable**
3. Data Layer Variable Name: `page_title`
4. Save as: `DL - Page Title`

#### Variable: step_count
1. **Variables** → **New**
2. Type: **Data Layer Variable**
3. Data Layer Variable Name: `step_count`
4. Save as: `DL - Step Count`

### Step 4: Create event tags

Create a GA4 event tag for each custom event:

#### Tag: Page View
1. **Tags** → **New**
2. Type: **Google Analytics: GA4 Event**
3. Measurement ID: use the built-in `{{Google tag: measurement ID}}` variable
4. Event name: `page_view`
5. Event parameters:
   - add row: `page_name` → `{{DL - Page Name}}`
   - add row: `page_title` → `{{DL - Page Title}}`
6. Trigger: `CE - Page View`
7. Save as: `GA4 - Event - Page View`

#### Tag: Album Creation Start
1. **Tags** → **New**
2. Type: **Google Analytics: GA4 Event**
3. Measurement ID: use the built-in `{{Google tag: measurement ID}}` variable
4. Event name: `album_creation_start`
5. Trigger: `CE - Album Creation Start`
6. Save as: `GA4 - Event - Album Creation Start`

#### Tag: Editor Opened
1. **Tags** → **New**
2. Type: **Google Analytics: GA4 Event**
3. Measurement ID: use the built-in `{{Google tag: measurement ID}}` variable
4. Event name: `editor_opened`
5. Event parameters:
   - add row: `step_count` → `{{DL - Step Count}}`
6. Trigger: `CE - Editor Opened`
7. Save as: `GA4 - Event - Editor Opened`

#### Tag: Preview Opened
1. **Tags** → **New**
2. Type: **Google Analytics: GA4 Event**
3. Measurement ID: use the built-in `{{Google tag: measurement ID}}` variable
4. Event name: `preview_opened`
5. Trigger: `CE - Preview Opened`
6. Save as: `GA4 - Event - Preview Opened`

#### Tag: PDF Exported
1. **Tags** → **New**
2. Type: **Google Analytics: GA4 Event**
3. Measurement ID: use the built-in `{{Google tag: measurement ID}}` variable
4. Event name: `pdf_exported`
5. Trigger: `CE - PDF Exported`
6. Save as: `GA4 - Event - PDF Exported`

## Step 5: Test the configuration

### GTM Preview mode

1. In GTM, click **Preview** in the top-right corner
2. Enter your site URL: `https://stalina.github.io/travel-book-js/`
3. The Tag Assistant will connect to your site
4. Test each event:
   - Navigate between pages → check `page_view`
   - Import a JSON file → check `album_creation_start`
   - Open the editor → check `editor_opened`
   - Open the preview → check `preview_opened`
   - Click print → check `pdf_exported`

### Verify in GA4 realtime

1. Open Google Analytics 4
2. Go to **Reports** → **Realtime**
3. Perform actions on the site
4. Verify events appear in the realtime report

## Step 6: Publish the version

When tests are successful:

1. In GTM click **Submit** in the top-right corner
2. Name the version: `v1.0 - Initial GA4 setup`
3. Add a description: `Initial configuration of custom events`
4. Click **Publish**

## Useful reports in GA4

### Funnel exploration report

1. In GA4 go to **Explore**
2. Create a new **Funnel exploration**
3. Configure the steps:
   - Step 1: `page_view` (page_name = 'landing')
   - Step 2: `album_creation_start`
   - Step 3: `editor_opened`
   - Step 4: `preview_opened`
   - Step 5: `pdf_exported`

This gives a visualization of the user journey and conversion rate at each step.

### Custom events

In **Reports** → **Engagement** → **Events** you will see all custom events and their counts.

## Consent management

The implemented code follows GDPR rules:

1. Before consent: GTM is not loaded, only `dataLayer` is initialized
2. After acceptance: the page reloads and GTM is loaded
3. After denial: events are blocked by `AnalyticsService`

Consent is stored in `localStorage` under the key `analytics_consent`.

## Troubleshooting

### Events do not appear in GTM Preview

- Check that consent is granted (cookie banner)
- Open the browser console and check `[Analytics]` logs
- Verify `dataLayer` contains your events: `console.log(window.dataLayer)`

### Events appear in GTM but not in GA4

- Verify the GA4 measurement ID is correct
- Wait a few minutes (propagation delay)
- Check GA4 realtime reports

### Site does not load GTM

- Clear localStorage: `localStorage.clear()`
- Reload the page
- Accept cookies via the banner

## Resources

- [GTM documentation](https://support.google.com/tagmanager)
- [GA4 documentation](https://support.google.com/analytics/answer/9304153)
- [GTM dataLayer](https://developers.google.com/tag-platform/tag-manager/datalayer)
