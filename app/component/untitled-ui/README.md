# Free Untitled UI components

The calendar uses local adaptations of the free Button and Badge/BadgeWithDot from
[untitleduico/react](https://github.com/untitleduico/react), commit
`1d410cb8facde8d50869e7bbb5f3d048e2267466` (MIT; see LICENSE).

Original paths: `components/base/buttons/button.tsx` and
`components/base/badges/badges.tsx`.

Adaptations keep the needed button and badge variants, React Aria button behavior,
and Tailwind class merging. Colors use this application's existing blue palette,
Thai labels remain at least 14px, and loading animations respect reduced motion.
No global Untitled UI reset or PRO component is installed.

Scheduling is provided by FullCalendar Standard (`@fullcalendar/react`, MIT),
using daygrid, timegrid, interaction and the Monarch theme. No Premium plugin is used.
