import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(distance: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    const miles = distance * 0.621371;
    return miles.toFixed(2);
  }
  return distance.toFixed(2);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPace(seconds: number, distance: number, unit: 'km' | 'mi' = 'km'): string {
  if (distance === 0) return '--:--';
  
  const totalMins = seconds / 60;
  const pace = totalMins / (unit === 'mi' ? distance * 0.621371 : distance);
  const paceMin = Math.floor(pace);
  const paceSec = Math.floor((pace - paceMin) * 60);
  
  return `${paceMin}'${paceSec.toString().padStart(2, '0')}"`;
}

export function formatTokenAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

export function calculateProgressPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  const percentage = (current / total) * 100;
  return Math.min(100, Math.max(0, percentage));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function calculateReward(distanceKm: number): number {
  // Base reward: 1 MOVE token per km
  let reward = distanceKm;
  
  // Bonus reward for longer distances (encourages sustained movement)
  if (distanceKm > 5) {
    reward += distanceKm * 0.1; // 10% bonus for distances over 5km
  }
  
  // Apply rounding to 2 decimal places to avoid tiny fractional tokens
  return Math.round(reward * 100) / 100;
}

// Function to calculate cumulative rewards based on user's streak
export function calculateStreakBonus(
  baseReward: number, 
  consecutiveDays: number
): number {
  // No bonus for less than 2 days
  if (consecutiveDays < 2) return baseReward;
  
  // Cap the bonus multiplier at 7 days (50% max bonus)
  const maxDays = 7;
  const cappedDays = Math.min(consecutiveDays, maxDays);
  
  // 10% bonus for each consecutive day (after the first)
  const bonusMultiplier = 1 + ((cappedDays - 1) * 0.1);
  
  return Math.round((baseReward * bonusMultiplier) * 100) / 100;
}

// Function to calculate time-based rewards (peak hours)
export function calculateTimeBonus(
  baseReward: number, 
  currentTime: Date = new Date()
): number {
  const hour = currentTime.getHours();
  
  // Early morning (5-7 AM) or evening (6-8 PM) bonus to encourage 
  // activity during less busy times
  if ((hour >= 5 && hour <= 7) || (hour >= 18 && hour <= 20)) {
    return Math.round((baseReward * 1.15) * 100) / 100; // 15% bonus
  }
  
  return baseReward;
}

// Anti-cheat: Check if location change is reasonable
export function isLocationChangeReasonable(
  prevLat: number, 
  prevLng: number, 
  newLat: number, 
  newLng: number, 
  timeElapsedMs: number
): boolean {
  // Calculate distance between previous and new locations in meters
  const distance = calculateHaversineDistance(prevLat, prevLng, newLat, newLng);
  
  // Calculate max possible distance based on time elapsed (assuming max human speed of 10 m/s)
  const maxPossibleDistance = (timeElapsedMs / 1000) * 10;
  
  // Allow some buffer (e.g., 20% more than theoretical max)
  return distance <= maxPossibleDistance * 1.2;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateHaversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}
