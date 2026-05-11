import mongoose from 'mongoose';
import type { ISiteRole } from './types/siteRole';

// SCHEMA SETUP
const siteRoleSchema = new mongoose.Schema<ISiteRole>({
  role: String,
  usernameLower: String,
});

// compile schema into a model
export default mongoose.model<ISiteRole>('SiteRole', siteRoleSchema);