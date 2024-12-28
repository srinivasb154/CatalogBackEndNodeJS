import Category from '../db/models/category.js';

export async function createCategory({
  categoryName,
  url,
  parentCategory,
  description,
  sortOrder,
  isVisible,
  smartCategory,
  productMustWatch,
}) {
  const category = new Category({
    categoryName,
    url,
    parentCategory,
    description,
    sortOrder,
    isVisible,
    smartCategory,
    productMustWatch,
  });

  return await category.save();
}

async function listCategories(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await Category.find(query).sort({ [sortBy]: sortOrder });
}

export async function listAllCategories(options) {
  return await listCategories({}, options);
}

export async function listCategoryByCategoryName(name) {
  return await listCategories({ categoryName: name });
}

export async function getCategoryById(categoryId) {
  return await Category.findById(categoryId);
}

export async function updateCategory(
  categoryId,
  {
    categoryName,
    url,
    parentCategory,
    description,
    sortOrder,
    isVisible,
    smartCategory,
    productMustWatch,
  },
) {
  return await Category.findOneAndUpdate(
    { _id: categoryId },
    {
      $set: {
        categoryName,
        url,
        parentCategory,
        description,
        sortOrder,
        isVisible,
        smartCategory,
        productMustWatch,
      },
    },
    { new: true },
  );
}

export async function deleteCategory(categoryId) {
  return await Category.deleteOne({ _id: categoryId });
}

// Fetch categories based on search criteria
export async function searchCategories(criteria) {
  try {
    const query = {};
    if (criteria.categoryName)
      query.categorytName = new RegExp(criteria.categoryName, 'i'); // Case-insensitive

    if (criteria.parentCategory)
      query.parentCategory = new RegExp(criteria.parentCategory, 'i'); // Case-insensitive

    return await Category.find(query);
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  }
}
