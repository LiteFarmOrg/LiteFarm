import { NextFunction, Request, Response } from 'express';

export interface HttpError extends Error {
  status?: number;
  code?: number; // LF custom error
}

// TODO: Remove farm_id conditional and cast this in a checkScope() that takes the function and casts this to req
export interface LiteFarmRequest<QueryParams = unknown>
  extends Request<unknown, unknown, unknown, QueryParams> {
  headers: Request['headers'] & {
    farm_id?: string;
  };
}

// Can be used to cast after checkScope() succeeds
export type LiteFarmHandler<QueryParams = unknown> = (
  req: LiteFarmRequest<QueryParams>,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;
