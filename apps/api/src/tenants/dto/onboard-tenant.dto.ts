import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OnboardTenantDto {
  @ApiProperty({
    description: 'Name of the bakery business / tenant organization',
    example: 'Artisan Sourdough Bakery',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description:
      'Name of the primary branch created during onboarding (defaults to Main Branch)',
    example: 'Downtown Flagship',
    required: false,
  })
  @IsString()
  @IsOptional()
  branchName?: string;

  @ApiProperty({
    description: 'Optional initial department override',
    example: 'Main Bakery',
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentName?: string;
}
