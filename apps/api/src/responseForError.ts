import { Response } from 'express';
import {
  FarmMismatchError,
  LiteFarmError,
  UnauthorizedActionError,
} from '@litefarm/domain/errors';
import { TaskNotFoundError } from '@litefarm/domain/tasks';

export const responseForError =
  (response: Response) =>
  (error: LiteFarmError): Response => {
    if (TaskNotFoundError.is(error)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(404).send(error.message);
    } else if (FarmMismatchError.is(error)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(403).send('user not authorized to access farm');
    } else if (UnauthorizedActionError.is(error)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(403).send(error.message);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore until TypeScript update (cf https://github.com/DefinitelyTyped/DefinitelyTyped/issues/62300)
      return response.status(400).json({ error });
    }
  };
