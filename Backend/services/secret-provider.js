export function createSecretProvider(env = process.env) {
  const configured = env.SECRET_PROVIDER;

  if (configured && configured !== "env") {
    console.warn(
      `Secret provider "${configured}" is not installed; using environment fallback.`,
    );
  }

  return {
    get(name, fallback = undefined) {
      const value = env[name];

      return value === undefined || value === "" ? fallback : value;
    },

    required(name) {
      const value = env[name];

      if (!value) {
        throw new Error(`Required secret "${name}" is not configured`);
      }

      return value;
    },
  };
}

export default createSecretProvider();
