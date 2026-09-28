const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message === "Network Error") {
    return "Unable to reach the server. Please check your connection.";
  }

  return fallback;
};

export default getApiErrorMessage;
