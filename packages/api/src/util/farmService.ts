import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import FarmModel from '../models/farmModel.js'; // adjust path if needed

dayjs.extend(utc);

/**
 * Retrieves the farm's UTC offset (in seconds) from the database and returns the value in minutes.
 *
 * TODO: Guarantee timezone information on database.
 *
 * AI-assisted JSDOC
 *
 * @param farmId The ID of the farm to retrieve the UTC offset for.
 * @returns The utc offset in minutes.
 */
async function getFarmUtcOffsetInMinutes(farmId: string): Promise<number> {
  const { utc_offset } = await FarmModel.getFarmUtcOffset(farmId);
  // If null or undefined, return zero
  return utc_offset ? utc_offset / 60 : 0;
}

/**
 * Returns the current date and time in the farm's local time, formatted as an ISO 8601 string.
 *
 * ** TODO: Use timezone instead of offset as it contains DST data **
 *
 * AI-assisted JSDOC
 *
 * @param farmId The ID of the farm to retrieve the UTC offset for.
 * @returns A string representing the current datetime in the farm's local time and correct UTC offset (e.g., "-08:00").
 */
export async function farmDate(farmId: string): Promise<string> {
  // Get current UTC time, then apply offset
  return dayjs
    .utc()
    .utcOffset(await getFarmUtcOffsetInMinutes(farmId))
    .format();
}

/**
 * Returns the zero-th second of the current date and time in the farm's local time, formatted as an ISO 8601 string.
 *
 * Use case: External query date ranges, start-date timestamp.
 *
 * ** TODO: Use timezone instead of offset as it contains DST data **
 *
 * AI-assisted JSDOC
 *
 * @param farmId The ID of the farm to retrieve the UTC offset for.
 * @returns A string representing the zero-th second of the current datetime in the farm's local time and correct UTC offset (e.g., "-08:00").
 */
export async function startOfFarmDate(farmId: string): Promise<string> {
  // Get current UTC time, then apply offset
  return dayjs
    .utc()
    .utcOffset(await getFarmUtcOffsetInMinutes(farmId))
    .startOf('day')
    .format();
}

/**
 * Returns the last second of the current date and time in the farm's local time, formatted as an ISO 8601 string.
 *
 * Use case: External query date ranges, due-date timestamp.
 *
 * ** TODO: Use timezone instead of offset as it contains DST data **
 *
 * AI-assisted JSDOC
 *
 * @param farmId The ID of the farm to retrieve the UTC offset for.
 * @returns A string representing the last second of the current datetime in the farm's local time and correct UTC offset (e.g., "-08:00").
 */
export async function endOfFarmDate(farmId: string): Promise<string> {
  // Get current UTC time, then apply offset
  return dayjs
    .utc()
    .utcOffset(await getFarmUtcOffsetInMinutes(farmId))
    .endOf('day')
    .format();
}
