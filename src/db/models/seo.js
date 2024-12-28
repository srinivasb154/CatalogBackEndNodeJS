import mongoose, { Schema } from 'mongoose';

const seoSchema = new Schema(
    {
      pageTitle: { type: String, required: true },
      searchKeywords: String,
      metaDescription: String,
      metaKeywords: String,
    }
);

const Seo = mongoose.model('Seo', seoSchema);

module.exports = { Seo };