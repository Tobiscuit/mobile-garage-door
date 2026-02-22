import type { CollectionBeforeChangeHook } from 'payload';
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical';
import configPromise from '@payload-config';

interface FieldMap {
  [sourceHtmlField: string]: string; // Maps 'description_html' -> 'description'
}

interface AdapterOptions {
  /**
   * Whether to clear the source HTML field after conversion.
   * Defaults to true to match original behavior.
   * Set to false if you want to persist the HTML (e.g. for re-editing in custom dashboards).
   */
  cleanup?: boolean;
}

/**
 * Creates a beforeChange hook that converts HTML strings from source fields
 * into Lexical JSON for target fields.
 * 
 * @param fieldMap Object mapping source HTML field names to target RichText field names
 * @param options Configuration options
 */
export const generateHtmlToLexicalHook = (fieldMap: FieldMap, options: AdapterOptions = { cleanup: true }): CollectionBeforeChangeHook => {
  return async ({ data, req }) => {
    // Process each mapping
    for (const [sourceField, targetField] of Object.entries(fieldMap)) {
      if (data[sourceField]) {
        req.payload.logger.info(`Converting HTML in '${sourceField}' to Lexical AST for '${targetField}'`);
        
        try {
          // Dynamic editor config loading to ensure we have the latest
          const editorConfig = await editorConfigFactory.default({
            config: await configPromise,
          });

          const { JSDOM } = await import('jsdom');

          const lexicalJSON = await convertHTMLToLexical({
            editorConfig,
            html: data[sourceField],
            JSDOM,
          });

          // Populate the target Lexical field
          data[targetField] = lexicalJSON;
          
          // Clear the source HTML field if requested
          if (options.cleanup) {
            data[sourceField] = null;
          }
          
        } catch (err) {
          req.payload.logger.error({ err, sourceField, targetField }, "Failed to parse HTML to Lexical");
        }
      }
    }
    
    return data;
  };
};
