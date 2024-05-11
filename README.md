# Ride Management System
## Overview
This module facilitates managing a ride-sharing system that includes rides and ride reviews. It allows operations such as adding rides, updating ride information, deleting rides, fetching ride details, fetching all rides, searching rides by location, filtering rides by date range, filtering rides by available seats, updating ride start and end locations, updating ride date and time, and adding and fetching ride reviews.

### Entity Types
1. **Ride**: Represents a ride offered by a provider with properties like ID, provider ID, date, start time, end time, start location, end location, available seats, description, creation date, and last update date.
2. **RideReview**: Represents a review submitted by a user for a ride with properties like ID, ride ID, user ID, rating, comment, and creation date.

### Functions
1. **addRide**: Adds a new ride with specified details.
2. **updateRide**: Updates information for a ride specified by its ID.
3. **deleteRide**: Deletes a ride specified by its ID.
4. **getRide**: Retrieves details of a ride specified by its ID.
5. **getAllRides**: Retrieves details of all rides.
6. **searchRidesByStartLocation**: Searches rides by start location.
7. **searchRidesByEndLocation**: Searches rides by end location.
8. **filterRidesByDateRange**: Filters rides by date range.
9. **filterRidesByAvailableSeats**: Filters rides by available seats.
10. **updateRideStartLocation**: Updates the start location of a ride specified by its ID.
11. **updateRideEndLocation**: Updates the end location of a ride specified by its ID.
12. **updateRideDate**: Updates the date of a ride specified by its ID.
13. **updateRideStartTime**: Updates the start time of a ride specified by its ID.
14. **updateRideEndTime**: Updates the end time of a ride specified by its ID.
15. **addRideReview**: Adds a new review for a ride.
16. **getRideReviews**: Retrieves all reviews for a ride specified by its ID.
17. **getRideAverageRating**: Retrieves the average rating for a ride specified by its ID.

### Usage
1. Add rides using `addRide`.
2. Update ride information using `updateRide`.
3. Delete rides using `deleteRide`.
4. Fetch ride details using `getRide`.
5. Fetch details of all rides using `getAllRides`.
6. Search rides by start location using `searchRidesByStartLocation`.
7. Search rides by end location using `searchRidesByEndLocation`.
8. Filter rides by date range using `filterRidesByDateRange`.
9. Filter rides by available seats using `filterRidesByAvailableSeats`.
10. Update ride start location using `updateRideStartLocation`.
11. Update ride end location using `updateRideEndLocation`.
12. Update ride date using `updateRideDate`.
13. Update ride start time using `updateRideStartTime`.
14. Update ride end time using `updateRideEndTime`.
15. Add ride reviews using `addRideReview`.
16. Fetch ride reviews using `getRideReviews`.
17. Fetch the average rating for a ride using `getRideAverageRating`.

### Note
This module requires the `azle` library for interaction with the IC (Internet Computer) environment and the `uuid` library for generating unique identifiers. Additionally, it mocks the 'crypto' object for testing purposes.