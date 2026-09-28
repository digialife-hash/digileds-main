export function asyncHandler(handler) {
  return async function wrappedAsyncHandler(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default asyncHandler;
