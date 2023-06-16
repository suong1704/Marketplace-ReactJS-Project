const config = require("platformsh-config").config();
let dbRelationshipMongo = "mongodatabase";

// Strapi default sqlite settings.
let settings = {
  client: "sqlite",
  filename: process.env.DATABASE_FILENAME || ".tmp/data.db",
};

let options = {
  useNullAsDefault: true,
};

if (config.isValidPlatform() && !config.inBuild()) {
  // Platform.sh database configuration.
  const credentials = config.credentials(dbRelationshipMongo);

  console.log(
    `Using Platform.sh configuration with relationship ${dbRelationshipMongo}.`
  );

  settings = {
    client: "mongo",
    host: env("DATABASE_HOST", "localhost"),
    port: env.int("DATABASE_PORT", 5432),
    database: env("DATABASE_NAME", "strapi"),
    user: env("DATABASE_USERNAME", "strapi"),
    password: env("DATABASE_PASSWORD", "strapi"),
  };

  options = {
    ssl: false,
    authenticationDatabase: "main",
  };
} else {
  if (config.isValidPlatform()) {
    // Build hook configuration message.
    console.log(
      "Using default configuration during Platform.sh build hook until relationships are available."
    );
  } else {
    // Strapi default local configuration.
    console.log(
      "Not in a Platform.sh Environment. Using default local sqlite configuration."
    );
  }
}

module.exports = {
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: settings,
      options: options,
    },
  },
};
