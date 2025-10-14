declare module "isomorphic-dompurify" {
  const DOMPurify: {
    sanitize: (dirty: string, options?: Record<string, any>) => string;
  };
  export default DOMPurify;
}
