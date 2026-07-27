# Hacker News Newest Sort Validation

## Overview
This repository contains implementations of an algorithm to validate that the first 100 articles on Hacker News `/newest` are sorted in descending chronological order (newest to oldest). Implementations are provided in HTML, CSS, JavaScript, Python, TypeScript, and Java.

## Execution
- **HTML/CSS/JS**: Open `index.html` in a modern web browser and click the validation button.
- **Python**: Requires `aiohttp`. Execute via `python validate.py`.
- **TypeScript**: Requires Node.js 18+. Execute via `npx ts-node validate.ts`.
- **Java**: Requires Java 11+ and Jackson Databind. Compile and execute `HackerNewsValidator.java`.

## Algorithm
1. Fetch the array of new story IDs from the Firebase API.
2. Isolate the first 100 IDs.
3. Concurrently fetch the metadata for each ID to extract the Unix timestamp.
4. Iterate through the timestamps to verify `timestamp[i] <= timestamp[i-1]`.
5. Return success or failure based on the validation loop.
