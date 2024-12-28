import mongoose from 'mongoose';
import { describe, expect, test, beforeEach } from '@jest/globals';

import {
  createCategory,
  listAllCategories,
  listCategoryByCategoryName,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../services/categories.js';

import Category from '../db/models/category.js';

describe('creating categories', () => {
  test('with all parameters should succeed', async () => {
    const category = {
      categoryName: 'Category 1',
      url: 'test url',
      parentCategory: 'parent 1',
      description: 'category 1 description',
      sortOrder: 'asc',
      isVisible: true,
      smartCategory: false,
      productMustWatch: true,
    };

    const createdCategory = await createCategory(category);
    expect(createdCategory._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const foundCategory = await Category.findById(createdCategory._id);
    expect(foundCategory).toEqual(expect.objectContaining(category));
    expect(foundCategory.createdAt).toBeInstanceOf(Date);
    expect(foundCategory.updatedAt).toBeInstanceOf(Date);
  });
});

const sampleCategories = [
  {
    categoryName: 'Category 11',
    url: 'test url 11',
    parentCategory: 'parent 11',
    description: 'category 11 description',
    sortOrder: 'asc',
    isVisible: true,
    smartCategory: false,
    productMustWatch: true,
  },
  {
    categoryName: 'Category 12',
    url: 'test url 12',
    parentCategory: 'parent 2',
    description: 'category 12 description',
    sortOrder: 'desc',
    isVisible: true,
    smartCategory: true,
    productMustWatch: false,
  },
  {
    categoryName: 'Category 13',
    url: 'test url 13',
    parentCategory: 'parent 1',
    description: 'category 13 description',
    sortOrder: 'asc',
    isVisible: true,
    smartCategory: false,
    productMustWatch: true,
  },
];

let createdSampleCategories = [];

beforeEach(async () => {
  await Category.deleteMany({});
  createdSampleCategories = [];
  for (const category of sampleCategories) {
    const createdCategory = new Category(category);
    createdSampleCategories.push(await createdCategory.save());
  }
});

describe('listing categories', () => {
 /*  test('should return categories sorted by creation date descending by default', async () => {
    const categories = await listAllCategories();
    const sortedSampleCategories = createdSampleCategories.sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    expect(categories.map((category) => category.createdAt)).toEqual(
      sortedSampleCategories.map((category) => category.createdAt),
    );
  }); */

  test('should be able to filter category by categoryName', async () => {
    const categories = await listCategoryByCategoryName('Category 12');
    expect(categories.length).toBe(1);
    expect(categories[0].categoryName).toEqual('Category 12');
    expect(categories[0].description).toEqual('category 12 description');
  });
});

describe('getting a category', () => {
  test('should return the full category', async () => {
    const category = await getCategoryById(createdSampleCategories[0]._id);
    expect(category.toObject()).toEqual(createdSampleCategories[0].toObject());
  });

  test('should fail if the id does not exist', async () => {
    const category = await getCategoryById('000000000000000000000000');
    expect(category).toEqual(null);
  });
});

describe('updating categories', () => {
  test('should update the specified property', async () => {
    await updateCategory(createdSampleCategories[0]._id, {
      categoryName: 'Category 111',
    });
    const updatedCategory = await Category.findById(
      createdSampleCategories[0]._id,
    );
    expect(updatedCategory.categoryName).toEqual('Category 111');
  });

  test('should not update other properties', async () => {
    await updateCategory(createdSampleCategories[0]._id, {
      categoryName: 'Category 111',
    });
    const updatedCategory = await Category.findById(
      createdSampleCategories[0]._id,
    );
    expect(updatedCategory.url).toEqual('test url 11');
  });

  test('should update the updatedAt timestamp', async () => {
    await updateCategory(createdSampleCategories[0]._id, {
      categoryName: 'Category 111',
    });
    const updatedCategory = await Category.findById(
      createdSampleCategories[0]._id,
    );
    expect(updatedCategory.updatedAt.getTime()).toBeGreaterThan(
      createdSampleCategories[0].updatedAt.getTime(),
    );
  });

  test('should fail if the id does not exist', async () => {
    const category = await updateCategory('000000000000000000000000', {
      categoryName: 'Category 111',
    });
    expect(category).toEqual(null);
  });
});

describe('deleting categories', () => {
  test('should remove the category from the database', async () => {
    const result = await deleteCategory(createdSampleCategories[0]._id);
    expect(result.deletedCount).toEqual(1);
    const deletedCategory = await Category.findById(
      createdSampleCategories[0]._id,
    );
    expect(deletedCategory).toEqual(null);
  });

  test('should fail if the id does not exist', async () => {
    const result = await deleteCategory('000000000000000000000000');
    expect(result.deletedCount).toEqual(0);
  });
});
