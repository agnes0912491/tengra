declare module "isomorphic-dompurify" {
  const DOMPurify: {
    sanitize: (dirty: string, options?: Record<string, unknown>) => string;
  };
  export default DOMPurify;
}
