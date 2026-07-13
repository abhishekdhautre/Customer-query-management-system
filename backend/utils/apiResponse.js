export const successResponse = (data, meta = null) => ({
  success: true,
  data,
  ...(meta && { meta }),
});
