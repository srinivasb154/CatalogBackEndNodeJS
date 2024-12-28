import mongoose from 'mongoose';
import { describe, expect, test, beforeEach } from '@jest/globals';

import {
  createBrand,
  listAllBrands,
  listBrandByBrandName,
  getBrandById,
  updateBrand,
  deleteBrand,
} from '../services/brands.js';

import Brand from '../db/models/brand.js';

describe('creating brands', () => {
  test('with all parameters should succeed', async () => {
    const brand = {
      brandName: 'Brand 1',
      description: 'Brand 1 Description',
      assets: 'test',
    };

    const createdBrand = await createBrand(brand);
    expect(createdBrand._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const foundBrand = await Brand.findById(createdBrand._id);
    expect(foundBrand).toEqual(expect.objectContaining(brand));
    expect(foundBrand.createdAt).toBeInstanceOf(Date);
    expect(foundBrand.updatedAt).toBeInstanceOf(Date);
  });
});

const sampleBrands = [
  {
    brandName: 'Brand 11',
    description: 'Brand 11 Description',
    assets: 'test1',
  },
  {
    brandName: 'Brand12',
    description: 'Brand 12 Description',
    assets: 'test2',
  },
  {
    brandName: 'Brand 13',
    description: 'Brand 13 Description',
    assets: 'test3',
  },
];

let createdSampleBrands = [];

beforeEach(async () => {
  await Brand.deleteMany({});
  createdSampleBrands = [];
  for (const brand of sampleBrands) {
    const createdBrand = new Brand(brand);
    createdSampleBrands.push(await createdBrand.save());
  }
});

describe('listing brands', () => {
  test('should return brands sorted by creation date descending by default', async () => {
    const brands = await listAllBrands();
    const sortedSampleBrands = createdSampleBrands.sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    expect(brands.map((brand) => brand.createdAt)).toEqual(
      sortedSampleBrands.map((brand) => brand.createdAt),
    );
  });

  test('should be able to filter brand by brandName', async () => {
    const brands = await listBrandByBrandName('Brand12');
    expect(brands.length).toBe(1);
    expect(brands[0].brandName).toEqual('Brand12');
    expect(brands[0].description).toEqual('Brand 12 Description');
  });
});

describe('getting a brand', () => {
  test('should return the full brand', async () => {
    const brand = await getBrandById(createdSampleBrands[0]._id);
    expect(brand.toObject()).toEqual(createdSampleBrands[0].toObject());
  });

  test('should fail if the id does not exist', async () => {
    const brand = await getBrandById('000000000000000000000000');
    expect(brand).toEqual(null);
  });
});

describe('updating brands', () => {
  test('should update the specified property', async () => {
    await updateBrand(createdSampleBrands[0]._id, {
      brandName: 'Brand 111',
    });
    const updatedBrand = await Brand.findById(createdSampleBrands[0]._id);
    expect(updatedBrand.brandName).toEqual('Brand 111');
  });

  test('should not update other properties', async () => {
    await updateBrand(createdSampleBrands[0]._id, {
      brandName: 'Brand 111',
    });
    const updatedBrand = await Brand.findById(createdSampleBrands[0]._id);
    expect(updatedBrand.assets).toEqual('test1');
  });

  test('should update the updatedAt timestamp', async () => {
    await updateBrand(createdSampleBrands[0]._id, {
      brandName: 'Brand 111',
    });
    const updatedBrand = await Brand.findById(createdSampleBrands[0]._id);
    expect(updatedBrand.updatedAt.getTime()).toBeGreaterThan(
      createdSampleBrands[0].updatedAt.getTime(),
    );
  });

  test('should fail if the id does not exist', async () => {
    const brand = await updateBrand('000000000000000000000000', {
      brandName: 'Brand 111',
    });
    expect(brand).toEqual(null);
  });
});

describe('deleting brands', () => {
  test('should remove the brand from the database', async () => {
    const result = await deleteBrand(createdSampleBrands[0]._id);
    expect(result.deletedCount).toEqual(1);
    const deletedBrand = await Brand.findById(createdSampleBrands[0]._id);
    expect(deletedBrand).toEqual(null);
  });

  test('should fail if the id does not exist', async () => {
    const result = await deleteBrand('000000000000000000000000');
    expect(result.deletedCount).toEqual(0);
  });
});
