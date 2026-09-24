# Verification Notes

## Source validation completed

- All server `.js` files passed `node --check`.
- All client `.jsx`/`.js` files and server files passed TypeScript parser/transpilation syntax validation.
- Postman collection JSON was parsed successfully.
- Project structure was inspected after generation.

## Full dependency/build validation

A full `npm install` could not be completed in the generation environment because the package registry operation timed out. Therefore, this submission does **not** claim that a live Vite production build or live MongoDB integration was executed here.

The dependency versions and Vite/Tailwind setup follow the current documented Vite/Tailwind approach. Run `npm run setup` locally, then `npm run build` and `npm run seed` against your MongoDB Atlas connection before final submission.

## Recommended final local checks

1. `npm run setup`
2. Configure `server/.env` with the Atlas connection string and a strong JWT secret.
3. `npm run seed`
4. `npm run dev`
5. Log in using each demo role.
6. Test a duplicate attendance session.
7. Test the correction approval workflow.
8. Test cross-tenant isolation using the second demo institution.
9. `npm run build`
