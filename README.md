# MindfulMeals

Live link: https://mindfulmealsbd.vercel.app/

## Summary

MindfulMeals is a full-stack wellness and meal-planning application focused on helping users track meals, hydration, mood, health metrics, and recipes. The project includes a React + Vite client and a Node.js/Express server with MongoDB for persistence. It also integrates image analysis and external nutrition/recipe APIs to enrich user experience.

## Key Features

- User authentication and profiles
- Meal tracking and reminders
- Hydration logging
- Mood tracker and patterns view
- Recipe lab with creation and image analysis
- Admin tools for uploading challenges and managing content
- Integrations with image analysis and external nutrition services

## Live Site

Visit the deployed site: https://mindfulmealsbd.vercel.app/

## Repository Structure (high level)

- `client/` — React frontend built with Vite. Contains UI components, pages, and build config.
- `server/` — Express backend, MongoDB models, controllers, routes, and utility services.
- Configuration and scripts for seeding sample data and scheduled reminders are included under `scripts/` and `server/scripts/`.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication + hosting: Firebase / Vercel (used in this project setup)
- External services: Spoonacular/FatSecret-style nutrition APIs, image analysis services


## Deployment

The live site is deployed on Vercel (frontend) at the link above. The backend can be deployed to a provider of your choice (e.g. Vercel serverless functions, Heroku, Render) with environment variables configured.

## Contributing

Contributions are welcome. Typical workflow:

1. Fork the repository
2. Create a feature branch
3. Open a pull request with a description of your changes

## Useful Files



# MindfulMeals — Overview

![Live](https://img.shields.io/badge/Live-Online-brightgreen)

Live demo: https://mindfulmealsbd.vercel.app/

Tagline: A compassionate app for mindful eating, hydration, and mood tracking.

MindfulMeals is a wellness-first meal planning and tracking web app designed to help people build healthier eating and lifestyle habits through gentle tracking, personalized insights, and supportive challenges.

Core goals:

- Encourage mindful eating by making meal and hydration tracking simple and non-judgmental.
- Surface patterns in mood and nutrition so users can make informed, sustainable changes.
- Provide easy recipe creation and discovery, enhanced by image analysis and nutrition data.

What it offers:

- Lightweight meal logging with optional photos and image recognition to streamline entry.
- Hydration tracking and reminders to build consistent habits.
- Mood tracking with visualization of patterns over time.
- Recipe lab for creating, analyzing, and saving recipes; integrations enrich entries with nutrition information.
- Community/admin-driven challenges to motivate users with achievable goals.

Who benefits:

- Individuals wanting a compassionate, habit-focused approach to nutrition.
- Health coaches and admins who want to create challenges and content for their communities.

Live site: https://mindfulmealsbd.vercel.app/
