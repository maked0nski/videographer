import type { SchemaTypeDefinition } from "sanity";
import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import project from "./project";
import profile from "./profile";
import siteSettings from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  localeString,
  localeText,
  project,
  profile,
  siteSettings,
];
