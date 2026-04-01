export function withId(doc: any): any {
  if (!doc) return doc;
  return { ...doc, id: doc._id?.toString() };
}

export function withIds(docs: any[]): any[] {
  return docs.map(withId);
}
