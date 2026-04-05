export type FieldErrors = Record<string, string[]>;

export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: FieldErrors;
    };
