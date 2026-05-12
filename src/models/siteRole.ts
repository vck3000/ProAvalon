import mongoose from 'mongoose';
import type { ISiteRole } from './types/siteRole';
import { PowerRole } from './types/siteRole';

// SCHEMA SETUP
const siteRoleSchema = new mongoose.Schema<ISiteRole>({
  role: {
    type: String,
    enum: Object.values(PowerRole),
    required: true,
  },
  usernameLower: String,
});

// compile schema into a model
export default mongoose.model<ISiteRole>('SiteRole', siteRoleSchema);