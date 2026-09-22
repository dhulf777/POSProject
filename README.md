# SOAR Coffee Shop POS

A lightweight front-of-house and back-of-house order dashboard for the SOAR Coffee Shop team.

## Features

- Clock team members in and out by role
- Track work history and current team status
- Build drink orders with drink, cream, caramel, and vanilla options
- Add customer names and special requests to tickets
- Track active orders with a 10-minute preparation estimate
- Mark orders complete and restore completed orders
- Rotate front-of-house Taylor Swift quotes automatically or manually
- Save an end-of-day summary with team hours, order counts, drink breakdowns, and averages
- Save students, shift logs, orders, and completed orders in browser `localStorage`

## Run It

No build step or dependencies are required.

1. Open `index.html` in a browser.
2. Enter a team member name and choose a role to clock in.
3. Build an order and send it to the bar.

For a local server, run one of these from the project folder:

```text
python -m http.server
```

Then visit `http://localhost:8000`.

## Project Files

- `index.html` - Page structure and user interface
- `styles.css` - Shared styling
- `app.js` - Clock-in, order, ticket, storage, and quote rotation logic

## Data Storage

The app stores data locally in the current browser. Clearing browser site data will remove saved students, shift history, active orders, and completed orders.

End-of-day summaries are also stored by local calendar date. The `End day` control is located at the bottom of the page and requires typing `END DAY` before saving a snapshot. Returning to the site in the same browser shows the saved summary for that date.

## Team Areas

- **Front of house:** Team check-in and quote display
- **Back of house:** Drink building, order tickets, and queue management
