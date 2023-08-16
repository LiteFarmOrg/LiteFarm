import { Response } from 'express';
import { LiteFarmError } from '../../domain/errors/LiteFarmError';
import TaskNotFoundError from '../../domain/tasks/errors/TaskNotFoundError';
import FarmMismatchError from '../../domain/errors/FarmMismatchError';
import UnauthorizedActionError from '../../domain/errors/UnauthorizedActionError';

export const responseForError =
  (response: Response) =>
  (error: LiteFarmError): Response => {
    if (TaskNotFoundError.is(error)) {
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(404).send(error.message);
    } else if (FarmMismatchError.is(error)) {
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(403).send('user not authorized to access farm');
    } else if (UnauthorizedActionError.is(error)) {
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(403).send(error.message);
    } else {
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(400).json({ error });
    }
  };
