import Brand from '../db/models/brand.js';

export async function createBrand({ brandName, description, assets }) {
  const brand = new Brand({
    brandName,
    description,
    assets,
  });

  return await brand.save();
}

async function listBrands(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await Brand.find(query).sort({ [sortBy]: sortOrder });
}

export async function listAllBrands(options) {
  return await listBrands({}, options);
}

export async function listBrandByBrandName(name) {
  return await listBrands({ brandName: name });
}

export async function getBrandById(brandId) {
  return await Brand.findById(brandId);
}

export async function updateBrand(brandId, { brandName, description, assets }) {
  return await Brand.findOneAndUpdate(
    { _id: brandId },
    {
      $set: {
        brandName,
        description,
        assets,
      },
    },
    { new: true },
  );
}

export async function deleteBrand(brandId) {
  return await Brand.deleteOne({ _id: brandId });
}

// Fetch brands based on search criteria
export async function searchBrands(criteria) {
  try {
    const query = {};
    if (criteria.brandName)
      query.brandName = new RegExp(criteria.brandName, 'i'); // Case-insensitive

    return await Brand.find(query);
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  }
}
