// Importing necessary modules from the 'azle' library and 'uuid' library
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from "uuid";

// Define types for RideRecord and RidePayload
type RideRecord = Record<{
 id: string;
 providerId: string;
 date: string;
 startTime: string;
 endTime: string;
 startLocation: string;
 endLocation: string;
 availableSeats: number;
 description: string;
 createdAt: nat64;
 updatedAt: Opt<nat64>;
 averageRating: Opt<number>; // New field to store the average rating
}>

type RidePayload = Record<{
 providerId: string;
 date: string;
 startTime: string;
 endTime: string;
 startLocation: string;
 endLocation: string;
 availableSeats: number;
 description: string;
}>

type RideReviewRecord = Record<{
 id: string;
 rideId: string;
 userId: string;
 rating: number;
 comment: string;
 createdAt: nat64;
}>

type RideReviewPayload = Record<{
 rideId: string;
 userId: string;
 rating: number;
 comment: string;
}>

// Create a map to store ride records
const rideStorage = new StableBTreeMap<string, RideRecord>(0, 44, 1024);
// Create a map to store ride review records
const rideReviewStorage = new StableBTreeMap<string, RideReviewRecord>(2, 44, 1024);

// Function to add a ride review
$update;
export function addRideReview(payload: RideReviewPayload): Result<RideReviewRecord, string> {
 // Validate the input payload
 if (!payload.rideId || !payload.userId || payload.rating < 1 || payload.rating > 5 || !payload.comment) {
   return Result.Err("Invalid input payload");
 }

 const review: RideReviewRecord = { id: uuidv4(), createdAt: ic.time(), ...payload };
 rideReviewStorage.insert(review.id, review);

 // Update the average rating for the ride
 updateRideAverageRating(payload.rideId, review.rating);

 return Result.Ok(review);
}

// Function to update the average rating for a ride
function updateRideAverageRating(rideId: string, newRating: number): void {
 match(rideStorage.get(rideId), {
   Some: (record) => {
     let totalRatings = 1;
     let averageRating = newRating;

     if (record.averageRating.isSome()) {
       const prevAvgRating = record.averageRating.unwrap();
       const prevTotalRatings = rideReviewStorage.values().filter(review => review.rideId === rideId).length;
       totalRatings = prevTotalRatings + 1;
       averageRating = ((prevAvgRating * prevTotalRatings) + newRating) / totalRatings;
     }

     const updatedRecord: RideRecord = { ...record, averageRating: Opt.Some(averageRating) };
     rideStorage.insert(record.id, updatedRecord);
   },
   None: () => {
     // Handle the case when the ride is not found
   }
 });
}

// Function to get all ride reviews for a ride
$query;
export function getRideReviews(rideId: string): Result<Vec<RideReviewRecord>, string> {
 const reviews = rideReviewStorage.values().filter(review => review.rideId === rideId);
 return Result.Ok(reviews);
}

// Function to get average rating for a ride
$query;
export function getRideAverageRating(rideId: string): Result<number, string> {
 return match(rideStorage.get(rideId), {
   Some: (record) => {
     if (record.averageRating.isSome()) {
       return Result.Ok(record.averageRating.unwrap());
     } else {
       return Result.Err("No reviews found for the ride");
     }
   },
   None: () => Result.Err("Ride not found")
 });
}

// Function to add a ride
$update;
export function addRide(payload: RidePayload): Result<RideRecord, string> {
 // Validate the input payload
 if (!payload.providerId || !payload.date || !payload.startTime || !payload.endTime || !payload.startLocation || !payload.endLocation || !payload.availableSeats || !payload.description) {
   return Result.Err("Invalid input payload");
 }

 const record: RideRecord = { id: uuidv4(), createdAt: ic.time(), updatedAt: Opt.None, averageRating: Opt.None, ...payload };
 rideStorage.insert(record.id, record);
 return Result.Ok(record);
}

// Generic function to update a ride
$update;
export function updateRide(id: string, payload: RidePayload): Result<RideRecord, string> {
 return match(rideStorage.get(id), {
   Some: (record) => {
     const updatedRecord: RideRecord = { ...record, ...payload, updatedAt: Opt.Some(ic.time()) };
     rideStorage.insert(record.id, updatedRecord);
     return Result.Ok<RideRecord, string>(updatedRecord);
   },
   None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
 });
}

// Function to delete a ride
$update;
export function deleteRide(id: string): Result<RideRecord, string> {
 return match(rideStorage.remove(id), {
   Some: (deletedRecord) => Result.Ok<RideRecord, string>(deletedRecord),
   None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
 });
}

// Function to get a ride
$query;
export function getRide(id: string): Result<RideRecord, string> {
 return match(rideStorage.get(id), {
   Some: (record) => Result.Ok<RideRecord, string>(record),
   None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
 });
}

// Function to get all rides
$query;
export function getAllRides(): Result<Vec<RideRecord>, string> {
 return Result.Ok(rideStorage.values());
}

// Generic function to filter rides
$query;
export function filterRides(filterCriteria: {
 startLocation?: string;
 endLocation?: string;
 startDate?: string;
 endDate?: string;
 minAvailableSeats?: number;
}): Result<Vec<RideRecord>, string> {
 const records = rideStorage.values();
 const filteredRides = records.filter(ride => {
   let match = true;

   if (filterCriteria.startLocation && ride.startLocation.toLowerCase() !== filterCriteria.startLocation.toLowerCase()) {
     match = false;
   }

   if (filterCriteria.endLocation && ride.endLocation.toLowerCase() !== filterCriteria.endLocation.toLowerCase()) {
     match = false;
   }

   if (filterCriteria.startDate && filterCriteria.endDate && (ride.date < filterCriteria.startDate || ride.date > filterCriteria.endDate)) {
     match = false;
   }

   if (filterCriteria.minAvailableSeats && ride.availableSeats < filterCriteria.minAvailableSeats) {
     match = false;
   }

   return match;
 });

 return Result.Ok(filteredRides);
}

// Function to update the available
Seats for a ride
$update;
export function updateRideAvailableSeats(id: string, newAvailableSeats: number): Result<RideRecord, string> {
return updateRide(id, { availableSeats: newAvailableSeats });
}
// Function to get all rides provided by a specific provider
$query;
export function getRidesByProvider(providerId: string): Result<Vec<RideRecord>, string> {
const rides = rideStorage.values().filter(ride => ride.providerId === providerId);
return Result.Ok(rides);
}
// Function to update the start location of a ride
$update;
export function updateRideStartLocation(id: string, newStartLocation: string): Result<RideRecord, string> {
return updateRide(id, { startLocation: newStartLocation });
}
// Function to update the end location of a ride
$update;
export function updateRideEndLocation(id: string, newEndLocation: string): Result<RideRecord, string> {
return updateRide(id, { endLocation: newEndLocation });
}
// Function to update the date of a ride
$update;
export function updateRideDate(id: string, newDate: string): Result<RideRecord, string> {
return updateRide(id, { date: newDate });
}
// Function to update the start time of a ride
$update;
export function updateRideStartTime(id: string, newStartTime: string): Result<RideRecord, string> {
return updateRide(id, { startTime: newStartTime });
}
// Function to update the end time of a ride
$update;
export function updateRideEndTime(id: string, newEndTime: string): Result<RideRecord, string> {
return updateRide(id, { endTime: newEndTime });
}
// Mocking the 'crypto' object for testing purposes
globalThis.crypto = {
// @ts-ignore
getRandomValues: () => {
let array = new Uint8Array(32);
 for (let i = 0; i < array.length; i++) {
   array[i] = Math.floor(Math.random() * 256);
 }
return array;
},
};
