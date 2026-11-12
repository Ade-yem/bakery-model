import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    description:
      'User authentication identifier to associate with tenant membership',
    example: 'auth-user-jane-123',
  })
  @IsString()
  @IsNotEmpty()
  authUserId!: string;

  @ApiProperty({
    description: 'Staff member display or legal name within this bakery',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty({
    description: 'Assigned tenant role code',
    example: 'RECEPTIONIST',
  })
  @IsString()
  @IsNotEmpty()
  roleKey!: string;

  @ApiProperty({
    description:
      'Array of branch UUIDs the staff member is authorized to access',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  branchIds?: string[];

  @ApiProperty({
    description:
      'Array of department UUIDs the staff member is authorized to access',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  departmentIds?: string[];

  @ApiProperty({
    description: 'Initial membership status',
    enum: ['INVITED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
    example: 'ACTIVE',
    required: false,
    default: 'ACTIVE',
  })
  @IsIn(['INVITED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])
  @IsOptional()
  status?: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export class UpdateStaffAccessDto {
  @ApiProperty({
    description: 'Updated role key assignment',
    example: 'MANAGER',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleKey?: string;

  @ApiProperty({
    description:
      'Array of optional custom permissions (must not exceed role ceiling)',
    example: ['orders:read', 'orders:create'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  customPermissions?: string[];

  @ApiProperty({
    description: 'Updated branch scope UUIDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  branchIds?: string[];

  @ApiProperty({
    description: 'Updated department scope UUIDs',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  departmentIds?: string[];
}

export class UpdateStaffStatusDto {
  @ApiProperty({
    description: 'Target operational status for the staff membership',
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
    example: 'INACTIVE',
  })
  @IsIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  @IsNotEmpty()
  status!: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}
