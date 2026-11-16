import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'UUID of the branch location where this department is hosted',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({
    description: 'Department name',
    example: 'Specialty Pastry Lab',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description:
      'Short uppercase code identifying the department within the branch',
    example: 'PASTRY',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Department functional classification type',
    example: 'PRODUCTION',
    required: false,
    default: 'CUSTOM',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description:
      'Operational scope description for shift assignments and staff guidance',
    example: 'Specialty pastry & artisan confection floor',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiProperty({
    description: 'Updated department name',
    example: 'Cold Room Staging & Storage',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Updated code within the branch',
    example: 'COLD',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Updated functional classification type',
    example: 'STORE',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Updated department description',
    example: 'Temperature-controlled storage room',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Operational state of the department',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'INACTIVE',
    required: false,
  })
  @IsIn(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}
