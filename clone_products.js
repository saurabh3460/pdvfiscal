// prettier-ignore

const inputOrganizationId = ObjectId("5fa56ab6bfdf377af7b6ae05");
const outputOrganizationId = ObjectId("606c9beebfdf37b3c63bd420");
const departmentId = ObjectId("605a1b6c24415ebc927a8136");

const departmentsMap = {};
const categoryMap = {};
const subcategoryMap = {};
const brandMap = {};
const modelMap = {};

db.departments.find({ organizationId: inputOrganizationId, _id: departmentId }).forEach((p) => {
  print("department name", p.title)
  const _id = ObjectId();
  departmentsMap[p._id.valueOf()] = _id;
  p._id = _id;
  p.organizationId = outputOrganizationId;
  p._cloned = true;
  db.departments.insert(p);
});
db.categories.find({ organizationId: inputOrganizationId,departmentId: departmentId }).forEach((p) => {
  const _id = ObjectId();
  categoryMap[p._id.valueOf()] = _id;
  p._id = _id;
  p.organizationId = outputOrganizationId;
  p.departmentId = departmentsMap[p.departmentId.valueOf()];
  p._cloned = true;
  db.categories.insert(p);
});
db.subcategories.find({ organizationId: inputOrganizationId }).forEach((p) => {
  const _id = ObjectId();
  subcategoryMap[p._id.valueOf()] = _id;
  p._id = _id;
  p.organizationId = outputOrganizationId;
  p.categoryId = categoryMap[p.categoryId.valueOf()];
  if (!p.categoryId) return;
  p._cloned = true;
  db.subcategories.insert(p);
});
db.brands.find({ organizationId: inputOrganizationId, }).forEach((p) => {
  const _id = ObjectId();
  brandMap[p._id.valueOf()] = _id;
  p._id = _id;
  p.organizationId = outputOrganizationId;
  p._cloned = true;
  db.brands.insert(p);
});
db.models.find({ organizationId: inputOrganizationId }).forEach((p) => {
  const _id = ObjectId();
  modelMap[p._id.valueOf()] = _id;
  p._id = _id;
  p.organizationId = outputOrganizationId;
  p._cloned = true;
  p.brandId = brandMap[p.brandId.valueOf()];

  db.models.insert(p);
});

const productsMap = {};

db.products.find({ organizationId: inputOrganizationId, departmentId: departmentId }).forEach((p) => {
    const _id = ObjectId();
    productsMap[p._id.valueOf()] = _id;
    p._id = _id;
    p.organizationId = outputOrganizationId;
    p._cloned = true;

    if (!p.departmentId) return;
    if (!p.brandId) return;
    if (!p.modelId) return;
    if ((p.kitProducts || []).length > 0) return;

    if (!departmentsMap[p.departmentId.valueOf()]) return;
    if (!brandMap[p.brandId.valueOf()]) return;
    if (!modelMap[p.modelId.valueOf()]) return;

    p.departmentId = departmentsMap[p.departmentId.valueOf()];
    p.brandId = brandMap[p.brandId.valueOf()];
    p.modelId = modelMap[p.modelId.valueOf()];

    db.products.insert(p);
  });

db.products.find({organizationId: inputOrganizationId, departmentId: departmentId,"kitProducts.1": { $exists: true } }).forEach((p) => {
    const _id = ObjectId();
    productsMap[p._id.valueOf()] = _id;
    p._id = _id;
    p.organizationId = outputOrganizationId;
    p._cloned = true;

    if (!p.departmentId) return;
    if (!p.brandId) return;
    if (!p.modelId) return;
    if ((p.kitProducts || []).length === 0) return;

    p.kitProducts = p.kitProducts.map((k) => ({...k,_id: productsMap[k._id.valueOf()]}));
    // p.kitProducts = p.kitProducts.map((k) => Object.assign( obj, {_id: productsMap[k._id.valueOf()]}));

    if (!departmentsMap[p.departmentId.valueOf()]) return;
    if (!brandMap[p.brandId.valueOf()]) return;
    if (!modelMap[p.modelId.valueOf()]) return;

    p.departmentId = departmentsMap[p.departmentId.valueOf()];
    p.brandId = brandMap[p.brandId.valueOf()];
    p.modelId = modelMap[p.modelId.valueOf()];

    db.products.insert(p);
  });

// TO delete all cloned data
// db.products.remove({ _cloned: true });
// db.departments.remove({ _cloned: true });
// db.brands.remove({ _cloned: true });
// db.categories.remove({ _cloned: true });
// db.subcategories.remove({ _cloned: true });
// db.models.remove({ _cloned: true });

// db.clients.find().forEach((client) => {
//   db.clients.update(
//     { _id: client._id },
//     { $set: { email: client._id.valueOf() + "@email.com" } }
//   );
// });

// db.admins.find().forEach((user) => {
//   const [firstName, ...lastName] = user.name.split(" ");
//   db.admins.update(
//     { _id: user._id },
//     {
//       $set: {
//         firstName: firstName,
//         lastName: lastName.join(" "),
//         landlineNumber: user.phoneNumber,
//       },
//     }
//   );
// });

// db.users.createIndex(
//   {
//     identificationNumber: 1,
//   },
//   {
//     unique: true,
//     partialFilterExpression: {
//       identificationNumber: { $type: "string" },
//     },
//   }
// );

// db.clients.find().forEach((client) => {
//   db.clients.update(
//     { _id: client._id },
//     {
//       $set: {
//         identificationType: client.cpf ? "pf" : "",
//         identificationNumber: client.cpf || null,
//       },
//     }
//   );
// });

// db.products.find().forEach((p) => {
//   if ((p.productIds || []).length > 0) {
//     const kitProducts = p.productIds.map((_id) => {
//       const p = db.products.findOne({ _id });
//       return { _id, quantity: 1, price: p.price, cost: p.cost };
//     });
//     db.products.update({ _id: p._id }, { $set: { kitProducts: kitProducts } });
//   }
// });
