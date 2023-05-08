[
  "departments",
  "categories",
  "subcategories",
  "brands",
  "models",
  "products",
  "orders",
].forEach((collectionName) => {
  db.runCommand({
    mapreduce: collectionName,
    map: function () {
      for (var key in this) {
        emit(key, null);
      }
    },
    reduce: function (key, stuff) {
      return null;
    },
    out: collectionName + "_keys",
  });
  print(
    collectionName + " ->> ",
    db[collectionName + "_keys"].distinct("_id").join(",")
  );
});
