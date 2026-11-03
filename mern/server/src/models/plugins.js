// Expose Mongo's _id as a plain string "id" and drop internals in JSON output
export function cleanJson(schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  });
}
