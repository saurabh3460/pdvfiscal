// prettier-ignore
// db.roles.insert({
//   name: "representative",
//   roleNumber: 8,
//   operations: { "2": 2, "1": 1, "3": 1 },
// });

// id = new ObjectId();

// db.organizations.remove({ title: "Super Admin" });
// db.organizations.insert({
//   title: "Super Admin",
//   description: "",
//   branches: [],
//   _id: id,
// });

// db.admins.remove({ email: "superadmin@gmail.com" });
// https://www.browserling.com/tools/bcrypt/ go here type pain password and rounds should be 10
// db.admins.insert({
//   email: "superadmin@gmail.com",
//   password: "$2a$08$0eghXCyt/21wG6uB2FVOJ.H9FbiXbyf31e3RwouijYTELj3PxSVLG",
//   name: "Super Admin",
//   organizationId: id,
//   roleNumber: 1,
//   phoneNumber: "0000000000",
//   status: "",
//   createdAt: ISODate("0001-01-01T00:00:00Z"),
// });

//  https://docs.mongodb.com/manual/core/schema-validation/

db.runCommand({
  collMod: "cheques",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "departments",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
      properties: {
        organizationId: {
          bsonType: "objectId",
        },
      },
    },
  },
  validationLevel: "moderate",
});
db.runCommand({
  collMod: "brands",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "models",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "categories",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "subcategories",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "orders",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "products",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "expenses",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.runCommand({
  collMod: "expensePayments",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["organizationId"],
    },
  },
  validationLevel: "moderate",
});

db.clients.createIndex({ email: 1 }, { unique: true });

db.users.createIndex(
  {
    identificationNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      identificationNumber: { $type: "string" },
    },
  }
);
