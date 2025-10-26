# TODO: Add Good Error Handling to Endpoints

- [x] Update server.js: Add global error-handling middleware after route definitions
- [x] Update controller.js - getCountries: Enhance query param validation and database error handling
- [x] Update controller.js - postCountries: Add specific error handling for API fetches and database operations
- [x] Update controller.js - getStatus: Add try-catch block and handle case where no countries exist
- [x] Update controller.js - getCountry: Add check for country not found (404)
- [x] Update controller.js - deleteCountry: Add check if country exists before deletion (404)
- [x] Update controller.js - getImg: Wrap file operations in try-catch
- [x] Test the server and endpoints to verify error handling
