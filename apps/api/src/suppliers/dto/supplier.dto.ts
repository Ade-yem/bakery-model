import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Supplier legal or commercial trade name',
    example: 'Golden Grain Milling Co.',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'External ERP / accounting vendor code',
    example: 'SUPP-MILL-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalReference?: string;

  @ApiProperty({
    description: 'Primary sales or account representative contact name',
    example: 'David Miller',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiProperty({
    description: 'Vendor phone number',
    example: '+2348098765432',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    description: 'Vendor purchase order and invoice email',
    example: 'sales@goldengrain.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactEmail?: string;
}
