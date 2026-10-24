# Shared vehicle calendar

`/calendar` is available to every active signed-in USER, APPROVER and ADMIN,
independently of `BOOKING_VIEW`. It is read-only.

## UI

FullCalendar Standard provides month, week and day views. The initial view is month;
week starts on Monday. All dates use `Asia/Bangkok`, Thai labels, Buddhist years in
the page heading/details and 24-hour time. Calendar events open the selected day's
travel details. On mobile, the week grid scrolls within its container.

The toolbar, status badges, details panel and current-fleet table follow Untitled UI.
The free, adapted components and their MIT license/provenance are documented in
`app/component/untitled-ui/README.md`. No paid component or scheduler plugin is used.

## API

`GET /api/calendar?start=2026-10-26&end=2026-11-02` returns the bookings overlapping
the visible calendar range plus the current fleet. Both bounds are Bangkok dates
in `YYYY-MM-DD` format; `end` is exclusive. A range must be positive and at most
62 days. Invalid/incomplete dates or mixing `month` with a range returns 400.

The legacy `?month=YYYY-MM` request still works; omitting all filters defaults to
the current Bangkok month. Range responses add `range: { start, end }` to the
existing `month`, `asOf`, `bookings`, `vehicles` payload. Responses are private/no-store.

Calendar views request the actual visible dates, including adjacent-month cells
and weeks crossing a month/year boundary. Only PENDING, APPROVED, CHANGED,
IN_PROGRESS and COMPLETED bookings are included. A booking ending at midnight
does not appear on the next day.

## Current custody and freshness

Current fleet data is independent of the viewed dates. A holder needs an
IN_PROGRESS booking with a pickup recorded and no return; overdue holders remain
visible until return. Multiple holders are all displayed with a warning.
Maintenance takes status priority, followed by in-use, currently approved/changed,
then available. Status calculations never update the database.

Data refreshes every 30 seconds while the page is visible, on focus/visibility
return, and on manual refresh. Cancelled/superseded requests cannot overwrite a
newer range. Failed refreshes preserve the last successful data with an error.

## Verification

`npm test` covers range validation, overlap, custody and authorization.
`npx playwright test e2e/calendar.e2e.ts` exercises all roles, the three views,
details, cross-month ranges, mobile, keyboard interaction, refresh and errors.
The browser runs in America/Los_Angeles to verify the fixed Bangkok display.
