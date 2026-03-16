# Testing with Mock Credentials

To test the application without real SRRMist credentials, use the following mock login:

- **Email**: `mock` or `mock@srmist.edu.in`
- **Password**: (any value, e.g., `mock`)

## Implementation Details

- The mock logic is implemented in `utils/index.ts`.
- It returns a special `MOCK_TOKEN`.
- All major data-fetching functions (`getAttendance`, `getTimetable`, `getMarks`, etc.) are intercepted to return static data from `utils/mockData.ts` when this token is present.
