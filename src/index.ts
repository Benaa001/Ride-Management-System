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
  const review: RideReviewRecord = { id: uuidv4(), createdAt: ic.time(), ...payload };
  rideReviewStorage.insert(review.id, review);
  return Result.Ok(review);
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
  const reviews = rideReviewStorage.values().filter(review => review.rideId === rideId);
  if (reviews.length === 0) {
    return Result.Err("No reviews found for the ride");
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  return Result.Ok(averageRating);
}

// Function to add a ride
$update;
export function addRide(payload: RidePayload): Result<RideRecord, string> {
  const record: RideRecord = { id: uuidv4(), createdAt: ic.time(), updatedAt: Opt.None, ...payload };
  rideStorage.insert(record.id, record);
  return Result.Ok(record);
}

// Function to update a ride
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

// Function to search rides by start location
$query;
export function searchRidesByStartLocation(location: string): Result<Vec<RideRecord>, string> {
  const records = rideStorage.values();
  const filteredRides = records.filter(ride => ride.startLocation.toLowerCase() === location.toLowerCase());
  return Result.Ok(filteredRides);
}

// Function to filter rides by date range
$query;
export function filterRidesByDateRange(startDate: string, endDate: string): Result<Vec<RideRecord>, string> {
  const records = rideStorage.values();
  const filteredRides = records.filter(ride => ride.date >= startDate && ride.date <= endDate);
  return Result.Ok(filteredRides);
}

// Function to update the available seats for a ride
$update;
export function updateRideAvailableSeats(id: string, newAvailableSeats: number): Result<RideRecord, string> {
  return match(rideStorage.get(id), {
    Some: (record) => {
      const updatedRecord: RideRecord = { ...record, availableSeats: newAvailableSeats, updatedAt: Opt.Some(ic.time()) };
      rideStorage.insert(record.id, updatedRecord);
      return Result.Ok<RideRecord, string>(updatedRecord);
    },
    None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
  });
}

// Function to get all rides provided by a specific provider
$query;
export function getRidesByProvider(providerId: string): Result<Vec<RideRecord>, string> {
  const rides = rideStorage.values().filter(ride => ride.providerId === providerId);
  return Result.Ok(rides);
}

// Function to filter rides by end location
$query;
export function searchRidesByEndLocation(location: string): Result<Vec<RideRecord>, string> {
  const records = rideStorage.values();
  const filteredRides = records.filter(ride => ride.endLocation.toLowerCase() === location.toLowerCase());
  return Result.Ok(filteredRides);
}

// Function to filter rides by available seats
$query;
export function filterRidesByAvailableSeats(minSeats: number): Result<Vec<RideRecord>, string> {
  const records = rideStorage.values();
  const filteredRides = records.filter(ride => ride.availableSeats >= minSeats);
  return Result.Ok(filteredRides);
}

// Function to update the start location of a ride
$update;
export function updateRideStartLocation(id: string, newStartLocation: string): Result<RideRecord, string> {
  return match(rideStorage.get(id), {
    Some: (record) => {
      const updatedRecord: RideRecord = { ...record, startLocation: newStartLocation, updatedAt: Opt.Some(ic.time()) };
      rideStorage.insert(record.id, updatedRecord);
      return Result.Ok<RideRecord, string>(updatedRecord);
    },
    None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
  });
}

// Function to update the end location of a ride
$update;
export function updateRideEndLocation(id: string, newEndLocation: string): Result<RideRecord, string> {
  return match(rideStorage.get(id), {
    Some: (record) => {
      const updatedRecord: RideRecord = { ...record, endLocation: newEndLocation, updatedAt: Opt.Some(ic.time()) };
      rideStorage.insert(record.id, updatedRecord);
      return Result.Ok<RideRecord, string>(updatedRecord);
    },
    None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
  });
}

// Function to update the date of a ride
$update;
export function updateRideDate(id: string, newDate: string): Result<RideRecord, string> {
  return match(rideStorage.get(id), {
    Some: (record) => {
      const updatedRecord: RideRecord = { ...record, date: newDate, updatedAt: Opt.Some(ic.time()) };
      rideStorage.insert(record.id, updatedRecord);
      return Result.Ok<RideRecord, string>(updatedRecord);
    },
    None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
  });
}

// Function to update the start time of a ride
$update;
export function updateRideStartTime(id: string, newStartTime: string): Result<RideRecord, string> {
  return match(rideStorage.get(id), {
    Some: (record) => {
      const updatedRecord: RideRecord = { ...record, startTime: newStartTime, updatedAt: Opt.Some(ic.time()) };
      rideStorage.insert(record.id, updatedRecord);
      return Result.Ok<RideRecord, string>(updatedRecord);
    },
    None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
  });
}

// Function to update the end time of a ride
$update;
export function updateRideEndTime(id: string, newEndTime: string): Result<RideRecord, string> {
  return match(rideStorage.get(id), {
    Some: (record) => {
      const updatedRecord: RideRecord = { ...record, endTime: newEndTime, updatedAt: Opt.Some(ic.time()) };
      rideStorage.insert(record.id, updatedRecord);
      return Result.Ok<RideRecord, string>(updatedRecord);
    },
    None: () => Result.Err<RideRecord, string>(`Ride with id=${id} not found`)
  });
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
