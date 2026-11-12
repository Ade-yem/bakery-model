import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsIn,
} from 'class-validator';
import { type PermissionKey } from '../permissions.js';

export class CreateRoleSwaggerDto {
  @ApiProperty({
    description: 'Unique uppercase role code within the tenant',
    example: 'HEAD_BAKER',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Human-readable role title',
    example: 'Head Artisan Baker',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Role functional description and scope',
    example:
      'Oversees bakehouse oven schedules, sponge mixing, and production batches',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Array of authorized department UUIDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  departmentIds?: string[];

  @ApiProperty({
    description: 'Array of permission keys assigned to this role',
    example: [
      'production:batches:read',
      'production:batches:manage',
      'catalog:items:read',
    ],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissions?: PermissionKey[];
}

export class UpdateRoleSwaggerDto {
  @ApiProperty({
    description: 'Updated role name',
    example: 'Senior Lead Baker',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Updated role description',
    example: 'Lead baker and shift mentor',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Role operational status',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
    required: false,
  })
  @IsIn(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    description: 'Updated department UUID mappings',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  departmentIds?: string[];

  @ApiProperty({
    description: 'Updated permission keys allowlist',
    example: ['production:batches:read'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissions?: PermissionKey[];
}

export class UpdateRolePermissionsSwaggerDto {
  @ApiProperty({
    description: 'Array of permission keys to grant to the role',
    example: ['orders:read', 'customers:read'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  permissions!: PermissionKey[];
}

export class CloneRoleSwaggerDto {
  @ApiProperty({
    description: 'Code of the source role to clone from',
    example: 'PRODUCTION_SUPERVISOR',
  })
  @IsString()
  @IsNotEmpty()
  sourceRoleKey!: string;

  @ApiProperty({
    description: 'Unique uppercase code for the new cloned role',
    example: 'PASTRY_LEAD',
  })
  @IsString()
  @IsNotEmpty()
  newRoleKey!: string;

  @ApiProperty({
    description: 'Title for the new cloned role',
    example: 'Pastry Kitchen Lead',
    required: false,
  })
  @IsString()
  @IsOptional()
  newRoleName?: string;

  @ApiProperty({
    description: 'Customized permission keys for the cloned role',
    example: ['production:batches:read', 'catalog:items:read'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissions?: PermissionKey[];
}
