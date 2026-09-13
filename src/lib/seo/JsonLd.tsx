import React from 'react';
import { serializeJsonLd, type JsonLdNode } from './structured-data';

/**
 * Structured data as a native <script> tag, rendered on the server. Neither
 * Next.js nor vinext has a Metadata API field for JSON-LD; Next.js's guide
 * renders it this way.
 */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
