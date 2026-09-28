export function successResponse(res, payload = {}, status = 200) {
  return res.status(status).json({ success: true, ...payload });
}

export function errorResponse(res, message, status = 500, extra = {}) {
  return res.status(status).json({ success: false, message, ...extra });
}
