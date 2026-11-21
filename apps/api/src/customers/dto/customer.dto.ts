import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer trading or individual display name',
    example: 'Sunrise Cafe & Bistro',
  })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty({
    description: 'External accounting or POS reference identifier',
    example: 'CUST-REF-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalReference?: string;

  @ApiProperty({
    description: 'Primary contact phone number',
    example: '+2348012345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Billing and order confirmation email address',
    example: 'procurement@sunrisecafe.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description:
      'Maximum credit ceiling balance allowed before orders require upfront payment',
    example: '5000.0000',
    required: false,
    default: '0.0000',
  })
  @IsString()
  @IsOptional()
  creditCeiling?: string;

  @ApiProperty({
    description: 'ISO currency code for credit and receivable ledger balances',
    example: 'USD',
    required: false,
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;
}
