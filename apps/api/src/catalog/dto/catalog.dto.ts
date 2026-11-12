import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCatalogItemDto {
  @ApiProperty({
    description:
      'Inventory item classification (RAW_MATERIAL, FINISHED_GOOD, PACKAGING)',
    example: 'RAW_MATERIAL',
  })
  @IsString()
  @IsNotEmpty()
  itemType!: string;

  @ApiProperty({
    description: 'Unique Stock Keeping Unit (SKU) identifier',
    example: 'FLOUR-WHEAT-50KG',
  })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({
    description: 'Item descriptive title',
    example: 'Premium Golden Wheat Flour 50kg',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Category grouping (e.g. Dry Ingredients, Dairy, Loaves)',
    example: 'Dry Ingredients',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Unit of Measure code (EACH, GRAM, KILOGRAM, BAG, LITRE)',
    example: 'BAG',
  })
  @IsString()
  @IsNotEmpty()
  uom!: string;

  @ApiProperty({
    description: 'Default unit selling price (if applicable)',
    example: '45.0000',
    required: false,
  })
  @IsString()
  @IsOptional()
  sellingPrice?: string;

  @ApiProperty({
    description: 'ISO currency code for price',
    example: 'USD',
    required: false,
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;
}
