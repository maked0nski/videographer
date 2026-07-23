import type { SchemaTypeDefinition } from "sanity";
import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { btsVideoClip } from "./objects/btsVideoClip";
import project from "./project";
import profile from "./profile";
import siteSettings from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  localeString,
  localeText,
  btsVideoClip,
  project,
  profile,
  siteSettings,
];
